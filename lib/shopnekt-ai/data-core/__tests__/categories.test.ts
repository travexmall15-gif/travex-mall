import { describe, it, expect } from 'vitest'
import { matchCategory, matchMarket, matchRegion, categoriesForMarket, CATEGORY_TERMS } from '../terminology/categories'

describe('matchCategory', () => {
  it('matches Kiswahili synonym "viatu" to Shoes', () => {
    expect(matchCategory('nionyeshe viatu vizuri')?.canonical).toBe('Shoes')
  })

  it('matches Kiswahili synonym "simu" to Phones', () => {
    expect(matchCategory('natafuta simu mpya')?.canonical).toBe('Phones')
  })

  it('matches English synonym "sneakers" to Shoes', () => {
    expect(matchCategory('need sneakers under 150k')?.canonical).toBe('Shoes')
  })

  it('matches canonical value directly', () => {
    expect(matchCategory('show me Laptops')?.canonical).toBe('Laptops')
  })

  it('returns null for unrecognized text', () => {
    expect(matchCategory('habari za asubuhi')).toBeNull()
  })
})

describe('matchMarket', () => {
  it('matches "magari" to vehicle', () => {
    expect(matchMarket('nataka kuona magari')).toBe('vehicle')
  })

  it('matches "electronics" to electronics', () => {
    expect(matchMarket('show me electronics shops')).toBe('electronics')
  })
})

describe('matchRegion', () => {
  it('matches "dar" to Dar es Salaam', () => {
    expect(matchRegion('duka liko dar')).toBe('Dar es Salaam')
  })

  it('matches full region name case-insensitively', () => {
    expect(matchRegion('shops in ARUSHA')).toBe('Arusha')
  })

  it('returns null for unrecognized location', () => {
    expect(matchRegion('nairobi')).toBeNull()
  })
})

describe('categoriesForMarket', () => {
  it('returns exactly the real MARKET_CATS fashion list (7 categories)', () => {
    expect(categoriesForMarket('fashion')).toEqual([
      'Clothing', 'Shoes', 'Accessories', 'Beauty', 'Jewelry', 'Sports & Fitness', 'Arts & Crafts',
    ])
  })

  it('every category term has at least one synonym in each language', () => {
    for (const term of CATEGORY_TERMS) {
      expect(term.synonyms.sw.length).toBeGreaterThan(0)
      expect(term.synonyms.en.length).toBeGreaterThan(0)
    }
  })
})
