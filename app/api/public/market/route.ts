import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabase } from '@/lib/security/server-supabase'
import { getClientIp, rateLimit } from '@/lib/security/rate-limit'

const MARKET_CATEGORIES: Record<string, string[]> = {
  fashion: ['Clothing','Shoes','Accessories','Beauty','Jewelry','Sports & Fitness','Arts & Crafts','Fashion & Clothing','Beauty & Health'],
  vehicle: ['Cars','Motorcycles','Spare Parts','Tyres','Auto Accessories','Automotive'],
  electronics: ['Phones','Laptops','TVs','Audio','Appliances','Gaming','Other Electronics','Electronics','Technology','Books & Stationery'],
}
const SHOP_FIELDS = 'id,shop_name,shop_category,shop_region,shop_desc,shop_whatsapp,plan,shop_logo_url,shop_cover_url,shop_city,shop_address,shop_instagram,shop_facebook,shop_tiktok,is_sponsored,selected_template,webstore_status,created_at'
const SEARCH = /^[\p{L}\p{N}\s-]{1,80}$/u

function safeText(value: string | null) {
  const text = value?.trim() || ''
  return text && SEARCH.test(text) ? text : ''
}

export async function GET(request: NextRequest) {
  const limit = rateLimit(`public-market:${getClientIp(request)}`, 120, 60)
  if (!limit.allowed) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } })
  }
  const params = new URL(request.url).searchParams
  const type = params.get('type') || 'shops'
  const query = safeText(params.get('q'))
  const market = params.get('market') || ''
  const category = safeText(params.get('category'))
  const region = safeText(params.get('region'))
  const city = safeText(params.get('city'))
  const rawLimit = params.get('limit') || '100'
  const requestedLimit = Number(rawLimit)
  if (!/^\d{1,3}$/.test(rawLimit) || !Number.isInteger(requestedLimit) || requestedLimit < 1 || requestedLimit > 100) {
    return NextResponse.json({ error: 'Invalid result limit.' }, { status: 400 })
  }
  const sb = createServiceSupabase()
  const visibleStores = (fields = SHOP_FIELDS) => sb.from('pending_payments').select(fields)
    .eq('status', 'approved').or('selected_template.is.null,webstore_status.eq.published')

  try {
    if (type === 'counts') {
      const { data, error } = await visibleStores('shop_category').limit(5000)
      if (error) {return NextResponse.json({ error: 'Unable to load marketplace.' }, { status: 503 })}
      const counts: Record<string, number> = { fashion: 0, vehicle: 0, electronics: 0 }
      for (const shop of (data || []) as Array<{ shop_category: string | null }>) {
        const match = Object.entries(MARKET_CATEGORIES).find(([, categories]) => categories.includes(shop.shop_category || ''))
        if (match) {counts[match[0]]++}
      }
      return NextResponse.json({ counts }, { headers: { 'Cache-Control': 'public, max-age=30, stale-while-revalidate=60' } })
    }

    if (type === 'products') {
      let productsQuery = sb.from('products').select('id,name,price,category,image_url,store_id,stock,is_available')
        .eq('is_available', true).gt('stock', 0).limit(requestedLimit)
      if (query) {productsQuery = productsQuery.ilike('name', `%${query}%`)}
      if (category) {productsQuery = productsQuery.ilike('category', `%${category}%`)}
      if (params.has('max_price')) {
        const maxPrice = Number(params.get('max_price'))
        if (!Number.isFinite(maxPrice) || maxPrice < 0 || maxPrice > 100_000_000) {return NextResponse.json({ error: 'Invalid price filter.' }, { status: 400 })}
        productsQuery = productsQuery.lte('price', maxPrice)
      }
      if (params.has('min_price')) {
        const minPrice = Number(params.get('min_price'))
        if (!Number.isFinite(minPrice) || minPrice < 0 || minPrice > 100_000_000) {return NextResponse.json({ error: 'Invalid price filter.' }, { status: 400 })}
        productsQuery = productsQuery.gte('price', minPrice)
      }
      const { data: products, error } = await productsQuery
      if (error) {return NextResponse.json({ error: 'Unable to search products.' }, { status: 503 })}
      const ids = [...new Set((products || []).map(product => product.store_id))]
      if (!ids.length) {return NextResponse.json({ products: [] })}
      const { data: shops, error: shopsError } = await visibleStores().in('id', ids)
      if (shopsError) {return NextResponse.json({ error: 'Unable to search products.' }, { status: 503 })}
      const shopNames = new Map(((shops || []) as Array<{ id: string; shop_name: string | null }>).map(shop => [shop.id, shop.shop_name || '']))
      return NextResponse.json({ products: (products || []).filter(product => shopNames.has(product.store_id))
        .map(product => ({ ...product, shop_name: shopNames.get(product.store_id) })) })
    }

    let queryBuilder = visibleStores().order('plan', { ascending: false }).order('created_at', { ascending: false }).limit(type === 'sponsored' ? Math.min(requestedLimit, 12) : requestedLimit)
    if (type === 'sponsored') {queryBuilder = queryBuilder.eq('is_sponsored', true)}
    if (type === 'market') {
      const categories = MARKET_CATEGORIES[market]
      if (!categories) {return NextResponse.json({ error: 'Invalid market.' }, { status: 400 })}
      queryBuilder = queryBuilder.in('shop_category', categories)
    }
    if (category) {queryBuilder = queryBuilder.ilike('shop_category', `%${category}%`)}
    if (region) {queryBuilder = queryBuilder.ilike('shop_region', `%${region}%`)}
    if (city) {queryBuilder = queryBuilder.ilike('shop_city', `%${city}%`)}
    if (query) {queryBuilder = queryBuilder.ilike('shop_name', `%${query}%`)}
    const { data, error } = await queryBuilder
    if (error) {return NextResponse.json({ error: 'Unable to load shops.' }, { status: 503 })}
    return NextResponse.json({ shops: data || [] }, { headers: { 'Cache-Control': 'public, max-age=30, stale-while-revalidate=60' } })
  } catch {
    return NextResponse.json({ error: 'Unable to load marketplace.' }, { status: 503 })
  }
}
