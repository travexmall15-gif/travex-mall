import { sb } from '@/lib/supabase'
import { searchShops as realSearchShops, searchProducts as realSearchProducts } from '@/lib/search'
import { listPreferredShops } from '@/lib/shop-likes'
import type { ShopConcept, ProductConcept, OrderConcept, FlashDealConcept, GroupBuyConcept, PreferredShopConcept } from '../../data-core'

// ═══════════════════════════════════════════════════════════
// BUYER 360 AI — TOOL IMPLEMENTATIONS
// ═══════════════════════════════════════════════════════════
// These are the REAL execution behind the buyer tool contracts
// declared in data-core/tools/index.ts. Every function here queries
// the actual Supabase tables — nothing is fabricated. Read tools
// deliberately REUSE existing app modules (lib/search.ts,
// lib/shop-likes.ts) instead of duplicating query logic, per the
// instruction to integrate with real ShopNekt data contracts rather
// than rebuild them.

export async function toolSearchProducts(input: { query?: string; category?: string; maxPrice?: number; minPrice?: number }): Promise<ProductConcept[]> {
  const results = await realSearchProducts(input.query || '', 12, { category: input.category, maxPrice: input.maxPrice, minPrice: input.minPrice })
  return results.map(p => ({
    id: p.id, name: p.name, price: p.price, stock: 0,
    description: null, category: null, image_url: p.image_url, store_id: p.store_id,
  }))
}

export async function toolSearchShops(input: { query?: string; category?: string; region?: string }): Promise<ShopConcept[]> {
  const results = await realSearchShops(input.query || '', 8, { category: input.category, region: input.region })
  return results.map(s => ({
    id: s.id, shop_name: s.shop_name, shop_category: s.shop_category,
    shop_region: s.shop_region as any, shop_market: null, shop_desc: null,
    shop_logo: s.shop_logo, plan: s.plan as any, status: 'approved', like_count: s.like_count,
  }))
}

export async function toolGetProduct(input: { productId: string }): Promise<ProductConcept | null> {
  const { data } = await sb.from('products').select('id,name,price,stock,description,category,image_url,store_id').eq('id', input.productId).maybeSingle()
  return data as ProductConcept | null
}

export async function toolGetShop(input: { shopId: string }): Promise<ShopConcept | null> {
  const { data } = await sb.from('pending_payments')
    .select('id,shop_name,shop_category,shop_region,shop_market,shop_desc,shop_logo,plan,status')
    .eq('id', input.shopId).eq('status', 'approved').maybeSingle()
  if (!data) {return null}
  const { count } = await sb.from('shop_likes').select('id', { count: 'exact', head: true }).eq('store_id', input.shopId)
  return { ...data, like_count: count ?? 0 } as ShopConcept
}

export async function toolGetFlashDeals(input: { category?: string }): Promise<FlashDealConcept[]> {
  const q = sb.from('flash_deals').select('*').eq('status', 'active').gt('ends_at', new Date().toISOString()).order('ends_at', { ascending: true }).limit(10)
  const { data } = await q
  return (data || []) as unknown as FlashDealConcept[]
}

export async function toolGetGroupBuys(input: { category?: string }): Promise<GroupBuyConcept[]> {
  const { data } = await sb.from('group_orders').select('*').eq('status', 'open').gt('expires_at', new Date().toISOString()).order('expires_at', { ascending: true }).limit(10)
  return (data || []) as unknown as GroupBuyConcept[]
}

export async function toolGetStorePosts(input: { shopId: string }): Promise<{ id: string; content: string | null; media_url: string | null }[]> {
  const { data } = await sb.from('feed_posts').select('id,content,post_text,caption,media_url').eq('store_id', input.shopId).order('created_at', { ascending: false }).limit(10)
  return (data || []).map((p: any) => ({ id: p.id, content: p.caption || p.post_text || p.content, media_url: p.media_url }))
}

/** Requires an authenticated buyer id — the executor supplies this after verifying the real session, never from client-claimed input. */
export async function toolGetPreferredShops(buyerId: string): Promise<PreferredShopConcept[]> {
  const shops = await listPreferredShops(buyerId)
  return shops.map(s => ({ store_id: s.store_id, shop_name: s.shop_name, liked_at: s.liked_at }))
}

/**
 * Fetches an order AND returns its owning buyer_id alongside it, so
 * the executor can authorize (ownResourceOnly) BEFORE handing the
 * order details back to the caller. Never returns order data without
 * the caller checking ownership first — see tools/executor.ts.
 */
export async function toolGetOrderRaw(orderId: string): Promise<{ order: OrderConcept | null; ownerBuyerId: string | null }> {
  const { data } = await sb.from('orders').select('id,product_name,store_name,status,total_amount,quantity,created_at,buyer_id').eq('id', orderId).maybeSingle()
  if (!data) {return { order: null, ownerBuyerId: null }}
  const { buyer_id, ...order } = data as any
  return { order: order as OrderConcept, ownerBuyerId: buyer_id ?? null }
}

export type CreateOrderInput = {
  storeId: string
  productId: string
  productName: string
  price: number
  quantity: number
  customerName: string
  customerPhone: string
  deliveryLocation?: string
  notes?: string
}

/**
 * Places a real order — mirrors the exact schema/columns used by the
 * app's own storefront order flow (app/store/[slug]/page.tsx's
 * placeOrder), so an AI-created order looks identical to a normal
 * buyer-created one in every downstream view (seller dashboard, buyer
 * order history). This function does NOT check confirmation — the
 * orchestrator's reasoning/safety layer must have already obtained
 * explicit user confirmation before calling this (consequential
 * action policy).
 */
export async function toolCreateOrder(input: CreateOrderInput): Promise<{ orderId: string | null; error: string | null }> {
  const total = input.price * input.quantity
  const { data, error } = await sb.from('orders').insert({
    store_id: input.storeId,
    shop_id: input.storeId,
    product_id: input.productId,
    product_name: input.productName,
    customer_name: input.customerName,
    customer_phone: input.customerPhone,
    delivery_location: input.deliveryLocation || '',
    notes: input.notes || '',
    quantity: input.quantity,
    total_amount: total,
    total_price: total,
    status: 'pending',
  }).select('id').single()

  if (error) {return { orderId: null, error: 'Could not place the order right now.' }}
  return { orderId: data?.id ?? null, error: null }
}
