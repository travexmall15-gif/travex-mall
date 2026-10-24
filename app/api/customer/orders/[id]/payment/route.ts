import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedCustomer } from '@/lib/security/customer-auth'
import { hasSameOrigin } from '@/lib/security/http'
import { getClientIp, rateLimit } from '@/lib/security/rate-limit'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const METHODS = new Set(['tigopesa', 'mpesa', 'yas', 'airtel', 'halotel', 'bank'])
const OPTIONS = new Set(['full', 'item-only', 'delivery-later'])

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!hasSameOrigin(request)) {return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })}
  const customer = await getAuthenticatedCustomer(request)
  if (!customer) {return NextResponse.json({ error: 'Sign in to submit payment.' }, { status: 401 })}
  const { id } = await params
  if (!UUID.test(id)) {return NextResponse.json({ error: 'Order not found.' }, { status: 404 })}
  const limit = rateLimit(`customer-payment:${customer.user.id}:${getClientIp(request)}`, 5, 3600)
  if (!limit.allowed) {return NextResponse.json({ error: 'Too many payment attempts.' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } })}
  let body: unknown
  try { body = await request.json() } catch { body = null }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {return NextResponse.json({ error: 'Invalid payment details.' }, { status: 400 })}
  const input = body as Record<string, unknown>
  const method = typeof input.payment_method === 'string' ? input.payment_method : ''
  const option = typeof input.payment_option === 'string' ? input.payment_option : ''
  const location = typeof input.delivery_location === 'string' ? input.delivery_location.trim().slice(0, 250) : ''
  const note = typeof input.note === 'string' ? input.note.trim().slice(0, 1000) : ''
  if (!METHODS.has(method) || !OPTIONS.has(option)) {return NextResponse.json({ error: 'Choose a valid payment method and option.' }, { status: 400 })}

  const { data, error } = await customer.sb.rpc('submit_order_payment', {
    p_order_id: id,
    p_buyer_id: customer.user.id,
    p_payment_method: method,
    p_payment_option: option,
    p_delivery_location: location,
    p_note: note,
  })
  if (error) {return NextResponse.json({ error: 'Unable to submit payment details.' }, { status: 503 })}
  if (data !== true) {return NextResponse.json({ error: 'Order not found or cannot accept a payment update.' }, { status: 409 })}
  return NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } })
}
