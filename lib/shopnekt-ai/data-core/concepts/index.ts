import { z } from 'zod'

// ═══════════════════════════════════════════════════════════
// SHOPNEKT CONCEPTS — structured domain definitions.
// ═══════════════════════════════════════════════════════════
// These schemas describe the SHAPE of real ShopNekt data (mirroring
// the actual application's Supabase tables, confirmed by direct
// inspection of the live codebase — not invented). They do NOT contain
// live data. AI Core (Batch 2) uses these shapes to know what a
// "Shop" or "Product" IS structurally; it then retrieves real values
// through tools that call the live database.
//
// Field names intentionally mirror the real columns 1:1 so that a
// future tool-layer implementation can map a database row onto one of
// these types with zero translation logic.

export const MarketSchema = z.enum(['fashion', 'vehicle', 'electronics'])
export type Market = z.infer<typeof MarketSchema>

export const PlanSchema = z.enum(['basic', 'premium'])
export type Plan = z.infer<typeof PlanSchema>

export const RegionSchema = z.enum(['Dar es Salaam', 'Arusha', 'Mwanza', 'Dodoma', 'Tanga'])
export type Region = z.infer<typeof RegionSchema>

export const ShopStatusSchema = z.enum(['pending', 'approved', 'rejected'])
export type ShopStatus = z.infer<typeof ShopStatusSchema>

export const OrderStatusSchema = z.enum(['pending', 'confirmed', 'rejected', 'payment_pending', 'delivered'])
export type OrderStatus = z.infer<typeof OrderStatusSchema>

/** A ShopNekt seller storefront (pending_payments table once approved). */
export const ShopConceptSchema = z.object({
  id: z.string(),
  shop_name: z.string(),
  shop_category: z.string().nullable(),
  shop_region: RegionSchema.nullable(),
  shop_market: MarketSchema.nullable(),
  shop_desc: z.string().nullable(),
  shop_logo: z.string().nullable(),
  plan: PlanSchema.nullable(),
  status: ShopStatusSchema,
  like_count: z.number().int().nonnegative().default(0),
})
export type ShopConcept = z.infer<typeof ShopConceptSchema>

/** A product listed inside a shop. */
export const ProductConceptSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().nonnegative(),
  stock: z.number().int().nonnegative(),
  description: z.string().nullable(),
  category: z.string().nullable(),
  image_url: z.string().nullable(),
  store_id: z.string(),
})
export type ProductConcept = z.infer<typeof ProductConceptSchema>

/** A buyer's order for a single product. */
export const OrderConceptSchema = z.object({
  id: z.string(),
  product_name: z.string(),
  store_name: z.string(),
  status: OrderStatusSchema,
  total_amount: z.number().nonnegative(),
  quantity: z.number().int().positive(),
  created_at: z.string(),
})
export type OrderConcept = z.infer<typeof OrderConceptSchema>

/** A time-boxed discount campaign on one specific product. */
export const FlashDealConceptSchema = z.object({
  id: z.string(),
  store_id: z.string(),
  shop_name: z.string(),
  product_id: z.string().nullable(),
  product_name: z.string(),
  original_price: z.number().nonnegative(),
  deal_price: z.number().nonnegative(),
  discount_pct: z.number().min(0).max(100),
  ends_at: z.string(),
  max_orders: z.number().int().nonnegative().nullable(),
  current_orders: z.number().int().nonnegative(),
  status: z.string(),
})
export type FlashDealConcept = z.infer<typeof FlashDealConceptSchema>

/** A collective-discount campaign that unlocks once enough buyers join. */
export const GroupBuyConceptSchema = z.object({
  id: z.string(),
  store_id: z.string(),
  shop_name: z.string(),
  product_id: z.string().nullable(),
  product_name: z.string(),
  unit_price: z.number().nonnegative(),
  discount_pct: z.number().min(0).max(100),
  min_members: z.number().int().positive(),
  current_members: z.number().int().nonnegative(),
  expires_at: z.string(),
  status: z.string(),
})
export type GroupBuyConcept = z.infer<typeof GroupBuyConceptSchema>

/** A Social Vybe post — may optionally reference one product. */
export const VybePostConceptSchema = z.object({
  id: z.string(),
  store_id: z.string().nullable(),
  shop_name: z.string().nullable(),
  content: z.string().nullable(),
  media_url: z.string().nullable(),
  media_type: z.string().nullable(),
  likes_count: z.number().int().nonnegative().default(0),
  product_id: z.string().nullable(),
  created_at: z.string(),
})
export type VybePostConcept = z.infer<typeof VybePostConceptSchema>

/**
 * ShopNekt's "Like Shop" relationship — NOT a Follow system. Liking a
 * shop adds it to the buyer's Preferred Shops. This distinction is
 * safety-relevant: the AI must never present or imply a Follow feature
 * (see safety/behavior-rules.ts).
 */
export const PreferredShopConceptSchema = z.object({
  store_id: z.string(),
  shop_name: z.string(),
  liked_at: z.string(),
})
export type PreferredShopConcept = z.infer<typeof PreferredShopConceptSchema>

/**
 * Registry of every concept, for tooling/introspection (e.g. so AI Core
 * can enumerate "what kinds of things does ShopNekt know about" without
 * hardcoding a separate list elsewhere).
 */
export const CONCEPT_REGISTRY = {
  shop: ShopConceptSchema,
  product: ProductConceptSchema,
  order: OrderConceptSchema,
  flashDeal: FlashDealConceptSchema,
  groupBuy: GroupBuyConceptSchema,
  vybePost: VybePostConceptSchema,
  preferredShop: PreferredShopConceptSchema,
} as const

export type ConceptName = keyof typeof CONCEPT_REGISTRY
