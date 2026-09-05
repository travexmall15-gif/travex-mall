import { describe, it, expect } from 'vitest'
import { createConversationContext, appendTurn, advanceContext } from '../context/engine'
import type { AIRequestContext } from '../security/authorize'

const buyerRequest: AIRequestContext = { sessionId: 's1', userId: 'buyer-1', role: 'buyer', shopId: null, applicationLanguage: 'sw' }

describe('createConversationContext', () => {
  it('initializes with no active task and empty turns', () => {
    const ctx = createConversationContext('conv-1', buyerRequest)
    expect(ctx.activeTask).toBeNull()
    expect(ctx.recentTurns).toEqual([])
    expect(ctx.applicationLanguage).toBe('sw')
  })
})

describe('appendTurn', () => {
  it('adds turns up to the token budget without summarizing', () => {
    let ctx = createConversationContext('conv-1', buyerRequest)
    ctx = { ...ctx, tokenBudgetTurns: 3 }
    ctx = appendTurn(ctx, { turn: 1, role: 'user', text: 'a', extractedEntityTypes: [] })
    ctx = appendTurn(ctx, { turn: 2, role: 'assistant', text: 'b', extractedEntityTypes: [] })
    expect(ctx.recentTurns).toHaveLength(2)
    expect(ctx.summary).toBeNull()
  })

  it('folds oldest turns into a summary once the budget is exceeded', () => {
    let ctx = createConversationContext('conv-1', buyerRequest)
    ctx = { ...ctx, tokenBudgetTurns: 2 }
    ctx = appendTurn(ctx, { turn: 1, role: 'user', text: 'first message', extractedEntityTypes: [] })
    ctx = appendTurn(ctx, { turn: 2, role: 'assistant', text: 'second message', extractedEntityTypes: [] })
    ctx = appendTurn(ctx, { turn: 3, role: 'user', text: 'third message', extractedEntityTypes: [] })

    expect(ctx.recentTurns.length).toBeLessThanOrEqual(2)
    expect(ctx.summary).not.toBeNull()
    expect(ctx.summary).toContain('first message')
  })
})

describe('advanceContext — multi-turn continuity (the "Natafuta simu -> Samsung" scenario)', () => {
  it('continues the active PRODUCT_SEARCH task when a follow-up message has weak/no new intent signal', () => {
    let ctx = createConversationContext('conv-1', buyerRequest)

    // Turn 1: "Natafuta simu." -> classified as PRODUCT_SEARCH, category filled.
    // PRODUCT_SEARCH's required slots are category + price — brand has no
    // deterministic extractor (see data-core/entities/index.ts), so it is
    // intentionally NOT a blocking slot; if mentioned it's informational
    // only and doesn't gate readiness.
    ctx = advanceContext(ctx, 1, 'PRODUCT_SEARCH', 0.8, { category: { canonical: 'Phones', market: 'electronics', synonyms: { sw: [], en: [] } } })
    expect(ctx.activeTask?.intentId).toBe('PRODUCT_SEARCH')
    expect(ctx.activeTask?.readyToExecute).toBe(false)

    // Turn 2: "Samsung." -> no strong new intent classified (brand alone isn't a full sentence
    // matching any intent example well) and no slot exists for it, so the
    // active task simply continues unchanged, still waiting on price.
    ctx = advanceContext(ctx, 2, null, 0, {})
    expect(ctx.activeTask?.intentId).toBe('PRODUCT_SEARCH')
    expect(ctx.activeTask?.readyToExecute).toBe(false)

    // Turn 3: "Chini ya laki tano." -> price entity fills the last required slot.
    ctx = advanceContext(ctx, 3, null, 0, { price: { raw: 'laki tano', amount: 500000, comparator: 'lt' } })
    expect(ctx.activeTask?.readyToExecute).toBe(true)
    expect(ctx.activeTask?.slots.find(s => s.entityType === 'category')?.value).toEqual(
      expect.objectContaining({ canonical: 'Phones' })
    )
  })

  it('starts a NEW active task when a strongly-confident different intent is classified', () => {
    let ctx = createConversationContext('conv-1', buyerRequest)
    ctx = advanceContext(ctx, 1, 'PRODUCT_SEARCH', 0.8, { category: { canonical: 'Phones', market: 'electronics', synonyms: { sw: [], en: [] } } })
    expect(ctx.activeTask?.intentId).toBe('PRODUCT_SEARCH')

    // A confident, clearly different intent should replace the active task, not merge into it.
    ctx = advanceContext(ctx, 2, 'SHOP_SEARCH', 0.9, {})
    expect(ctx.activeTask?.intentId).toBe('SHOP_SEARCH')
  })
})
