import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabase } from '@/lib/security/server-supabase'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!UUID.test(id)) {return NextResponse.json({ error: 'Group deal not found.' }, { status: 404 })}
  try {
    const sb = createServiceSupabase()
    const { data: group, error } = await sb.from('group_orders')
      .select('id,store_id,shop_name,product_name,product_image,unit_price,discount_pct,min_members,current_members,expires_at,status')
      .eq('id', id).in('status', ['open', 'completed']).maybeSingle()
    if (error) {return NextResponse.json({ error: 'Unable to load group deal.' }, { status: 503 })}
    if (!group) {return NextResponse.json({ error: 'Group deal not found.' }, { status: 404 })}
    const { data: store } = await sb.from('pending_payments').select('id')
      .eq('id', group.store_id).eq('status', 'approved').maybeSingle()
    if (!store) {return NextResponse.json({ error: 'Group deal not found.' }, { status: 404 })}
    return NextResponse.json({ group }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ error: 'Unable to load group deal.' }, { status: 503 })
  }
}
