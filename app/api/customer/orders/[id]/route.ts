import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedCustomer } from '@/lib/security/customer-auth'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const customer = await getAuthenticatedCustomer(request)
  if (!customer) {return NextResponse.json({ error: 'Sign in to view this order.' }, { status: 401 })}
  const { id } = await params
  if (!UUID.test(id)) {return NextResponse.json({ error: 'Order not found.' }, { status: 404 })}
  const { data, error } = await customer.sb.from('orders')
    .select('id,product_name,store_name,status,total_amount,quantity,created_at,image_url,buyer_id')
    .eq('id', id).eq('buyer_id', customer.user.id).maybeSingle()
  if (error) {return NextResponse.json({ error: 'Unable to load this order.' }, { status: 503 })}
  if (!data) {return NextResponse.json({ error: 'Order not found.' }, { status: 404 })}
  const { buyer_id: _buyerId, ...order } = data
  return NextResponse.json({ order: { ...order, status: order.status === 'completed' ? 'delivered' : order.status } }, { headers: { 'Cache-Control': 'no-store' } })
}
