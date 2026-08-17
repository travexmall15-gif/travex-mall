// ═══════════════════════════════════════════════════════════
// SHOPNEKT — Cached Supabase Queries
// React cache() deduplicates requests per render pass
// In-memory cache for client-side reuse across component renders
// ═══════════════════════════════════════════════════════════
import { cache } from 'react'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bscecjbgnjitlfmgwcic.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_giz1AS9CcdTiksOrW5U0rQ_yY5kkzos',
  {
    global: {
      fetch: (url, options = {}) => fetch(url, {
        ...options,
        cache: 'no-store',
        headers: { ...((options as any).headers || {}), 'Cache-Control': 'no-cache, no-store', 'Pragma': 'no-cache' },
      }),
    },
  }
)

// ── Client-side in-memory cache (per session) ─────────────
// Stores recently fetched data to avoid redundant network requests
// Keys are prefixed by query type for clarity
const clientCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes TTL for client cache

function getCached<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  const entry = clientCache.get(key)
  if (!entry) return null
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    clientCache.delete(key)
    return null
  }
  return entry.data as T
}

function setCached(key: string, data: any) {
  if (typeof window === 'undefined') return
  clientCache.set(key, { data, timestamp: Date.now() })
}

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

// ── MARKET: Get approved stores by market (CLIENT-SIDE OPTIMIZED) ──
// Returns cached data if available, otherwise fetches fresh
export async function getMarketStores(market: string): Promise<any[]> {
  const cacheKey = `market:${market}`
  const cached = getCached<any[]>(cacheKey)
  if (cached) return cached

  try {
    const { data } = await sb
      .from('pending_payments')
      .select('id,owner_name,owner_phone,shop_name,shop_category,shop_region,shop_whatsapp,shop_desc,shop_color,shop_logo,shop_font,shop_products,plan,status,slug,created_at,shop_market')
      .eq('status', 'approved')
      .order('plan', { ascending: false })
      .order('created_at', { ascending: false })

    const result = data || []
    setCached(cacheKey, result)
    return result
  } catch (error) {
    console.error('getMarketStores:', error)
    return []
  }
}

// ── Invalidate specific cache keys after mutations ────────
export function invalidateCache(pattern: string) {
  if (typeof window === 'undefined') return
  for (const key of clientCache.keys()) {
    if (pattern === '*' || key.startsWith(pattern)) {
      clientCache.delete(key)
    }
  }
}

export { sb }
