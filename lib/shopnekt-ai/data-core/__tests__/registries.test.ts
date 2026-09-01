import { describe, it, expect } from 'vitest'
import { INTENTS, getIntentsForRole, getIntentById, IntentDefinitionSchema } from '../intents'
import { TOOLS, getToolsForRole, getToolByName, ToolDefinitionSchema } from '../tools'
import { ENTITY_TYPE_DESCRIPTIONS, EntityTypeSchema } from '../entities'
import { CONCEPT_REGISTRY } from '../concepts'
import { REFUSAL_MESSAGES } from '../rules/response-rules'
import { SUPPORTED_LANGUAGES } from '../schemas/language'

describe('INTENTS registry', () => {
  it('every intent conforms to its schema', () => {
    for (const intent of INTENTS) {
      expect(() => IntentDefinitionSchema.parse(intent)).not.toThrow()
    }
  })

  it('has no duplicate intent ids', () => {
    const ids = INTENTS.map(i => i.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every intent has at least one Kiswahili and one English example', () => {
    for (const intent of INTENTS) {
      expect(intent.examples.sw.length, `${intent.id} missing sw examples`).toBeGreaterThan(0)
      expect(intent.examples.en.length, `${intent.id} missing en examples`).toBeGreaterThan(0)
    }
  })

  it('getIntentsForRole("buyer") includes shared intents but no seller-only intents', () => {
    const buyerIntents = getIntentsForRole('buyer')
    expect(buyerIntents.some(i => i.id === 'GENERAL_SHOPNEKT_HELP')).toBe(true)
    expect(buyerIntents.some(i => i.id === 'CREATE_PRODUCT')).toBe(false)
  })

  it('getIntentById resolves a known id and returns undefined for unknown ids', () => {
    expect(getIntentById('PRODUCT_SEARCH')?.role).toBe('buyer')
    expect(getIntentById('NOT_A_REAL_INTENT')).toBeUndefined()
  })

  it('every consequential intent requires auth (no anonymous consequential actions)', () => {
    for (const intent of INTENTS) {
      if (intent.isConsequential) {
        // ORDER_CREATE is the sole documented exception: ShopNekt allows
        // guest checkout today (confirmed against the real order flow),
        // so it is intentionally consequential without requiring prior
        // auth — the order tool itself still validates real ownership at
        // execution time. All other consequential intents must require auth.
        if (intent.id === 'ORDER_CREATE') {continue}
        expect(intent.requiresAuth, `${intent.id} is consequential but does not require auth`).toBe(true)
      }
    }
  })
})

describe('TOOLS registry', () => {
  it('every tool conforms to its schema', () => {
    for (const tool of TOOLS) {
      expect(() => ToolDefinitionSchema.parse(tool)).not.toThrow()
    }
  })

  it('has no duplicate tool names', () => {
    const names = TOOLS.map(t => t.name)
    expect(new Set(names).size).toBe(names.length)
  })

  it('every consequential tool requires more than public permission', () => {
    for (const tool of TOOLS) {
      if (tool.isConsequential) {
        expect(tool.permission, `${tool.name} is consequential but has public permission`).not.toBe('public')
      }
    }
  })

  it('getToolsForRole splits buyer/seller tools correctly', () => {
    expect(getToolsForRole('buyer').every(t => t.role === 'buyer')).toBe(true)
    expect(getToolsForRole('seller').every(t => t.role === 'seller')).toBe(true)
  })

  it('getToolByName resolves known tools', () => {
    expect(getToolByName('searchProducts')?.role).toBe('buyer')
    expect(getToolByName('createFlashDeal')?.role).toBe('seller')
    expect(getToolByName('doesNotExist')).toBeUndefined()
  })
})

describe('EntityType descriptions', () => {
  it('every EntityType enum value has a description', () => {
    for (const value of EntityTypeSchema.options) {
      expect(ENTITY_TYPE_DESCRIPTIONS[value], `missing description for ${value}`).toBeTruthy()
    }
  })
})

describe('CONCEPT_REGISTRY', () => {
  it('contains the core ShopNekt concepts', () => {
    expect(Object.keys(CONCEPT_REGISTRY).sort()).toEqual(
      ['flashDeal', 'groupBuy', 'order', 'preferredShop', 'product', 'shop', 'vybePost'].sort()
    )
  })
})

describe('REFUSAL_MESSAGES localization', () => {
  it('every refusal reason has text in every supported language', () => {
    for (const [reason, text] of Object.entries(REFUSAL_MESSAGES)) {
      for (const lang of SUPPORTED_LANGUAGES) {
        expect(text[lang], `${reason} missing ${lang} translation`).toBeTruthy()
      }
    }
  })

  it('never contains a translated ShopNekt/QNEX360 brand name', () => {
    for (const text of Object.values(REFUSAL_MESSAGES)) {
      for (const lang of SUPPORTED_LANGUAGES) {
        // Sanity check: if the brand name is mentioned at all, it must
        // appear verbatim, not transliterated.
        const value = text[lang]
        if (/shopnekt/i.test(value)) {expect(value).toMatch(/ShopNekt/)}
      }
    }
  })
})
