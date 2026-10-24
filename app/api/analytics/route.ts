import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabase, isActiveSeller } from '@/lib/security/server-supabase'
import { readSellerSession, hasAdminSession } from '@/lib/security/signed-session'
import { getClientIp, rateLimit } from '@/lib/security/rate-limit'

const EVENTS = new Set(['view', 'whatsapp_click'])
const ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function POST(request: NextRequest) {
  const limit = rateLimit(`analytics-write:${getClientIp(request)}`, 120, 60)
  if (!limit.allowed) {return NextResponse.json({ error: 'Too many events.' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } })}
  try {
    const body = await request.json()
    const storeId = typeof body.store_id === 'string' ? body.store_id : ''
    const event = typeof body.event === 'string' ? body.event : ''
    const productId = body.product_id === undefined || body.product_id === null ? null : String(body.product_id)
    const source = body.source === undefined || body.source === null ? null : String(body.source)
    if (!ID_PATTERN.test(storeId) || !EVENTS.has(event)
      || (productId !== null && !ID_PATTERN.test(productId))
      || (source !== null && (source.length > 80 || !/^[a-zA-Z0-9 _:/.-]*$/.test(source)))) {
      return NextResponse.json({ error: 'Invalid event.' }, { status: 400 })
    }
    const sb = createServiceSupabase()
    const { data: businessStore } = await sb.from('pending_payments')
      .select('id,selected_template,webstore_status').eq('id', storeId).eq('status', 'approved').maybeSingle()
    if (!businessStore || (businessStore.selected_template && businessStore.webstore_status !== 'published')) {
      return NextResponse.json({ error: 'Store not found.' }, { status: 404 })
    }
    if (productId) {
      const { data: product } = await sb.from('products').select('id').eq('id', productId).eq('store_id', storeId).maybeSingle()
      if (!product) {return NextResponse.json({ error: 'Invalid product.' }, { status: 400 })}
    }
    const { error } = await sb.from('store_analytics').insert({ store_id: storeId, event, product_id: productId, source })
    if (error) {return NextResponse.json({ error: 'Unable to record event.' }, { status: 503 })}
    return NextResponse.json({ success: true }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const storeId = url.searchParams.get('store_id') || ''
  const rawDays = url.searchParams.get('days') || '30'
  const days = Number(rawDays)
  if (!ID_PATTERN.test(storeId) || !/^\d{1,3}$/.test(rawDays) || !Number.isInteger(days) || days < 1 || days > 365) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }
  const seller = readSellerSession(request)
  if (!hasAdminSession(request) && (!seller || seller.sellerId !== storeId)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: seller ? 403 : 401 })
  }
  const limit = rateLimit(`analytics-read:${storeId}:${getClientIp(request)}`, 60, 300)
  if (!limit.allowed) {return NextResponse.json({ error: 'Too many requests.' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } })}
  try {
    const sb = createServiceSupabase()
    if (seller && !hasAdminSession(request) && !await isActiveSeller(sb, seller.sellerId, seller.market)) {return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })}
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
    const [{ data, error }, { data: orderRows, error: ordersError }] = await Promise.all([
      sb.from('store_analytics').select('event,created_at').eq('store_id', storeId).gte('created_at', since).limit(10000),
      sb.from('orders').select('id').eq('store_id', storeId).neq('status', 'cancelled').gte('created_at', since).limit(10000),
    ])
    if (error || ordersError) {return NextResponse.json({ error: 'Unable to load analytics.' }, { status: 503 })}
    const events = data || []
    const views = events.filter(item => item.event === 'view').length
    const orders = orderRows?.length || 0
    const waClicks = events.filter(item => item.event === 'whatsapp_click').length
    const daily: Record<string, number> = {}
    for (const item of events) {
      if (item.event !== 'view') {continue}
      const day = item.created_at.slice(0, 10)
      daily[day] = (daily[day] || 0) + 1
    }
    return NextResponse.json({ views, orders, waClicks, conversion: views ? ((orders / views) * 100).toFixed(1) : '0', daily })
  } catch {
    return NextResponse.json({ error: 'Unable to load analytics.' }, { status: 503 })
  }
}
