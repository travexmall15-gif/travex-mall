// Marketplace UI data access. Components call this HTTP repository rather
// than importing a database client. The API route is the current server-side
// adapter and can later be replaced without coupling the UI to Supabase.

export type MarketplaceSearchKind = 'store' | 'product' | 'vybe' | 'flash_deal' | 'service' | 'group_buy'

export type MarketplaceSearchResult = {
  id: string
  kind: MarketplaceSearchKind
  title: string
  subtitle: string
  description: string | null
  imageUrl: string | null
  category: string | null
  region?: string | null
  storeId?: string | null
  href: string
  price?: number
  plan?: string | null
  likeCount?: number
}

export type MarketplaceSearchInput = { query?: string; category?: string; limit?: number }

export interface MarketplaceSearchRepository {
  search: typeof searchMarketplace
  listProducts: typeof listMarketplaceProducts
}

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
  category?: string | null
}

export type ProductSearchFilters = { category?: string; maxPrice?: number; minPrice?: number }
export type ShopSearchFilters = { category?: string; region?: string }

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null
}

const httpMarketplaceSearchRepository: MarketplaceSearchRepository = {
  async search({ query = '', category = '', limit = 8 }) {
    const params = new URLSearchParams({ type: 'search', limit: String(limit) })
    if (query.trim()) {params.set('q', query.trim())}
    if (category.trim()) {params.set('category', category.trim())}
    const response = await fetch(`/api/public/market?${params.toString()}`, { cache: 'no-store' })
    if (!response.ok) {throw new Error('Marketplace search is unavailable.')}
    const payload = await response.json().catch(() => null)
    const rows: unknown[] = Array.isArray(payload?.results) ? payload.results : []
    const allowedKinds: MarketplaceSearchKind[] = ['store', 'product', 'vybe', 'flash_deal', 'service', 'group_buy']
    const mapped: MarketplaceSearchResult[] = rows.flatMap(value => {
      const row = asRecord(value)
      if (!row || typeof row.kind !== 'string' || !allowedKinds.includes(row.kind as MarketplaceSearchKind)) {return []}
      if (typeof row.id !== 'string' || typeof row.title !== 'string' || typeof row.href !== 'string') {return []}
      return [{
        id: row.id,
        kind: row.kind as MarketplaceSearchKind,
        title: row.title,
        subtitle: typeof row.subtitle === 'string' ? row.subtitle : '',
        description: typeof row.description === 'string' ? row.description : null,
        imageUrl: typeof row.image_url === 'string' ? row.image_url : null,
        category: typeof row.category === 'string' ? row.category : null,
        region: typeof row.region === 'string' ? row.region : null,
        storeId: typeof row.store_id === 'string' ? row.store_id : null,
        href: row.href,
        price: typeof row.price === 'number' && Number.isFinite(row.price) ? row.price : undefined,
        plan: typeof row.plan === 'string' ? row.plan : null,
      }]
    })
    const shopIds = mapped.filter(result => result.kind === 'store' || result.kind === 'service').map(result => result.id)
    if (shopIds.length === 0) {return mapped}

    const likesResponse = await fetch(`/api/shop-likes?counts_for=${encodeURIComponent(shopIds.join(','))}`, { cache: 'no-store' }).catch(() => null)
    const likesPayload = likesResponse?.ok ? await likesResponse.json().catch(() => null) : null
    const countRows: unknown[] = Array.isArray(likesPayload?.counts) ? likesPayload.counts : []
    const likeCounts = new Map<string, number>(countRows.flatMap(value => {
      const row = asRecord(value)
      return row && typeof row.store_id === 'string' && typeof row.like_count === 'number'
        ? [[row.store_id, row.like_count] as [string, number]]
        : []
    }))
    return mapped.map(result => ({ ...result, likeCount: likeCounts.get(result.id) || 0 }))
  },

  async listProducts(limit) {
    const response = await fetch(`/api/public/market?type=products&limit=${encodeURIComponent(String(limit))}`, { cache: 'no-store' })
    if (!response.ok) {throw new Error('Marketplace products are unavailable.')}
    const payload = await response.json().catch(() => null)
    const rows: unknown[] = Array.isArray(payload?.products) ? payload.products : []
    return rows.flatMap(value => {
      const product = asRecord(value)
      if (!product || typeof product.id !== 'string' || typeof product.name !== 'string' || typeof product.store_id !== 'string') {return []}
      return [{
        id: product.id,
        name: product.name,
        price: typeof product.price === 'number' && Number.isFinite(product.price) ? product.price : 0,
        image_url: typeof product.image_url === 'string' ? product.image_url : null,
        store_id: product.store_id,
        shop_name: typeof product.shop_name === 'string' ? product.shop_name : '',
        category: typeof product.category === 'string' ? product.category : null,
      }]
    })
  },
}

/** Domain-level marketplace search implemented through the current API adapter. */
export function searchMarketplace(input: MarketplaceSearchInput): Promise<MarketplaceSearchResult[]> {
  return httpMarketplaceSearchRepository.search(input)
}

/** Real, in-stock products from approved public WebStores for discovery rails. */
export function listMarketplaceProducts(limit = 8): Promise<ProductSearchResult[]> {
  return httpMarketplaceSearchRepository.listProducts(limit)
}

/** Real shop search — matches shop name or category, approved shops only. Optional structured filters narrow further (used by ShopNekt AI once category/region are known, not just free text). */
export async function searchShops(query: string, limit = 8, filters: ShopSearchFilters = {}): Promise<ShopSearchResult[]> {
  const q = query.trim()
  const category = filters.category?.trim()
  if (!q && !category) {return []}

  const params = new URLSearchParams({ type: 'shops', q: q || category || '', limit: String(limit) })
  if (category) {params.set('category', category)}
  if (filters.region) {params.set('region', filters.region)}
  const response = await fetch(`/api/public/market?${params.toString()}`, { cache: 'no-store' })
  if (!response.ok) {return []}
  const result = asRecord(await response.json().catch(() => null))
  const shopRows: unknown[] = Array.isArray(result?.shops) ? result.shops : []
  const data = shopRows.flatMap(value => {
    const shop = asRecord(value)
    if (!shop || typeof shop.id !== 'string' || typeof shop.shop_name !== 'string') {return []}
    return [{
      id: shop.id,
      shop_name: shop.shop_name,
      shop_category: typeof shop.shop_category === 'string' ? shop.shop_category : null,
      shop_region: typeof shop.shop_region === 'string' ? shop.shop_region : null,
      shop_logo_url: typeof shop.shop_logo_url === 'string' ? shop.shop_logo_url : null,
      plan: typeof shop.plan === 'string' ? shop.plan : null,
    }]
  })

  if (data.length === 0) {return []}

  // Batch-fetch aggregate like counts through the public, non-identifying view.
  const ids = data.map((s: { id: string }) => s.id)
  const likesResponse = await fetch(`/api/shop-likes?counts_for=${encodeURIComponent(ids.join(','))}`, { cache: 'no-store' }).catch(() => null)
  const likesResult = asRecord(likesResponse?.ok ? await likesResponse.json().catch(() => null) : null)
  const countRows: unknown[] = Array.isArray(likesResult?.counts) ? likesResult.counts : []
  const counts = new Map<string, number>(countRows.flatMap(value => {
    const row = asRecord(value)
    return row && typeof row.store_id === 'string' && typeof row.like_count === 'number'
      ? [[row.store_id, row.like_count] as [string, number]]
      : []
  }))

  return data.map(s => ({
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
  if (!q && !category) {return []}

  const params = new URLSearchParams({ type: 'products', q: q || '', limit: String(limit) })
  if (category) {params.set('category', category)}
  if (filters.maxPrice !== undefined) {params.set('max_price', String(filters.maxPrice))}
  if (filters.minPrice !== undefined) {params.set('min_price', String(filters.minPrice))}
  const response = await fetch(`/api/public/market?${params.toString()}`, { cache: 'no-store' })
  if (!response.ok) {return []}
  const result = asRecord(await response.json().catch(() => null))
  const productRows: unknown[] = Array.isArray(result?.products) ? result.products : []
  return productRows.flatMap(value => {
    const product = asRecord(value)
    if (!product || typeof product.id !== 'string' || typeof product.name !== 'string' || typeof product.store_id !== 'string') {return []}
    return [{
      id: product.id,
      name: product.name,
      price: typeof product.price === 'number' && Number.isFinite(product.price) ? product.price : 0,
      image_url: typeof product.image_url === 'string' ? product.image_url : null,
      store_id: product.store_id,
      shop_name: typeof product.shop_name === 'string' ? product.shop_name : '',
      category: typeof product.category === 'string' ? product.category : null,
    }]
  })
}
