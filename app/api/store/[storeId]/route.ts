import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabase } from '@/lib/security/server-supabase'
import { getClientIp, rateLimit } from '@/lib/security/rate-limit'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function GET(request: NextRequest, { params }: { params: Promise<{ storeId: string }> }) {
  const limit = rateLimit(`public-store:${getClientIp(request)}`, 120, 60)
  if (!limit.allowed) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } })
  }
  const { storeId } = await params
  if (!UUID.test(storeId)) {return NextResponse.json({ error: 'Store not found.' }, { status: 404 })}

  try {
    const sb = createServiceSupabase()
    const { data: store, error: storeError } = await sb.from('pending_payments')
      .select('id,shop_name,owner_name,shop_whatsapp,shop_category,shop_region,shop_desc,plan,status,shop_logo_url,shop_cover_url,shop_city,shop_address,shop_instagram,shop_facebook,shop_tiktok,selected_template,webstore_status')
      .eq('id', storeId).eq('status', 'approved').maybeSingle()
    if (storeError) {return NextResponse.json({ error: 'Unable to load store.' }, { status: 503 })}
    if (!store || (store.selected_template && store.webstore_status !== 'published')) {
      return NextResponse.json({ error: 'Store not found.' }, { status: 404 })
    }

    const [{ data: products, error: productsError }, { data: orders, error: ordersError }] = await Promise.all([
      sb.from('products').select('id,name,price,stock,description,category,image_url,store_id,created_at,is_available')
        .eq('store_id', storeId).gt('stock', 0).order('created_at', { ascending: false }).limit(200),
      sb.from('orders').select('product_id').eq('store_id', storeId).neq('status', 'cancelled').limit(5000),
    ])
    if (productsError || ordersError) {return NextResponse.json({ error: 'Unable to load store.' }, { status: 503 })}

    const counts = new Map<string, number>()
    for (const order of orders || []) {
      if (order.product_id) {counts.set(order.product_id, (counts.get(order.product_id) || 0) + 1)}
    }
    const trendingProductIds = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([id]) => id)
    return NextResponse.json({
      store: {
        id: store.id, shop_name: store.shop_name, owner_name: store.owner_name,
        owner_phone: null, shop_whatsapp: store.shop_whatsapp, shop_category: store.shop_category,
        shop_region: store.shop_region, shop_desc: store.shop_desc, shop_color: null,
        shop_banner: store.shop_cover_url, shop_logo: store.shop_logo_url, shop_logo_url: store.shop_logo_url,
        shop_cover_url: store.shop_cover_url, shop_city: store.shop_city, shop_address: store.shop_address,
        shop_instagram: store.shop_instagram, shop_facebook: store.shop_facebook, shop_tiktok: store.shop_tiktok,
        plan: store.plan, status: store.status, webstore_status: store.webstore_status,
        selected_template: store.selected_template,
      },
      products: products || [],
      trendingProductIds,
    }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ error: 'Unable to load store.' }, { status: 503 })
  }
}
