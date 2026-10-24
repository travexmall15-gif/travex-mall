import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabase, isActiveSeller } from '@/lib/security/server-supabase'
import { getClientIp, rateLimit } from '@/lib/security/rate-limit'
import { readSellerSession } from '@/lib/security/signed-session'
import { hasSameOrigin } from '@/lib/security/http'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const RESOURCES = new Set(['products', 'orders', 'sales', 'debts', 'flash-deals', 'group-orders', 'posts'])

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null
}

function boundedText(value: unknown, max: number, required = false): string | null {
  if (typeof value !== 'string') {return required ? null : ''}
  const text = value.trim()
  return text.length <= max && (!required || text.length > 0) ? text : null
}

function numberValue(value: unknown, min = 0, max = 100_000_000): number | null {
  const number = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(number) && number >= min && number <= max ? number : null
}

function safeMediaUrl(value: unknown): string | null | undefined {
  if (value === undefined || value === null || value === '') {return null}
  if (typeof value !== 'string' || value.length > 3500) {return undefined}
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : undefined
  } catch { return undefined }
}

async function sellerContext(request: NextRequest) {
  const session = readSellerSession(request)
  if (!session) {return { response: NextResponse.json({ error: 'Unauthorized.' }, { status: 401 }) }}
  if (session.market !== 'business') {return { response: NextResponse.json({ error: 'This seller account is not available.' }, { status: 403 }) }}
  const limit = rateLimit(`seller-data:${session.sellerId}:${getClientIp(request)}`, 120, 60)
  if (!limit.allowed) {return { response: NextResponse.json({ error: 'Too many requests.' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }) }}
  const sb = createServiceSupabase()
  if (!await isActiveSeller(sb, session.sellerId, session.market)) {return { response: NextResponse.json({ error: 'Seller account is not active.' }, { status: 403 }) }}
  return { session, sb }
}

export async function GET(request: NextRequest) {
  const context = await sellerContext(request)
  if (context.response) {return context.response}
  const resource = new URL(request.url).searchParams.get('resource') || ''
  if (!RESOURCES.has(resource)) {return NextResponse.json({ error: 'Invalid resource.' }, { status: 400 })}
  const { session, sb } = context
  try {
    const table = resource === 'sales' ? 'seller_sales' : resource === 'debts' ? 'seller_debts'
      : resource === 'flash-deals' ? 'flash_deals' : resource === 'group-orders' ? 'group_orders'
      : resource === 'posts' ? 'feed_posts' : resource
    const orderColumn = resource === 'sales' ? 'sale_date' : 'created_at'
    const selection = resource === 'group-orders' ? '*, group_order_members(count)' : '*'
    const query = sb.from(table).select(selection).eq('store_id', session.sellerId)
      .order(orderColumn, { ascending: false }).limit(300)
    const { data, error } = await query
    if (error) {return NextResponse.json({ error: 'Unable to load seller records.' }, { status: 503 })}
    return NextResponse.json({ data: data || [] }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ error: 'Unable to load seller records.' }, { status: 503 })
  }
}

export async function POST(request: NextRequest) {
  if (!hasSameOrigin(request)) {return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })}
  const context = await sellerContext(request)
  if (context.response) {return context.response}
  const { session, sb } = context
  let body: Record<string, unknown> | null
  try { body = record(await request.json()) } catch { body = null }
  if (!body) {return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })}
  const resource = typeof body.resource === 'string' ? body.resource : ''
  const action = typeof body.action === 'string' ? body.action : ''
  const id = typeof body.id === 'string' ? body.id : ''
  if (!RESOURCES.has(resource)) {return NextResponse.json({ error: 'Invalid resource.' }, { status: 400 })}
  const table = resource === 'sales' ? 'seller_sales' : resource === 'debts' ? 'seller_debts'
    : resource === 'flash-deals' ? 'flash_deals' : resource === 'group-orders' ? 'group_orders'
    : resource === 'posts' ? 'feed_posts' : resource
  const input = record(body.item) || body
  try {
    if (resource === 'orders') {
      const status = body.status === 'confirmed' || body.status === 'delivered' ? 'completed' : body.status
      if (action !== 'status' || !UUID.test(id) || !['pending', 'completed', 'cancelled'].includes(String(status))) {
        return NextResponse.json({ error: 'Invalid order update.' }, { status: 400 })
      }
      const { data, error } = await sb.from('orders').update({ status, updated_at: new Date().toISOString() })
        .eq('id', id).eq('store_id', session.sellerId).select('id,status').maybeSingle()
      if (error) {return NextResponse.json({ error: 'Unable to update order.' }, { status: 503 })}
      if (!data) {return NextResponse.json({ error: 'Order not found.' }, { status: 404 })}
      return NextResponse.json({ data })
    }

    if (resource === 'debts' && action === 'mark-paid') {
      if (!UUID.test(id)) {return NextResponse.json({ error: 'Invalid record.' }, { status: 400 })}
      const { data, error } = await sb.from(table).update({ is_paid: true, paid_at: new Date().toISOString() })
        .eq('id', id).eq('store_id', session.sellerId).select('id').maybeSingle()
      if (error) {return NextResponse.json({ error: 'Unable to update record.' }, { status: 503 })}
      if (!data) {return NextResponse.json({ error: 'Record not found.' }, { status: 404 })}
      return NextResponse.json({ data })
    }

    if (resource === 'flash-deals' || resource === 'group-orders' || resource === 'posts') {
      if (action === 'delete') {
        if (!UUID.test(id)) {return NextResponse.json({ error: 'Invalid record.' }, { status: 400 })}
        const { data, error } = await sb.from(table).delete().eq('id', id).eq('store_id', session.sellerId).select('id').maybeSingle()
        if (error) {return NextResponse.json({ error: 'Unable to delete record.' }, { status: 503 })}
        if (!data) {return NextResponse.json({ error: 'Record not found.' }, { status: 404 })}
        return NextResponse.json({ success: true })
      }
      if (action !== 'create') {return NextResponse.json({ error: 'Invalid seller action.' }, { status: 400 })}
      const { data: sellerProfile } = await sb.from('pending_payments').select('shop_name').eq('id', session.sellerId).maybeSingle()
      const shopName = boundedText(sellerProfile?.shop_name, 160) || ''
      let values: Record<string, unknown>
      if (resource === 'flash-deals') {
        const productName = boundedText(input.product_name, 160, true)
        const originalPrice = numberValue(input.original_price, 0.01)
        const dealPrice = numberValue(input.deal_price, 0.01)
        const maxOrders = numberValue(input.max_orders ?? 50, 1, 10_000)
        const endsAt = typeof input.ends_at === 'string' ? new Date(input.ends_at) : null
        const image = safeMediaUrl(input.image_url ?? input.product_image)
        if (!productName || originalPrice === null || dealPrice === null || dealPrice >= originalPrice || maxOrders === null || !endsAt || !Number.isFinite(endsAt.getTime()) || endsAt <= new Date() || endsAt.getTime() > Date.now() + 7 * 24 * 60 * 60 * 1000 || image === undefined) {
          return NextResponse.json({ error: 'Invalid flash deal details.' }, { status: 400 })
        }
        values = { store_id: session.sellerId, shop_name: shopName, product_name: productName, original_price: originalPrice, deal_price: dealPrice,
          discount_pct: Math.round((originalPrice - dealPrice) / originalPrice * 100), ends_at: endsAt.toISOString(), max_orders: Math.floor(maxOrders),
          product_image: image, status: 'active', store_type: 'business' }
      } else if (resource === 'group-orders') {
        const productName = boundedText(input.product_name, 160, true)
        const unitPrice = numberValue(input.unit_price, 0.01)
        const discount = numberValue(input.discount_pct, 0, 90)
        const minMembers = numberValue(input.min_members ?? 5, 2, 10_000)
        const expiresAt = typeof input.expires_at === 'string' ? new Date(input.expires_at) : null
        const image = safeMediaUrl(input.image_url ?? input.product_image)
        if (!productName || unitPrice === null || discount === null || minMembers === null || !expiresAt || !Number.isFinite(expiresAt.getTime()) || expiresAt <= new Date() || expiresAt.getTime() > Date.now() + 31 * 24 * 60 * 60 * 1000 || image === undefined) {
          return NextResponse.json({ error: 'Invalid group deal details.' }, { status: 400 })
        }
        values = { store_id: session.sellerId, shop_name: shopName, product_name: productName, unit_price: unitPrice, discount_pct: Math.floor(discount),
          min_members: Math.floor(minMembers), current_members: 0, expires_at: expiresAt.toISOString(), product_image: image, status: 'open' }
      } else {
        const content = boundedText(input.content ?? input.caption ?? input.post_text, 2000, true)
        const media = safeMediaUrl(input.media_url)
        const price = input.price === undefined || input.price === null || input.price === '' ? null : numberValue(input.price, 0.01)
        const tag = boundedText(input.tag ?? input.category, 80)
        if (!content || media === undefined || price === null && input.price !== undefined && input.price !== null && input.price !== '' || tag === null) {
          return NextResponse.json({ error: 'Invalid post details.' }, { status: 400 })
        }
        values = { store_id: session.sellerId, shop_name: shopName, content, caption: content, post_text: content, media_url: media,
          price, tag: tag || null, category: tag || null, likes: 0, likes_count: 0 }
      }
      const { data, error } = await sb.from(table).insert(values).select('id').single()
      if (error) {return NextResponse.json({ error: 'Unable to create seller record.' }, { status: 503 })}
      return NextResponse.json({ data }, { status: 201 })
    }

    if (action === 'delete') {
      if (!UUID.test(id)) {return NextResponse.json({ error: 'Invalid record.' }, { status: 400 })}
      const { data, error } = await sb.from(table).delete().eq('id', id).eq('store_id', session.sellerId).select('id').maybeSingle()
      if (error) {return NextResponse.json({ error: 'Unable to delete record.' }, { status: 503 })}
      if (!data) {return NextResponse.json({ error: 'Record not found.' }, { status: 404 })}
      return NextResponse.json({ success: true })
    }
    if (!['create', 'update'].includes(action) || (action === 'update' && !UUID.test(id))) {
      return NextResponse.json({ error: 'Invalid seller update.' }, { status: 400 })
    }
    let values: Record<string, unknown> = { store_id: session.sellerId }
    if (resource === 'products') {
      const name = boundedText(input.name, 120, true)
      const price = numberValue(input.price, 0.01)
      const description = boundedText(input.description, 4000)
      const category = boundedText(input.category, 80)
      const image = boundedText(input.image_url ?? input.image, 3_500_000)
      const stock = numberValue(input.stock ?? 0, 0, 1_000_000)
      if (!name || price === null || description === null || category === null || image === null || stock === null) {
        return NextResponse.json({ error: 'Invalid product details.' }, { status: 400 })
      }
      values = { ...values, name, price, description, category: category || null, image_url: image || null, image: image || null, stock: Math.floor(stock), is_active: input.is_active !== false, is_available: input.is_available !== false }
      const originalPrice = input.original_price === undefined ? null : numberValue(input.original_price, 0.01)
      if (input.original_price !== undefined && originalPrice === null) {return NextResponse.json({ error: 'Invalid original price.' }, { status: 400 })}
      if (originalPrice !== null) {values.original_price = originalPrice}
    } else if (resource === 'sales') {
      const description = boundedText(input.description, 500, true)
      const amount = numberValue(input.amount, 0.01)
      const category = boundedText(input.category ?? input.type, 80)
      const rawSaleDate = input.sale_date ?? input.date
      const saleDate = rawSaleDate === undefined || rawSaleDate === '' ? new Date().toISOString().slice(0, 10) : typeof rawSaleDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(rawSaleDate) ? rawSaleDate : null
      const notes = boundedText(input.notes, 2000)
      if (!description || amount === null || category === null || saleDate === null || notes === null) {return NextResponse.json({ error: 'Invalid sale details.' }, { status: 400 })}
      values = { ...values, description, amount, category: category || null, sale_date: saleDate, notes: notes || null }
    } else {
      const name = boundedText(input.debtor_name ?? input.person_name ?? input.name, 120, true)
      const phone = boundedText(input.phone, 32)
      const amount = numberValue(input.amount, 0.01)
      const description = boundedText(input.description, 500)
      const dueDate = input.due_date === undefined || input.due_date === '' ? null : typeof input.due_date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input.due_date) ? input.due_date : undefined
      if (!name || !phone || amount === null || description === null || dueDate === undefined) {return NextResponse.json({ error: 'Invalid debt details.' }, { status: 400 })}
      const type = boundedText(input.type, 40) || 'owed'
      if (!['owed_to_me', 'i_owe', 'owed'].includes(type)) {return NextResponse.json({ error: 'Invalid debt type.' }, { status: 400 })}
      values = { ...values, debtor_name: name, phone: phone || null, amount, description: description || null, due_date: dueDate, type, is_paid: input.is_paid === true || input.paid === true }
    }

    if (action === 'update') {
      const { data, error } = await sb.from(table).update(values).eq('id', id).eq('store_id', session.sellerId).select('id').maybeSingle()
      if (error) {return NextResponse.json({ error: 'Unable to update record.' }, { status: 503 })}
      if (!data) {return NextResponse.json({ error: 'Record not found.' }, { status: 404 })}
      return NextResponse.json({ data })
    }
    const { data, error } = await sb.from(table).insert(values).select('id').single()
    if (error) {return NextResponse.json({ error: 'Unable to save record.' }, { status: 503 })}
    return NextResponse.json({ data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Unable to save seller data.' }, { status: 400 })
  }
}
