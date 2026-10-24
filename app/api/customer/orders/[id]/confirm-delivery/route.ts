import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedCustomer } from '@/lib/security/customer-auth'
import { hasSameOrigin } from '@/lib/security/http'
import { getClientIp, rateLimit } from '@/lib/security/rate-limit'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!hasSameOrigin(request)) {return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })}
  const customer = await getAuthenticatedCustomer(request)
  if (!customer) {return NextResponse.json({ error: 'Sign in to confirm delivery.' }, { status: 401 })}
  const { id } = await params
  if (!UUID.test(id)) {return NextResponse.json({ error: 'Order not found.' }, { status: 404 })}
  const limit = rateLimit(`confirm-delivery:${customer.user.id}:${getClientIp(request)}`, 10, 3600)
  if (!limit.allowed) {return NextResponse.json({ error: 'Too many requests.' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } })}
  const { data, error } = await customer.sb.from('orders').update({ status: 'completed' })
    .eq('id', id).eq('buyer_id', customer.user.id).eq('status', 'payment_pending').select('id').maybeSingle()
  if (error) {return NextResponse.json({ error: 'Unable to confirm delivery.' }, { status: 503 })}
  if (!data) {return NextResponse.json({ error: 'Order is not ready for delivery confirmation.' }, { status: 409 })}
  return NextResponse.json({ success: true, status: 'delivered' }, { headers: { 'Cache-Control': 'no-store' } })
}
