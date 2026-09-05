// ═══════════════════════════════════════════════════════════
// SHOPNEKT — Home Search (Batch 3)
// Searches ONLY shops + products, using real database data.
// Deliberately excludes Vybe / Flash Deals / Group Buy / AI / Orders.
// ═══════════════════════════════════════════════════════════
import { sb } from '@/lib/supabase'

export type ShopSearchResult = {
  id: string
  shop_name: string
  shop_category: string | null
  shop_region: string | null
  shop_logo: string | null
  plan: string | null
  like_count: number
}

export type ProductSearchResult = {
  id: string
  name: string
  price: number
  image_url: string | null
  store_id: string
  shop_name: string
}

export type ProductSearchFilters = { category?: string; maxPrice?: number; minPrice?: number }
export type ShopSearchFilters = { category?: string; region?: string }

/** Real shop search — matches shop name or category, approved shops only. Optional structured filters narrow further (used by ShopNekt AI once category/region are known, not just free text). */
export async function searchShops(query: string, limit = 8, filters: ShopSearchFilters = {}): Promise<ShopSearchResult[]> {
  const q = query.trim()
  const category = filters.category?.trim()
  if (!q && !category) return []

  let builder = sb
    .from('pending_payments')
    .select('id, shop_name, shop_category, shop_region, shop_logo, plan')
    .eq('status', 'approved')

  if (q) builder = builder.or(`shop_name.ilike.%${q}%,shop_category.ilike.%${q}%`)
  if (category) builder = builder.ilike('shop_category', `%${category}%`)
  if (filters.region) builder = builder.eq('shop_region', filters.region)

  const { data } = await builder.limit(limit)

  if (!data || data.length === 0) return []

  // Batch-fetch real like counts for these shops (one query, not N).
  const ids = data.map(s => s.id)
  const { data: likeRows } = await sb
    .from('shop_likes')
    .select('store_id')
    .in('store_id', ids)

  const counts = new Map<string, number>()
  for (const row of likeRows || []) {
    counts.set(row.store_id, (counts.get(row.store_id) || 0) + 1)
  }

  return data.map(s => ({
    id: s.id,
    shop_name: s.shop_name,
    shop_category: s.shop_category,
    shop_region: s.shop_region,
    shop_logo: s.shop_logo,
    plan: s.plan,
    like_count: counts.get(s.id) || 0,
  }))
}

/** Real product search — matches product name or category. Optional structured filters (category/price range) narrow further. */
export async function searchProducts(query: string, limit = 12, filters: ProductSearchFilters = {}): Promise<ProductSearchResult[]> {
  const q = query.trim()
  const category = filters.category?.trim()
  if (!q && !category) return []

  let builder = sb.from('products').select('id, name, price, image_url, store_id')

  if (q) builder = builder.or(`name.ilike.%${q}%,category.ilike.%${q}%`)
  if (category) builder = builder.ilike('category', `%${category}%`)
  if (filters.maxPrice !== undefined) builder = builder.lte('price', filters.maxPrice)
  if (filters.minPrice !== undefined) builder = builder.gte('price', filters.minPrice)

  const { data } = await builder.limit(limit)

  if (!data || data.length === 0) return []

  // Batch-fetch shop names for these products' stores (one query, not N).
  const storeIds = [...new Set(data.map(p => p.store_id))]
  const { data: shops } = await sb
    .from('pending_payments')
    .select('id, shop_name')
    .in('id', storeIds)
    .eq('status', 'approved')

  const shopNames = new Map((shops || []).map(s => [s.id, s.shop_name]))

  return data
    .filter(p => shopNames.has(p.store_id)) // only show products from live, approved shops
    .map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      image_url: p.image_url,
      store_id: p.store_id,
      shop_name: shopNames.get(p.store_id) || '',
    }))
}
