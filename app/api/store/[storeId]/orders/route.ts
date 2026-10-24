import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabase } from '@/lib/security/server-supabase'
import { getClientIp, rateLimit } from '@/lib/security/rate-limit'
import { hasSameOrigin } from '@/lib/security/http'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const PHONE = /^[0-9+()\s.-]{6,32}$/

export async function POST(request: NextRequest, { params }: { params: Promise<{ storeId: string }> }) {
  if (!hasSameOrigin(request)) {return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })}
  const limit = rateLimit(`public-order:${getClientIp(request)}`, 5, 3600)
  if (!limit.allowed) {
    return NextResponse.json({ error: 'Too many order attempts. Try again later.' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } })
  }

  const { storeId } = await params
  if (!UUID.test(storeId)) {return NextResponse.json({ error: 'Store not found.' }, { status: 404 })}
  try {
    const body = await request.json()
    const productId = typeof body.product_id === 'string' ? body.product_id : ''
    const customerName = typeof body.customer_name === 'string' ? body.customer_name.trim() : ''
    const customerPhone = typeof body.customer_phone === 'string' ? body.customer_phone.trim() : ''
    const quantity = body.quantity
    const notes = typeof body.notes === 'string' ? body.notes.trim() : ''
    const deliveryLocation = typeof body.delivery_location === 'string' ? body.delivery_location.trim() : ''
    if (!UUID.test(productId) || customerName.length < 2 || customerName.length > 120
      || !PHONE.test(customerPhone) || !Number.isInteger(quantity) || quantity < 1 || quantity > 99
      || notes.length > 1000 || deliveryLocation.length > 250) {
      return NextResponse.json({ error: 'Please check your order details.' }, { status: 400 })
    }

    const sb = createServiceSupabase()
    let buyerId: string | null = null
    const authorization = request.headers.get('authorization') || ''
    if (authorization) {
      const match = /^Bearer\s+(.+)$/i.exec(authorization)
      if (!match) {return NextResponse.json({ error: 'Invalid customer session.' }, { status: 401 })}
      const { data: authData, error: authError } = await sb.auth.getUser(match[1])
      if (authError || !authData.user) {return NextResponse.json({ error: 'Invalid customer session.' }, { status: 401 })}
      buyerId = authData.user.id
    }
    const [{ data: store, error: storeError }, { data: product, error: productError }] = await Promise.all([
      sb.from('pending_payments').select('id,shop_name,status,selected_template,webstore_status')
        .eq('id', storeId).eq('status', 'approved').maybeSingle(),
      sb.from('products').select('id,store_id,name,price,stock,is_active,is_available')
        .eq('id', productId).eq('store_id', storeId).maybeSingle(),
    ])
    if (storeError || productError) {return NextResponse.json({ error: 'Unable to place your order.' }, { status: 503 })}
    if (!store || (store.selected_template && store.webstore_status !== 'published')) {
      return NextResponse.json({ error: 'Store not found.' }, { status: 404 })
    }
    if (!product || product.stock < quantity || product.is_active === false || product.is_available === false) {
      return NextResponse.json({ error: 'This product is no longer available in that quantity.' }, { status: 409 })
    }

    const total = Number(product.price) * quantity
    const orderNotes = [deliveryLocation ? `Delivery location: ${deliveryLocation}` : '', notes].filter(Boolean).join('\n') || null
    const { data: order, error } = await sb.from('orders').insert({
      store_id: storeId,
      store_name: store.shop_name,
      product_id: product.id,
      product_name: product.name,
      customer_name: customerName,
      customer_phone: customerPhone,
      phone: customerPhone,
      ...(buyerId ? { buyer_id: buyerId } : {}),
      quantity,
      total_amount: total,
      total_price: total,
      notes: orderNotes,
      status: 'pending',
    }).select('id').single()
    if (error || !order) {return NextResponse.json({ error: 'Unable to place your order.' }, { status: 503 })}
    return NextResponse.json({ success: true, order_id: order.id }, { status: 201, headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ error: 'Invalid order request.' }, { status: 400 })
  }
}
