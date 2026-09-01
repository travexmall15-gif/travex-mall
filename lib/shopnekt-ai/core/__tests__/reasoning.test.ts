import { describe, it, expect } from 'vitest'
import { decideNextAction } from '../reasoning/plan'
import type { ActiveTask } from '../../data-core'

describe('decideNextAction', () => {
  it('returns unknown when no intent was classified', () => {
    expect(decideNextAction(null, 0, null)).toEqual({ action: 'unknown' })
  })

  it('selects the correct tool for a read-only intent with no active task', () => {
    const r = decideNextAction('PRODUCT_SEARCH', 0.8, null)
    expect(r).toEqual({ action: 'executeTool', toolName: 'searchProducts', intentId: 'PRODUCT_SEARCH', requiresConfirmation: false })
  })

  it('requires confirmation for a consequential tool (createOrder)', () => {
    const r = decideNextAction('ORDER_CREATE', 0.8, null)
    expect(r.action).toBe('executeTool')
    if (r.action === 'executeTool') {
      expect(r.toolName).toBe('createOrder')
      expect(r.requiresConfirmation).toBe(true)
    }
  })

  it('requires confirmation for a seller consequential tool (createFlashDeal)', () => {
    const r = decideNextAction('CREATE_FLASH_DEAL', 0.8, null)
    expect(r.action).toBe('executeTool')
    if (r.action === 'executeTool') {expect(r.requiresConfirmation).toBe(true)}
  })

  it('asks for clarification when the active task has an unfilled required slot', () => {
    const activeTask: ActiveTask = {
      intentId: 'PRODUCT_SEARCH',
      slots: [
        { entityType: 'category', value: 'Phones', filled: true, filledAtTurn: 1 },
        { entityType: 'price', value: null, filled: false, filledAtTurn: null },
      ],
      readyToExecute: false,
    }
    const r = decideNextAction('PRODUCT_SEARCH', 0.8, activeTask)
    expect(r).toEqual({ action: 'askClarification', missingEntityType: 'price', intentId: 'PRODUCT_SEARCH' })
  })

  it('proceeds to tool execution once the active task is ready', () => {
    const activeTask: ActiveTask = {
      intentId: 'PRODUCT_SEARCH',
      slots: [{ entityType: 'category', value: 'Phones', filled: true, filledAtTurn: 1 }],
      readyToExecute: true,
    }
    const r = decideNextAction('PRODUCT_SEARCH', 0.8, activeTask)
    expect(r.action).toBe('executeTool')
  })

  it('answers from knowledge for GENERAL_SHOPNEKT_HELP', () => {
    const r = decideNextAction('GENERAL_SHOPNEKT_HELP', 0.9, null)
    expect(r).toEqual({ action: 'answerFromKnowledge', intentId: 'GENERAL_SHOPNEKT_HELP' })
  })

  it('falls back to answerFromKnowledge for an intent with no direct tool mapping (e.g. PRODUCT_COMPARE)', () => {
    const r = decideNextAction('PRODUCT_COMPARE', 0.5, null)
    expect(r.action).toBe('answerFromKnowledge')
  })
})
