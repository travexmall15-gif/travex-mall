import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, getClientIp } from '@/lib/security/rate-limit'
import { createServiceSupabase } from '@/lib/security/server-supabase'
import { readSellerSession } from '@/lib/security/signed-session'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const shopId = typeof body.shop_id === 'string' ? body.shop_id : ''
    const market = body.market === undefined || body.market === 'business' ? 'business' : ''
    const periodDays = body.period_days === undefined ? 30 : Number(body.period_days)
    if (!shopId || !market || !Number.isInteger(periodDays) || periodDays < 1 || periodDays > 365) {
      return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
    }

    const session = readSellerSession(req)
    if (!session) {return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })}
    if (session.sellerId !== shopId || session.market !== market) {return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })}

    const limit = rateLimit(`dashboard-stats:${session.sellerId}:${getClientIp(req)}`, 60, 300)
    if (!limit.allowed) {return NextResponse.json({ error: 'Too many requests.' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } })}

    const sb = createServiceSupabase()
    const { data: store, error: storeError } = await sb.from('pending_payments').select('id,status').eq('id', shopId).maybeSingle()
    if (storeError) {return NextResponse.json({ error: 'Unable to load statistics.' }, { status: 503 })}
    const storeIsActive = (store as { status?: string } | null)?.status === 'approved'
    if (!store || !storeIsActive) {return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })}

    const since = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString()
    const [ordersResult, productsResult] = await Promise.all([
      sb.from('orders').select('id,status,total_amount,total_price,product_name,created_at')
        .eq('store_id', shopId).gte('created_at', since).order('created_at', { ascending: false }).limit(500),
      sb.from('products').select('id,name,price,stock').eq('store_id', shopId).limit(500),
    ])
    if (ordersResult.error || productsResult.error) {return NextResponse.json({ error: 'Unable to load statistics.' }, { status: 503 })}
    const orders = ordersResult.data || []
    const products = productsResult.data || []
    const stats = {
      total_orders: orders.length,
      pending_orders: orders.filter(order => order.status === 'pending').length,
      revenue: orders.filter(order => order.status !== 'cancelled')
        .reduce((sum, order) => sum + Number(order.total_amount || order.total_price || 0), 0),
      total_products: products.length,
    }
    return NextResponse.json({ stats, orders: orders.slice(0, 50), products })
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }
}
