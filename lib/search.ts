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

  const params = new URLSearchParams({ type: 'shops', q: q || category || '', limit: String(limit) })
  if (category) {params.set('category', category)}
  if (filters.region) {params.set('region', filters.region)}
  const response = await fetch(`/api/public/market?${params.toString()}`, { cache: 'no-store' })
  if (!response.ok) {return []}
  const result = await response.json().catch(() => null)
  const data = Array.isArray(result?.shops) ? result.shops : []

  if (!data || data.length === 0) return []

  // Batch-fetch real like counts for these shops (one query, not N).
  const ids = data.map((s: { id: string }) => s.id)
  const { data: likeRows } = await sb
    .from('shop_likes')
    .select('store_id')
    .in('store_id', ids)

  const counts = new Map<string, number>()
  for (const row of likeRows || []) {
    counts.set(row.store_id, (counts.get(row.store_id) || 0) + 1)
  }

  return data.map((s: any) => ({
    id: s.id,
    shop_name: s.shop_name,
    shop_category: s.shop_category,
    shop_region: s.shop_region,
    shop_logo: s.shop_logo_url,
    plan: s.plan,
    like_count: counts.get(s.id) || 0,
  }))
}

/** Real product search — matches product name or category. Optional structured filters (category/price range) narrow further. */
export async function searchProducts(query: string, limit = 12, filters: ProductSearchFilters = {}): Promise<ProductSearchResult[]> {
  const q = query.trim()
  const category = filters.category?.trim()
  if (!q && !category) return []

  const params = new URLSearchParams({ type: 'products', q: q || '', limit: String(limit) })
  if (category) {params.set('category', category)}
  if (filters.maxPrice !== undefined) {params.set('max_price', String(filters.maxPrice))}
  if (filters.minPrice !== undefined) {params.set('min_price', String(filters.minPrice))}
  const response = await fetch(`/api/public/market?${params.toString()}`, { cache: 'no-store' })
  if (!response.ok) {return []}
  const result = await response.json().catch(() => null)
  const data = Array.isArray(result?.products) ? result.products : []
  return data.map((p: any) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      image_url: p.image_url,
      store_id: p.store_id,
      shop_name: p.shop_name || '',
    }))
}
