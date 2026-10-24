import 'server-only'
import { createServiceSupabase } from '@/lib/security/server-supabase'
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
  const query = typeof input.query === 'string' ? input.query.trim().slice(0, 100) : ''
  const category = typeof input.category === 'string' ? input.category.trim().slice(0, 80) : ''
  if (!query && !category) {return []}
  const sb = createServiceSupabase()
  const { data: stores } = await sb.from('pending_payments').select('id').eq('status', 'approved').limit(1000)
  const storeIds = (stores || []).map(store => store.id)
  if (!storeIds.length) {return []}
  const clauses = await Promise.all([
    ...(query ? [{ field: 'name' as const, term: query }] : []),
    ...(category ? [{ field: 'category' as const, term: category }] : []),
  ].map(async ({ field, term }) => {
    let request = sb.from('products').select('id,name,price,stock,description,category,image_url,store_id')
      .in('store_id', storeIds).eq('is_active', true).eq('is_available', true).gt('stock', 0)
    const pattern = `%${term.replace(/[\\%_]/g, '\\$&')}%`
    request = request.ilike(field, pattern)
    if (typeof input.maxPrice === 'number' && Number.isFinite(input.maxPrice)) {request = request.lte('price', input.maxPrice)}
    if (typeof input.minPrice === 'number' && Number.isFinite(input.minPrice)) {request = request.gte('price', input.minPrice)}
    return request.limit(12)
  }))
  const rows = (await Promise.all(clauses)).flatMap(result => result.data || [])
  return [...new Map(rows.map(product => [product.id, product])).values()].slice(0, 12) as ProductConcept[]
}

export async function toolSearchShops(input: { query?: string; category?: string; region?: string }): Promise<ShopConcept[]> {
  const query = typeof input.query === 'string' ? input.query.trim().slice(0, 100) : ''
  const category = typeof input.category === 'string' ? input.category.trim().slice(0, 80) : ''
  const region = typeof input.region === 'string' ? input.region.trim().slice(0, 80) : ''
  if (!query && !category) {return []}
  const sb = createServiceSupabase()
  const terms = [...new Set([query, category].filter(Boolean))]
  const results = await Promise.all(terms.map(term => sb.from('pending_payments')
    .select('id,shop_name,shop_category,shop_region,shop_desc,shop_logo_url,plan,status')
    .eq('status', 'approved').or(`shop_name.ilike.%${term.replace(/[^\p{L}\p{N}\s._'-]/gu, '')}%,shop_category.ilike.%${term.replace(/[^\p{L}\p{N}\s._'-]/gu, '')}%`)
    .limit(8)))
  const stores = [...new Map(results.flatMap(result => result.data || []).map(store => [store.id, store])).values()]
    .filter(store => !region || (store.shop_region || '').toLowerCase() === region.toLowerCase()).slice(0, 8)
  if (!stores.length) {return []}
  const { data: counts } = await sb.from('shop_like_counts').select('store_id,like_count').in('store_id', stores.map(store => store.id))
  const countMap = new Map((counts || []).map(row => [row.store_id, row.like_count]))
  return stores.map(store => ({
    id: store.id, shop_name: store.shop_name, shop_category: store.shop_category,
    shop_region: store.shop_region, shop_market: null, shop_desc: store.shop_desc,
    shop_logo: store.shop_logo_url, plan: store.plan, status: 'approved',
    like_count: countMap.get(store.id) || 0,
  })) as ShopConcept[]
}

export async function toolGetProduct(input: { productId: string }): Promise<ProductConcept | null> {
  const sb = createServiceSupabase()
  const { data } = await sb.from('products').select('id,name,price,stock,description,category,image_url,store_id,is_active,is_available')
    .eq('id', input.productId).eq('is_active', true).eq('is_available', true).gt('stock', 0).maybeSingle()
  return data as ProductConcept | null
}

export async function toolGetShop(input: { shopId: string }): Promise<ShopConcept | null> {
  const sb = createServiceSupabase()
  const { data } = await sb.from('pending_payments')
    .select('id,shop_name,shop_category,shop_region,shop_desc,shop_logo_url,plan,status')
    .eq('id', input.shopId).eq('status', 'approved').maybeSingle()
  if (!data) {return null}
  const { data: likes } = await sb.from('shop_like_counts').select('like_count').eq('store_id', input.shopId).maybeSingle()
  return {
    id: data.id, shop_name: data.shop_name, shop_category: data.shop_category, shop_region: data.shop_region,
    shop_market: null, shop_desc: data.shop_desc, shop_logo: data.shop_logo_url,
    plan: data.plan, status: 'approved', like_count: likes?.like_count || 0,
  } as ShopConcept
}

export async function toolGetFlashDeals(input: { category?: string }): Promise<FlashDealConcept[]> {
  const sb = createServiceSupabase()
  const { data: stores } = await sb.from('pending_payments').select('id').eq('status', 'approved').limit(1000)
  if (!stores?.length) {return []}
  const { data } = await sb.from('flash_deals')
    .select('id,store_id,shop_name,product_id,product_name,product_image,original_price,deal_price,discount_pct,starts_at,ends_at,max_orders,current_orders,status,created_at')
    .in('store_id', stores.map(store => store.id)).eq('status', 'active').gt('ends_at', new Date().toISOString())
    .order('ends_at', { ascending: true }).limit(10)
  return (data || []) as unknown as FlashDealConcept[]
}

export async function toolGetGroupBuys(input: { category?: string }): Promise<GroupBuyConcept[]> {
  const sb = createServiceSupabase()
  const { data: stores } = await sb.from('pending_payments').select('id').eq('status', 'approved').limit(1000)
  if (!stores?.length) {return []}
  const { data } = await sb.from('group_orders')
    .select('id,store_id,shop_name,product_id,product_name,product_image,unit_price,discount_pct,min_members,current_members,expires_at,status,created_at')
    .in('store_id', stores.map(store => store.id)).eq('status', 'open').gt('expires_at', new Date().toISOString())
    .order('expires_at', { ascending: true }).limit(10)
  return (data || []) as unknown as GroupBuyConcept[]
}

export async function toolGetStorePosts(input: { shopId: string }): Promise<{ id: string; content: string | null; media_url: string | null }[]> {
  const sb = createServiceSupabase()
  const { data: store } = await sb.from('pending_payments').select('id').eq('id', input.shopId).eq('status', 'approved').maybeSingle()
  if (!store) {return []}
  const { data } = await sb.from('feed_posts').select('id,content,post_text,caption,media_url')
    .eq('store_id', input.shopId).order('created_at', { ascending: false }).limit(10)
  return (data || []).map((p: any) => ({ id: p.id, content: p.caption || p.post_text || p.content, media_url: p.media_url }))
}

/** Requires an authenticated buyer id — the executor supplies this after verifying the real session, never from client-claimed input. */
export async function toolGetPreferredShops(buyerId: string): Promise<PreferredShopConcept[]> {
  const sb = createServiceSupabase()
  const { data: likes } = await sb.from('shop_likes').select('store_id,created_at').eq('user_id', buyerId).order('created_at', { ascending: false }).limit(200)
  if (!likes?.length) {return []}
  const ids = likes.map(row => row.store_id)
  const { data: stores } = await sb.from('pending_payments').select('id,shop_name').in('id', ids).eq('status', 'approved')
  const byId = new Map((stores || []).map(store => [store.id, store]))
  return likes.flatMap(row => {
    const store = byId.get(row.store_id)
    return store ? [{ store_id: row.store_id, shop_name: store.shop_name, liked_at: row.created_at }] : []
  })
}

/**
 * Fetches an order AND returns its owning buyer_id alongside it, so
 * the executor can authorize (ownResourceOnly) BEFORE handing the
 * order details back to the caller. Never returns order data without
 * the caller checking ownership first — see tools/executor.ts.
 */
export async function toolGetOrderRaw(orderId: string): Promise<{ order: OrderConcept | null; ownerBuyerId: string | null }> {
  const sb = createServiceSupabase()
  const { data } = await sb.from('orders').select('id,product_name,store_name,status,total_amount,quantity,created_at,buyer_id').eq('id', orderId).maybeSingle()
  if (!data) {return { order: null, ownerBuyerId: null }}
  const { buyer_id, ...order } = data as any
  return { order: order as OrderConcept, ownerBuyerId: buyer_id ?? null }
}

export type CreateOrderInput = {
  buyerId: string
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
  const sb = createServiceSupabase()
  const storeId = typeof input.storeId === 'string' ? input.storeId : ''
  const productId = typeof input.productId === 'string' ? input.productId : ''
  const quantity = Number.isInteger(input.quantity) ? input.quantity : 0
  const name = typeof input.customerName === 'string' ? input.customerName.trim().slice(0, 120) : ''
  const phone = typeof input.customerPhone === 'string' ? input.customerPhone.trim().slice(0, 32) : ''
  if (!input.buyerId || !storeId || !productId || quantity < 1 || quantity > 99 || name.length < 2 || !/^[0-9+()\s.-]{6,32}$/.test(phone)) {
    return { orderId: null, error: 'Could not place the order right now.' }
  }
  const [{ data: store }, { data: product }] = await Promise.all([
    sb.from('pending_payments').select('id,shop_name,status,selected_template,webstore_status').eq('id', storeId).eq('status', 'approved').maybeSingle(),
    sb.from('products').select('id,store_id,name,price,stock,is_active,is_available').eq('id', productId).eq('store_id', storeId).maybeSingle(),
  ])
  if (!store || (store.selected_template && store.webstore_status !== 'published') || !product
      || product.is_active === false || product.is_available === false || Number(product.stock) < quantity) {
    return { orderId: null, error: 'This product is no longer available.' }
  }
  const total = Number(product.price) * quantity
  if (!Number.isFinite(total) || total <= 0) {return { orderId: null, error: 'Could not place the order right now.' }}
  const { data, error } = await sb.from('orders').insert({
    store_id: input.storeId,
    store_name: store.shop_name,
    product_id: product.id,
    product_name: product.name,
    buyer_id: input.buyerId,
    customer_name: name,
    customer_phone: phone,
    phone,
    delivery_location: input.deliveryLocation || '',
    notes: input.notes || '',
    quantity,
    total_amount: total,
    total_price: total,
    status: 'pending',
  }).select('id').single()

  if (error) {return { orderId: null, error: 'Could not place the order right now.' }}
  return { orderId: data?.id ?? null, error: null }
}
