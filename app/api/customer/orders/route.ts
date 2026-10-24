import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedCustomer } from '@/lib/security/customer-auth'

export async function GET(request: NextRequest) {
  const customer = await getAuthenticatedCustomer(request)
  if (!customer) {return NextResponse.json({ error: 'Sign in to view your orders.' }, { status: 401 })}
  const { data, error } = await customer.sb.from('orders')
    .select('id,product_name,store_name,status,total_amount,created_at,image_url,buyer_id')
    .eq('buyer_id', customer.user.id).order('created_at', { ascending: false }).limit(100)
  if (error) {return NextResponse.json({ error: 'Unable to load orders.' }, { status: 503 })}
  const orders = (data || []).map(({ buyer_id: _buyerId, ...order }) => ({
    ...order,
    status: order.status === 'completed' ? 'delivered' : order.status,
  }))
  return NextResponse.json({ orders }, { headers: { 'Cache-Control': 'no-store' } })
}
