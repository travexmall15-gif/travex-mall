import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabase } from '@/lib/security/server-supabase'
import { getClientIp, rateLimit } from '@/lib/security/rate-limit'

export async function POST(request: NextRequest) {
  const { allowed, retryAfterSeconds } = rateLimit(`seller-lookup:${getClientIp(request)}`, 20, 600)
  if (!allowed) {return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } })}
  try {
    const body = await request.json()
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })}
    const sb = createServiceSupabase()
    let { data: rows } = await sb.from('pending_payments')
      .select('id,shop_name,status').eq('auth_email', email)
      .order('created_at', { ascending: false }).limit(1)
    if (!rows?.length) {
      const result = await sb.from('pending_payments').select('id,shop_name,status')
        .eq('owner_email', email).order('created_at', { ascending: false }).limit(1)
      rows = result.data
    }
    const shop = rows?.[0]
    if (!shop) {return NextResponse.json({ error: 'No seller account found for that email.' }, { status: 404 })}
    if (shop.status !== 'approved') {return NextResponse.json({ error: shop.status === 'rejected' ? 'This application was rejected.' : 'This application is still pending approval.' }, { status: 403 })}
    return NextResponse.json({ id: shop.id, shop_name: shop.shop_name })
  } catch {
    return NextResponse.json({ error: 'Unable to verify this account right now.' }, { status: 503 })
  }
}
