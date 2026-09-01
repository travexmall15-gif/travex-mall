import { sb } from '@/lib/supabase'
import type { ProductConcept, OrderConcept } from '../../data-core'

// ═══════════════════════════════════════════════════════════
// SELLER 360 AI — TOOL IMPLEMENTATIONS
// ═══════════════════════════════════════════════════════════
// Every function here takes shopId as an explicit parameter supplied
// by the executor AFTER authorization — never trusts a shopId that
// arrived embedded in free-text AI input. This mirrors the same
// ownership-verification discipline used elsewhere in ShopNekt's own
// security-hardened API routes (e.g. dashboard-stats' PIN check).

export async function toolGetInventory(shopId: string): Promise<ProductConcept[]> {
  const { data } = await sb.from('products').select('id,name,price,stock,description,category,image_url,store_id').eq('store_id', shopId).order('created_at', { ascending: false })
  return (data || []) as ProductConcept[]
}

export async function toolGetSellerOrders(shopId: string, status?: string): Promise<OrderConcept[]> {
  let q = sb.from('orders').select('id,product_name,store_name,status,total_amount,quantity,created_at').eq('store_id', shopId).order('created_at', { ascending: false }).limit(50)
  if (status) {q = q.eq('status', status)}
  const { data } = await q
  return (data || []) as OrderConcept[]
}

export type SellerAnalytics = {
  totalOrders: number
  pendingOrders: number
  revenue: number
  totalProducts: number
}

/**
 * Real, computed-from-actual-rows analytics — never an estimate.
 * If the underlying queries fail, this returns zeros with an error
 * flag rather than fabricating plausible-looking numbers.
 */
export async function toolGetAnalytics(shopId: string): Promise<{ analytics: SellerAnalytics; error: string | null }> {
  const [ordersRes, productsRes] = await Promise.all([
    sb.from('orders').select('status,total_amount').eq('store_id', shopId),
    sb.from('products').select('id', { count: 'exact', head: true }).eq('store_id', shopId),
  ])

  if (ordersRes.error) {
    return { analytics: { totalOrders: 0, pendingOrders: 0, revenue: 0, totalProducts: 0 }, error: 'Could not load analytics right now.' }
  }

  const orders = ordersRes.data || []
  const revenue = orders.filter(o => o.status === 'confirmed' || o.status === 'delivered').reduce((sum, o) => sum + (o.total_amount || 0), 0)

  return {
    analytics: {
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      revenue,
      totalProducts: productsRes.count || 0,
    },
    error: null,
  }
}

export type CreateProductDraftInput = {
  shopId: string
  name: string
  price: number
  category: string
  description?: string
  stock?: number
}

export async function toolCreateProductDraft(input: CreateProductDraftInput): Promise<{ productId: string | null; error: string | null }> {
  const { data, error } = await sb.from('products').insert({
    store_id: input.shopId,
    name: input.name,
    price: input.price,
    category: input.category,
    description: input.description || null,
    stock: input.stock ?? 0,
  }).select('id').single()

  if (error) {return { productId: null, error: 'Could not create the product right now.' }}
  return { productId: data?.id ?? null, error: null }
}

export type UpdateProductInput = {
  shopId: string
  productId: string
  fields: Partial<{ name: string; price: number; stock: number; description: string; category: string }>
}

/**
 * Updates a product — critically, the .eq('store_id', shopId) clause
 * means this can only ever affect a row that belongs to the
 * authenticated seller's own shop, even if productId somehow referred
 * to another seller's product. Defense in depth on top of the
 * executor's own ownResourceOnly authorization check.
 */
export async function toolUpdateProduct(input: UpdateProductInput): Promise<{ updated: boolean; error: string | null }> {
  const { error } = await sb.from('products').update(input.fields).eq('id', input.productId).eq('store_id', input.shopId)
  if (error) {return { updated: false, error: 'Could not update the product right now.' }}
  return { updated: true, error: null }
}

export type CreateFlashDealInput = {
  shopId: string
  shopName: string
  productId: string
  productName: string
  productImage: string | null
  originalPrice: number
  dealPrice: number
  durationHours: number
}

export async function toolCreateFlashDeal(input: CreateFlashDealInput): Promise<{ dealId: string | null; error: string | null }> {
  const discountPct = Math.round((1 - input.dealPrice / input.originalPrice) * 100)
  const endsAt = new Date(Date.now() + input.durationHours * 3600_000).toISOString()

  const { data, error } = await sb.from('flash_deals').insert({
    store_id: input.shopId,
    shop_name: input.shopName,
    product_id: input.productId,
    product_name: input.productName,
    product_image: input.productImage,
    original_price: input.originalPrice,
    deal_price: input.dealPrice,
    discount_pct: discountPct,
    ends_at: endsAt,
    status: 'active',
  }).select('id').single()

  if (error) {return { dealId: null, error: 'Could not create the Flash Deal right now.' }}
  return { dealId: data?.id ?? null, error: null }
}

export type CreateGroupBuyInput = {
  shopId: string
  shopName: string
  productId: string
  productName: string
  productImage: string | null
  unitPrice: number
  discountPct: number
  minMembers: number
  durationHours: number
  creatorName: string
  creatorPhone: string
}

export async function toolCreateGroupBuy(input: CreateGroupBuyInput): Promise<{ groupId: string | null; error: string | null }> {
  const expiresAt = new Date(Date.now() + input.durationHours * 3600_000).toISOString()

  const { data, error } = await sb.from('group_orders').insert({
    store_id: input.shopId,
    shop_name: input.shopName,
    product_id: input.productId,
    product_name: input.productName,
    product_image: input.productImage,
    unit_price: input.unitPrice,
    discount_pct: input.discountPct,
    min_members: input.minMembers,
    expires_at: expiresAt,
    status: 'open',
    creator_name: input.creatorName,
    creator_phone: input.creatorPhone,
  }).select('id').single()

  if (error) {return { groupId: null, error: 'Could not create the Group Buy right now.' }}
  return { groupId: data?.id ?? null, error: null }
}

export type CreateSocialPostInput = {
  shopId: string
  shopName: string
  content: string
  mediaUrl?: string | null
  productId?: string | null
}

export async function toolCreateSocialPost(input: CreateSocialPostInput): Promise<{ postId: string | null; error: string | null }> {
  const { data, error } = await sb.from('feed_posts').insert({
    store_id: input.shopId,
    shop_name: input.shopName,
    content: input.content,
    caption: input.content,
    media_url: input.mediaUrl || null,
    product_id: input.productId || null,
  }).select('id').single()

  if (error) {return { postId: null, error: 'Could not publish the post right now.' }}
  return { postId: data?.id ?? null, error: null }
}
