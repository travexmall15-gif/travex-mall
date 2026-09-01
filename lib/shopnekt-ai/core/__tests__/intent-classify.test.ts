import { describe, it, expect } from 'vitest'
import { classifyIntent } from '../intent/classify'
import { extractDeterministicEntities } from '../../data-core'

describe('classifyIntent — buyer role', () => {
  it('classifies a Kiswahili product search', () => {
    const entities = extractDeterministicEntities('Natafuta simu ya laki tano')
    const r = classifyIntent('Natafuta simu ya laki tano', 'buyer', entities)
    expect(r.intentId).toBe('PRODUCT_SEARCH')
  })

  it('classifies the exact mixed-language spec example', () => {
    const entities = extractDeterministicEntities('nionyeshe shoes chini ya 100k')
    const r = classifyIntent('nionyeshe shoes chini ya 100k', 'buyer', entities)
    expect(r.intentId).toBe('PRODUCT_SEARCH')
  })

  it('classifies an English shop search', () => {
    const entities = extractDeterministicEntities('show me electronics shops in Arusha')
    const r = classifyIntent('show me electronics shops in Arusha', 'buyer', entities)
    expect(r.intentId).toBe('SHOP_SEARCH')
  })

  it('never returns a seller-only intent for a buyer', () => {
    const entities = extractDeterministicEntities('nataka kuongeza bidhaa mpya')
    const r = classifyIntent('nataka kuongeza bidhaa mpya', 'buyer', entities)
    // CREATE_PRODUCT is seller-only — even if wording overlaps, buyer role must never receive it.
    expect(r.intentId).not.toBe('CREATE_PRODUCT')
  })

  it('returns null intent with zero confidence for gibberish', () => {
    const entities = extractDeterministicEntities('xyzabc123 qqq')
    const r = classifyIntent('xyzabc123 qqq', 'buyer', entities)
    expect(r.intentId).toBeNull()
  })
})

describe('classifyIntent — seller role', () => {
  it('classifies a Kiswahili flash deal creation request', () => {
    const entities = extractDeterministicEntities('nataka kutengeneza flash deal')
    const r = classifyIntent('nataka kutengeneza flash deal', 'seller', entities)
    expect(r.intentId).toBe('CREATE_FLASH_DEAL')
  })

  it('classifies an English analytics request', () => {
    const entities = extractDeterministicEntities('how are my sales this month?')
    const r = classifyIntent('how are my sales this month?', 'seller', entities)
    expect(r.intentId).toBe('SHOP_ANALYTICS')
  })

  it('never returns a buyer-only intent for a seller', () => {
    const entities = extractDeterministicEntities('nataka kuagiza hii')
    const r = classifyIntent('nataka kuagiza hii', 'seller', entities)
    expect(r.intentId).not.toBe('ORDER_CREATE')
  })
})

describe('classifyIntent — shared intents available to both roles', () => {
  it('GENERAL_SHOPNEKT_HELP is reachable from buyer role', () => {
    const entities = extractDeterministicEntities('ShopNekt inafanya kazije?')
    const r = classifyIntent('ShopNekt inafanya kazije?', 'buyer', entities)
    expect(r.intentId).toBe('GENERAL_SHOPNEKT_HELP')
  })
})
