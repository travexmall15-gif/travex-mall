import { describe, it, expect } from 'vitest'
import { mergeEntitiesIntoActiveTask, type ActiveTask } from '../rules/context-rules'

describe('mergeEntitiesIntoActiveTask', () => {
  it('fills an empty slot with a freshly extracted entity', () => {
    const task: ActiveTask = {
      intentId: 'PRODUCT_SEARCH',
      slots: [
        { entityType: 'category', value: 'Phones', filled: true, filledAtTurn: 1 },
        { entityType: 'brand', value: null, filled: false, filledAtTurn: null },
      ],
      readyToExecute: false,
    }

    const result = mergeEntitiesIntoActiveTask(task, { brand: 'Samsung' }, 2)

    const brandSlot = result.slots.find(s => s.entityType === 'brand')
    expect(brandSlot?.filled).toBe(true)
    expect(brandSlot?.value).toBe('Samsung')
    expect(brandSlot?.filledAtTurn).toBe(2)
  })

  it('does not overwrite an already-filled slot', () => {
    const task: ActiveTask = {
      intentId: 'PRODUCT_SEARCH',
      slots: [{ entityType: 'category', value: 'Phones', filled: true, filledAtTurn: 1 }],
      readyToExecute: false,
    }
    const result = mergeEntitiesIntoActiveTask(task, { category: 'Laptops' }, 2)
    expect(result.slots[0].value).toBe('Phones')
  })

  it('marks readyToExecute true once every slot is filled', () => {
    const task: ActiveTask = {
      intentId: 'PRODUCT_SEARCH',
      slots: [
        { entityType: 'category', value: 'Phones', filled: true, filledAtTurn: 1 },
        { entityType: 'price', value: null, filled: false, filledAtTurn: null },
      ],
      readyToExecute: false,
    }
    const result = mergeEntitiesIntoActiveTask(task, { price: 500000 }, 2)
    expect(result.readyToExecute).toBe(true)
  })

  it('leaves readyToExecute false when a slot remains unfilled', () => {
    const task: ActiveTask = {
      intentId: 'PRODUCT_SEARCH',
      slots: [
        { entityType: 'category', value: null, filled: false, filledAtTurn: null },
        { entityType: 'price', value: null, filled: false, filledAtTurn: null },
      ],
      readyToExecute: false,
    }
    const result = mergeEntitiesIntoActiveTask(task, { price: 500000 }, 2)
    expect(result.readyToExecute).toBe(false)
  })

  // This is the exact scenario from the master spec:
  // "Natafuta simu." -> "Samsung." should resolve brand=Samsung for the
  // already-active phone search, not start a new, disconnected request.
  it('resolves the documented "Natafuta simu -> Samsung" scenario', () => {
    const afterFirstMessage: ActiveTask = {
      intentId: 'PRODUCT_SEARCH',
      slots: [
        { entityType: 'category', value: 'Phones', filled: true, filledAtTurn: 1 },
        { entityType: 'brand', value: null, filled: false, filledAtTurn: null },
        { entityType: 'price', value: null, filled: false, filledAtTurn: null },
      ],
      readyToExecute: false,
    }

    const afterBrandReply = mergeEntitiesIntoActiveTask(afterFirstMessage, { brand: 'Samsung' }, 2)
    expect(afterBrandReply.readyToExecute).toBe(false) // price still missing

    const afterPriceReply = mergeEntitiesIntoActiveTask(afterBrandReply, { price: 500000 }, 3)
    expect(afterPriceReply.readyToExecute).toBe(true)
    expect(afterPriceReply.slots.find(s => s.entityType === 'category')?.value).toBe('Phones')
    expect(afterPriceReply.slots.find(s => s.entityType === 'brand')?.value).toBe('Samsung')
    expect(afterPriceReply.slots.find(s => s.entityType === 'price')?.value).toBe(500000)
  })
})
