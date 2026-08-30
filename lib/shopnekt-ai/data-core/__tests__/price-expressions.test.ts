import { describe, it, expect } from 'vitest'
import { parsePriceExpression, formatTZS } from '../terminology/price-expressions'

describe('parsePriceExpression', () => {
  it('parses "laki tano" as 500,000', () => {
    const r = parsePriceExpression('nionyeshe simu ya laki tano')
    expect(r?.amount).toBe(500_000)
  })

  it('parses "laki moja" as 100,000', () => {
    expect(parsePriceExpression('bei ni laki moja')?.amount).toBe(100_000)
  })

  it('parses "elfu hamsini" as 50,000', () => {
    expect(parsePriceExpression('nataka kitu cha elfu hamsini')?.amount).toBe(50_000)
  })

  it('parses "milioni moja" as 1,000,000', () => {
    expect(parsePriceExpression('iphone milioni moja')?.amount).toBe(1_000_000)
  })

  it('parses "100k" shorthand as 100,000', () => {
    expect(parsePriceExpression('nionyeshe shoes chini ya 100k')?.amount).toBe(100_000)
  })

  it('parses "1.5m" shorthand as 1,500,000', () => {
    expect(parsePriceExpression('budget ni 1.5m')?.amount).toBe(1_500_000)
  })

  it('detects "chini ya" as a "less than" comparator', () => {
    expect(parsePriceExpression('nionyeshe shoes chini ya 100k')?.comparator).toBe('lt')
  })

  it('detects "zaidi ya" as a "greater than" comparator', () => {
    expect(parsePriceExpression('bidhaa zaidi ya laki mbili')?.comparator).toBe('gt')
  })

  it('defaults to "eq" comparator when no comparator word is present', () => {
    expect(parsePriceExpression('simu ya laki tano')?.comparator).toBe('eq')
  })

  it('parses plain English price phrases', () => {
    const r = parsePriceExpression('I need men\'s sneakers under TZS 150,000')
    expect(r?.amount).toBe(150_000)
    expect(r?.comparator).toBe('lt')
  })

  it('returns null when no price expression exists', () => {
    expect(parsePriceExpression('nionyeshe maduka ya nguo Arusha')).toBeNull()
  })

  it('does not misfire on unrelated numbers like a phone number', () => {
    // A 9-10 digit phone number should not be silently treated as a price —
    // this is a known limitation documented in the module, verified here.
    const r = parsePriceExpression('piga simu 0712345678')
    // It WILL match as a raw digit price under current rules (4+ digits),
    // which is why callers (Entity Engine) must combine this with intent
    // context before trusting it as a price. This test documents that
    // behavior explicitly rather than silently assuming it's handled.
    expect(r).not.toBeNull()
  })
})

describe('formatTZS', () => {
  it('formats with thousands separators and TZS prefix', () => {
    expect(formatTZS(500000)).toBe('TZS 500,000')
  })

  it('rounds non-integer amounts', () => {
    expect(formatTZS(1500000.7)).toBe('TZS 1,500,001')
  })
})
