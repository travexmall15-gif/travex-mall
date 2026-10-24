import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabase } from '@/lib/security/server-supabase'
import { getClientIp, rateLimit } from '@/lib/security/rate-limit'
import { isProductPubliclyAvailable } from '@/lib/products/public-visibility'

const MARKET_CATEGORIES: Record<string, string[]> = {
  fashion: ['Clothing','Shoes','Accessories','Beauty','Jewelry','Sports & Fitness','Arts & Crafts','Fashion & Clothing','Beauty & Health'],
  vehicle: ['Cars','Motorcycles','Spare Parts','Tyres','Auto Accessories','Automotive'],
  electronics: ['Phones','Laptops','TVs','Audio','Appliances','Gaming','Other Electronics','Electronics','Technology','Books & Stationery'],
}
const SHOP_FIELDS = 'id,status,shop_name,shop_category,shop_region,shop_desc,shop_whatsapp,plan,shop_logo_url,shop_cover_url,shop_city,shop_address,shop_instagram,shop_facebook,shop_tiktok,is_sponsored,selected_template,webstore_status,created_at'
const SEARCH = /^[\p{L}\p{N}\s&-]{1,80}$/u
type PublicShopRecord = {
  id: string
  status: string
  selected_template: string | null
  webstore_status: string | null
  [field: string]: unknown
}
type SearchStoreRow = { id: string; shop_name: string | null; shop_category: string | null; shop_desc: string | null; shop_logo_url: string | null; shop_region: string | null; plan: string | null }
type SearchProductRow = { id: string; name: string | null; price: number | null; category: string | null; image_url: string | null; store_id: string; stock: number; is_active?: boolean | null; is_available?: boolean | null }
type SearchPostRow = { id: string; store_id: string | null; shop_name: string | null; caption: string | null; post_text: string | null; media_url: string | null; category: string | null; tag: string | null }
type SearchDealRow = { id: string; store_id: string | null; shop_name: string | null; product_name: string | null; product_image: string | null; deal_price: number | null }
type SearchGroupRow = { id: string; store_id: string | null; shop_name: string | null; product_name: string | null; product_image: string | null; unit_price: number | null }

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
  const rawQuery = params.get('q')?.trim() || ''
  const query = safeText(rawQuery)
  const market = params.get('market') || ''
  const rawCategory = params.get('category')?.trim() || ''
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
    if (type === 'search') {
      if ((rawQuery && !query) || (rawCategory && !category)) {
        return NextResponse.json({ error: 'Invalid search text.' }, { status: 400 })
      }
      if (!query && !category) {return NextResponse.json({ results: [] })}

      const searchLimit = Math.min(requestedLimit, 12)
      const pattern = (value: string) => `%${value}%`
      const includeNonProducts = !category
      const shopsQuery = includeNonProducts
        ? visibleStores().or([
            `shop_name.ilike.${pattern(query)}`,
            `shop_category.ilike.${pattern(query)}`,
            `shop_desc.ilike.${pattern(query)}`,
            `shop_region.ilike.${pattern(query)}`,
          ].join(',')).order('plan', { ascending: false }).order('created_at', { ascending: false }).limit(searchLimit)
        : Promise.resolve({ data: [], error: null })
      const productsQuery = sb.from('products')
        .select('id,name,price,category,image_url,store_id,stock,is_active,is_available')
        .eq('is_available', true).gt('stock', 0).limit(searchLimit)
      productsQuery.or('is_active.eq.true,is_active.is.null')
      if (query) {productsQuery.or(`name.ilike.${pattern(query)},category.ilike.${pattern(query)}`)}
      if (category) {productsQuery.ilike('category', pattern(category))}
      const vybeQuery = includeNonProducts
        ? sb.from('feed_posts').select('id,store_id,shop_name,caption,post_text,media_url,category,tag,created_at')
            .or([
              `shop_name.ilike.${pattern(query)}`,
              `caption.ilike.${pattern(query)}`,
              `post_text.ilike.${pattern(query)}`,
              `category.ilike.${pattern(query)}`,
              `tag.ilike.${pattern(query)}`,
            ].join(',')).order('created_at', { ascending: false }).limit(searchLimit)
        : Promise.resolve({ data: [], error: null })
      const dealsQuery = includeNonProducts
        ? sb.from('flash_deals').select('id,store_id,shop_name,product_name,product_image,deal_price,ends_at,status')
            .eq('status', 'active').gt('ends_at', new Date().toISOString())
            .or(`shop_name.ilike.${pattern(query)},product_name.ilike.${pattern(query)}`)
            .order('ends_at', { ascending: true }).limit(searchLimit)
        : Promise.resolve({ data: [], error: null })
      const groupsQuery = includeNonProducts
        ? sb.from('group_orders').select('id,store_id,shop_name,product_name,product_image,unit_price,status,created_at')
            .eq('status', 'open')
            .or(`shop_name.ilike.${pattern(query)},product_name.ilike.${pattern(query)}`)
            .order('created_at', { ascending: false }).limit(searchLimit)
        : Promise.resolve({ data: [], error: null })

      const [shopsResult, productsResult, vybeResult, dealsResult, groupsResult] = await Promise.all([
        shopsQuery, productsQuery, vybeQuery, dealsQuery, groupsQuery,
      ])
      if (shopsResult.error || productsResult.error || vybeResult.error || dealsResult.error || groupsResult.error) {
        return NextResponse.json({ error: 'Unable to search the marketplace.' }, { status: 503 })
      }

      const shopRows = (shopsResult.data || []) as unknown as SearchStoreRow[]
      const products = ((productsResult.data || []) as unknown as SearchProductRow[]).filter(isProductPubliclyAvailable)
      const posts = (vybeResult.data || []) as unknown as SearchPostRow[]
      const deals = (dealsResult.data || []) as unknown as SearchDealRow[]
      const groups = (groupsResult.data || []) as unknown as SearchGroupRow[]
      const relatedStoreIds = [...new Set([
        ...products.map(product => product.store_id),
        ...posts.map(post => post.store_id),
        ...deals.map(deal => deal.store_id),
        ...groups.map(group => group.store_id),
      ].filter((id): id is string => typeof id === 'string' && id.length > 0))]
      const { data: relatedStores, error: relatedStoresError } = relatedStoreIds.length
        ? await visibleStores('id,shop_name').in('id', relatedStoreIds)
        : { data: [], error: null }
      if (relatedStoresError) {return NextResponse.json({ error: 'Unable to search the marketplace.' }, { status: 503 })}
      const visibleStoreNames = new Map(((relatedStores || []) as Array<{ id: string; shop_name: string | null }>).map(store => [store.id, store.shop_name || '']))

      const storeResults = shopRows
        .filter(shop => !String(shop.shop_category || '').toLowerCase().includes('service'))
        .map(shop => ({
          id: shop.id, kind: 'store', title: shop.shop_name || '', subtitle: shop.shop_category || '',
          description: shop.shop_desc || null, image_url: shop.shop_logo_url || null,
          category: shop.shop_category || null, region: shop.shop_region || null, store_id: shop.id,
          href: `/store/${encodeURIComponent(shop.id)}`, plan: shop.plan || null,
        }))
      const serviceResults = shopRows
        .filter(shop => String(shop.shop_category || '').toLowerCase().includes('service'))
        .map(shop => ({
          id: shop.id, kind: 'service', title: shop.shop_name || '', subtitle: shop.shop_category || 'Services',
          description: shop.shop_desc || null, image_url: shop.shop_logo_url || null,
          category: shop.shop_category || null, region: shop.shop_region || null, store_id: shop.id,
          href: `/store/${encodeURIComponent(shop.id)}`,
        }))
      const productResults = products
        .filter(product => visibleStoreNames.has(product.store_id))
        .map(product => ({
          id: product.id, kind: 'product', title: product.name || '', subtitle: visibleStoreNames.get(product.store_id) || '',
          description: null, image_url: product.image_url || null, category: product.category || null,
          store_id: product.store_id, price: Number(product.price) || 0,
          href: `/store/${encodeURIComponent(product.store_id)}?product=${encodeURIComponent(product.id)}`,
        }))
      const vybeResults = posts.filter((post): post is SearchPostRow & { store_id: string } => typeof post.store_id === 'string' && visibleStoreNames.has(post.store_id)).map(post => ({
        id: post.id, kind: 'vybe', title: visibleStoreNames.get(post.store_id) || post.shop_name || 'Vybe post',
        subtitle: post.category || post.tag || 'Vybe', description: post.caption || post.post_text || null,
        image_url: post.media_url || null, store_id: post.store_id || null,
        href: `/vybe#${encodeURIComponent(post.id)}`,
      }))
      const dealResults = deals.filter((deal): deal is SearchDealRow & { store_id: string } => typeof deal.store_id === 'string' && visibleStoreNames.has(deal.store_id)).map(deal => ({
        id: deal.id, kind: 'flash_deal', title: deal.product_name || '', subtitle: visibleStoreNames.get(deal.store_id) || deal.shop_name || 'Flash Deal',
        description: null, image_url: deal.product_image || null, category: null, store_id: deal.store_id || null,
        price: Number(deal.deal_price) || 0, href: `/flash-deals#deal-${encodeURIComponent(deal.id)}`,
      }))
      const groupResults = groups.filter((group): group is SearchGroupRow & { store_id: string } => typeof group.store_id === 'string' && visibleStoreNames.has(group.store_id)).map(group => ({
        id: group.id, kind: 'group_buy', title: group.product_name || '', subtitle: visibleStoreNames.get(group.store_id) || group.shop_name || 'Group Buy',
        description: null, image_url: group.product_image || null, category: null, store_id: group.store_id || null,
        price: Number(group.unit_price) || 0, href: `/group-buy/${encodeURIComponent(group.id)}`,
      }))
      return NextResponse.json({ results: [...storeResults, ...vybeResults, ...dealResults, ...productResults, ...serviceResults, ...groupResults] })
    }

    if (type === 'counts') {
      const { data, error } = await visibleStores('shop_category').limit(5000)
      if (error) {return NextResponse.json({ error: 'Unable to load marketplace.' }, { status: 503 })}
      const counts: Record<string, number> = { fashion: 0, vehicle: 0, electronics: 0 }
      for (const shop of (data || []) as unknown as Array<{ shop_category: string | null }>) {
        const match = Object.entries(MARKET_CATEGORIES).find(([, categories]) => categories.includes(shop.shop_category || ''))
        if (match) {counts[match[0]]++}
      }
      return NextResponse.json({ counts }, { headers: { 'Cache-Control': 'public, max-age=30, stale-while-revalidate=60' } })
    }

    if (type === 'products') {
      let productsQuery = sb.from('products').select('id,name,price,category,image_url,store_id,stock,is_active,is_available')
        .eq('is_available', true).gt('stock', 0).limit(requestedLimit)
      productsQuery = productsQuery.or('is_active.eq.true,is_active.is.null')
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
      const shopNames = new Map(((shops || []) as unknown as Array<{ id: string; shop_name: string | null }>).map(shop => [shop.id, shop.shop_name || '']))
      return NextResponse.json({ products: (products || []).filter(product => isProductPubliclyAvailable(product) && shopNames.has(product.store_id))
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
    let shops = (data || []) as unknown as PublicShopRecord[]
    if (type === 'market' && params.get('include_product_previews') === '1' && shops.length > 0) {
      const eligibleStoreIds = shops
        .filter(shop => shop.status === 'approved' && shop.selected_template && shop.webstore_status === 'published')
        .map(shop => shop.id)
      const previewsByStore = new Map<string, Array<{ id: string; name: string; image_url: string }>>()
      if (eligibleStoreIds.length > 0) {
        const { data: products, error: productsError } = await sb.from('products')
          .select('id,store_id,name,image_url,stock,is_active,is_available')
          .in('store_id', eligibleStoreIds).eq('is_available', true).gt('stock', 0)
          .or('is_active.eq.true,is_active.is.null')
          .not('image_url', 'is', null).limit(Math.min(eligibleStoreIds.length * 9, 900))
        if (productsError) {return NextResponse.json({ error: 'Unable to load shops.' }, { status: 503 })}
        for (const product of (products || []).filter(isProductPubliclyAvailable)) {
          const previews = previewsByStore.get(product.store_id) || []
          if (previews.length < 9 && product.image_url) {
            previews.push({ id: product.id, name: product.name || '', image_url: product.image_url })
            previewsByStore.set(product.store_id, previews)
          }
        }
      }
      shops = shops.map(shop => ({ ...shop, product_previews: previewsByStore.get(shop.id) || [] }))
    }
    return NextResponse.json({ shops }, { headers: { 'Cache-Control': 'public, max-age=30, stale-while-revalidate=60' } })
  } catch {
    return NextResponse.json({ error: 'Unable to load marketplace.' }, { status: 503 })
  }
}
