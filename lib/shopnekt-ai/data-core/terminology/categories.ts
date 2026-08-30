import type { Market } from '../concepts'

// ═══════════════════════════════════════════════════════════
// CATEGORY / MARKET TERMINOLOGY
// ═══════════════════════════════════════════════════════════
// Mirrors the real MARKET_CATS constant used in app/open-store/page.tsx
// and app/market/[market]/page.tsx — these are the ACTUAL categories a
// shop can be filed under in ShopNekt today, not invented examples.
// Each category also carries Kiswahili/English synonyms a buyer might
// actually type, so the Entity Engine (Batch 2) can map free text like
// "viatu" or "simu" onto a real, queryable category value.

export type CategoryTerm = {
  /** The canonical category value stored in shop_category / product.category. */
  canonical: string
  market: Market
  synonyms: { sw: string[]; en: string[] }
}

export const CATEGORY_TERMS: CategoryTerm[] = [
  // ── Fashion ──
  { canonical: 'Clothing',        market: 'fashion', synonyms: { sw: ['nguo', 'mavazi'], en: ['clothes', 'clothing', 'apparel'] } },
  { canonical: 'Shoes',           market: 'fashion', synonyms: { sw: ['viatu'], en: ['shoes', 'sneakers', 'footwear'] } },
  { canonical: 'Accessories',     market: 'fashion', synonyms: { sw: ['vifaa', 'vipodozi vya mavazi'], en: ['accessories'] } },
  { canonical: 'Beauty',          market: 'fashion', synonyms: { sw: ['urembo', 'vipodozi'], en: ['beauty', 'cosmetics', 'makeup'] } },
  { canonical: 'Jewelry',         market: 'fashion', synonyms: { sw: ['vito', 'mapambo'], en: ['jewelry', 'jewellery'] } },
  { canonical: 'Sports & Fitness',market: 'fashion', synonyms: { sw: ['michezo', 'mazoezi'], en: ['sports', 'fitness', 'gym'] } },
  { canonical: 'Arts & Crafts',   market: 'fashion', synonyms: { sw: ['sanaa', 'ufundi'], en: ['arts', 'crafts', 'handmade'] } },

  // ── Vehicle ──
  { canonical: 'Cars',            market: 'vehicle', synonyms: { sw: ['gari', 'magari'], en: ['car', 'cars', 'vehicle', 'vehicles'] } },
  { canonical: 'Motorcycles',     market: 'vehicle', synonyms: { sw: ['pikipiki', 'bodaboda'], en: ['motorcycle', 'motorbike', 'boda'] } },
  { canonical: 'Spare Parts',     market: 'vehicle', synonyms: { sw: ['vipuri'], en: ['spare parts', 'parts'] } },
  { canonical: 'Tyres',           market: 'vehicle', synonyms: { sw: ['matairi', 'tairi'], en: ['tyres', 'tires'] } },
  { canonical: 'Auto Accessories',market: 'vehicle', synonyms: { sw: ['vifaa vya gari'], en: ['auto accessories', 'car accessories'] } },

  // ── Electronics ──
  { canonical: 'Phones',          market: 'electronics', synonyms: { sw: ['simu'], en: ['phone', 'phones', 'smartphone', 'mobile'] } },
  { canonical: 'Laptops',         market: 'electronics', synonyms: { sw: ['kompyuta', 'laptopu'], en: ['laptop', 'laptops', 'computer'] } },
  { canonical: 'TVs',             market: 'electronics', synonyms: { sw: ['televisheni', 'runinga'], en: ['tv', 'tvs', 'television'] } },
  { canonical: 'Audio',           market: 'electronics', synonyms: { sw: ['sauti', 'spika'], en: ['audio', 'speaker', 'headphones'] } },
  { canonical: 'Appliances',      market: 'electronics', synonyms: { sw: ['vifaa vya nyumbani'], en: ['appliances', 'home appliances'] } },
  { canonical: 'Gaming',          market: 'electronics', synonyms: { sw: ['michezo ya video'], en: ['gaming', 'games', 'console'] } },
  { canonical: 'Other Electronics', market: 'electronics', synonyms: { sw: ['elektroniki nyingine'], en: ['electronics', 'other electronics'] } },
]

/**
 * Finds the best matching canonical category for free text, case-
 * insensitive, matching either language's synonym list or the
 * canonical value itself. Returns null (never a guess) if nothing
 * matches.
 */
export function matchCategory(text: string): CategoryTerm | null {
  const lower = text.toLowerCase()
  for (const term of CATEGORY_TERMS) {
    if (lower.includes(term.canonical.toLowerCase())) return term
    for (const syn of [...term.synonyms.sw, ...term.synonyms.en]) {
      if (lower.includes(syn.toLowerCase())) return term
    }
  }
  return null
}

/** All canonical categories for a given market (matches MARKET_CATS exactly). */
export function categoriesForMarket(market: Market): string[] {
  return CATEGORY_TERMS.filter(t => t.market === market).map(t => t.canonical)
}

// ── Market-level terminology (fashion / vehicle / electronics) ──
export const MARKET_TERMS: { canonical: Market; synonyms: { sw: string[]; en: string[] } }[] = [
  { canonical: 'fashion',     synonyms: { sw: ['mitindo', 'nguo'],              en: ['fashion', 'clothing market'] } },
  { canonical: 'vehicle',     synonyms: { sw: ['magari', 'gari'],               en: ['vehicle', 'vehicles', 'car market'] } },
  { canonical: 'electronics', synonyms: { sw: ['elektroniki'],                  en: ['electronics', 'gadgets'] } },
]

export function matchMarket(text: string): Market | null {
  const lower = text.toLowerCase()
  for (const term of MARKET_TERMS) {
    if (lower.includes(term.canonical)) return term.canonical
    for (const syn of [...term.synonyms.sw, ...term.synonyms.en]) {
      if (lower.includes(syn.toLowerCase())) return term.canonical
    }
  }
  return null
}

// ── Region terminology (real regions used in Open Store / Market) ──
const REGION_ALIASES: Record<string, string> = {
  'dar': 'Dar es Salaam', 'dar es salaam': 'Dar es Salaam', 'dsm': 'Dar es Salaam',
  'arusha': 'Arusha',
  'mwanza': 'Mwanza',
  'dodoma': 'Dodoma',
  'tanga': 'Tanga',
}

export function matchRegion(text: string): string | null {
  const lower = text.toLowerCase()
  for (const [alias, canonical] of Object.entries(REGION_ALIASES)) {
    if (lower.includes(alias)) return canonical
  }
  return null
}
