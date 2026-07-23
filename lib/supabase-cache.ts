// ═══════════════════════════════════════════════════════════
// SHOPNEKT — Cached Supabase Queries
// React cache() deduplicates requests per render pass
// ═══════════════════════════════════════════════════════════
import { cache } from 'react'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  'https://bscecjbgnjitlfmgwcic.supabase.co',
  'sb_publishable_giz1AS9CcdTiksOrW5U0rQ_yY5kkzos'
)

// ── Shops (ISR: 60s revalidate) ──────────────────────────
export const getShops = cache(async (region?: string, category?: string) => {
  let q = sb.from('shops')
    .select('id,shop_name,shop_slug,shop_category,shop_city,shop_region,logo_url,banner_url,rating,plan,is_verified,total_sales')
    .eq('is_verified', true)
    .eq('is_active', true)
    .order('plan', { ascending: false })
    .order('rating',  { ascending: false })
    .limit(40)

  if (region && region !== 'all')    q = q.eq('shop_region', region)
  if (category && category !== 'all') q = q.ilike('shop_category', `%${category}%`)

  const { data, error } = await q
  if (error) console.error('getShops:', error.message)
  return data || []
})

// ── Flash Deals ────────────────────────────────────────────
export const getFlashDeals = cache(async () => {
  const { data } = await sb.from('flash_deals')
    .select('id,product_name,original_price,discounted_price,discount_pct,image_url,store_name,store_id,ends_at,is_active')
    .eq('is_active', true)
    .order('discount_pct', { ascending: false })
    .limit(12)
  return data || []
})

// ── Group Buys ─────────────────────────────────────────────
export const getGroupBuys = cache(async () => {
  const { data } = await sb.from('group_buys')
    .select('id,product_name,target_members,current_members,discount_pct,image_url,store_name,store_id,status,ends_at')
    .eq('status', 'active')
    .order('current_members', { ascending: false })
    .limit(12)
  return data || []
})

// ── Vybe Feed ─────────────────────────────────────────────
export const getFeed = cache(async () => {
  const { data } = await sb.from('feed_posts')
    .select('id,store_id,store_name,caption,image_url,likes,tag,price,created_at')
    .order('created_at', { ascending: false })
    .limit(20)
  return data || []
})

// ── Campus Universities ────────────────────────────────────
export const getUniversities = cache(async () => {
  const { data } = await sb.from('campus_universities')
    .select('id,name,abbr,city,is_active')
    .eq('is_active', true)
    .order('name')
  return data || []
})

// ── Store by slug ──────────────────────────────────────────
export const getStoreBySlug = cache(async (slug: string) => {
  const { data } = await sb.from('shops')
    .select('id,shop_name,shop_slug,shop_category,shop_city,shop_description,logo_url,banner_url,rating,plan,shop_whatsapp,is_verified,owner_id')
    .eq('shop_slug', slug)
    .single()
  return data
})

// ── Store products ─────────────────────────────────────────
export const getStoreProducts = cache(async (shopId: string) => {
  const { data } = await sb.from('products')
    .select('id,name,price,original_price,image_url,category,description,is_available,stock')
    .eq('shop_id', shopId)
    .eq('is_available', true)
    .order('created_at', { ascending: false })
    .limit(50)
  return data || []
})

export { sb }
