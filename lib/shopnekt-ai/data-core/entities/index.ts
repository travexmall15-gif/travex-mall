import { z } from 'zod'
import { parsePriceExpression, type ParsedPriceExpression } from '../terminology/price-expressions'
import { matchCategory, matchMarket, matchRegion, type CategoryTerm } from '../terminology/categories'
import type { Market } from '../concepts'

// ═══════════════════════════════════════════════════════════
// ENTITY REGISTRY
// ═══════════════════════════════════════════════════════════
// Defines WHAT can be extracted from a message (the entity TYPES), and
// provides real, deterministic extractors for the entity types that
// have unambiguous surface patterns (price, category, market, region).
// Entities with no safe deterministic pattern (product name, brand,
// shop name) are typed here but intentionally left for AI Core's
// model-assisted extraction (Batch 2/3) — this Data Core never guesses.

export const EntityTypeSchema = z.enum([
  'category', 'market', 'brand', 'price', 'location', 'shopName',
  'product', 'productName', 'quantity', 'orderId', 'dateRange',
  'minMembers', 'duration', 'feature', 'stock',
])
export type EntityType = z.infer<typeof EntityTypeSchema>

export const ENTITY_TYPE_DESCRIPTIONS: Record<EntityType, string> = {
  category:    'A product/shop category (e.g. Phones, Clothing) — deterministically extractable via terminology/categories.ts',
  market:      'A top-level marketplace (fashion | vehicle | electronics) — deterministically extractable',
  brand:       'A product brand name (e.g. Samsung, Nike) — requires model-assisted extraction, no fixed list exists in ShopNekt',
  price:       'A TZS amount with an optional comparator (under/over/around) — deterministically extractable via terminology/price-expressions.ts',
  location:    'A region/city (e.g. Dar es Salaam) — deterministically extractable against ShopNekt\'s configured regions',
  shopName:    'A specific shop\'s name — requires fuzzy matching against live shop data (a tool call, not static extraction)',
  product:     'A reference to a specific, already-identified product (usually from prior context, not raw text)',
  productName: 'A free-text product name/title (e.g. when a seller is creating a new product)',
  quantity:    'A count of items',
  orderId:     'A specific order identifier',
  dateRange:   'A time period (e.g. "this month") for analytics-type intents',
  minMembers:  'Minimum participants required for a Group Buy to activate',
  duration:    'A campaign duration (e.g. Flash Deal 24 hours, Group Buy 3 days)',
  feature:     'A desired product feature/attribute mentioned in free text (e.g. "good camera") — model-assisted only',
  stock:       'A stock/inventory quantity',
}

/** The result of running deterministic extraction over one message. */
export type ExtractedEntities = {
  category?: CategoryTerm
  market?: Market
  price?: ParsedPriceExpression
  location?: string
}

/**
 * Runs every deterministic extractor against a message and returns
 * whatever it genuinely found. Never invents a value for an entity
 * type it can't confidently extract — model-assisted entity types
 * (brand, productName, feature, shopName) are intentionally NOT
 * attempted here; that's AI Core/Engine's job with real language
 * understanding, not string matching.
 */
export function extractDeterministicEntities(text: string): ExtractedEntities {
  const result: ExtractedEntities = {}

  const category = matchCategory(text)
  if (category) {result.category = category}

  const market = matchMarket(text)
  if (market) {result.market = market}

  const price = parsePriceExpression(text)
  if (price) {result.price = price}

  const location = matchRegion(text)
  if (location) {result.location = location}

  return result
}
