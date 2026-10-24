import { createHmac } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabase } from '@/lib/security/server-supabase'
import { getClientIp, rateLimit } from '@/lib/security/rate-limit'
import { setSellerSession } from '@/lib/security/signed-session'

export async function POST(request: NextRequest) {
  const { allowed, retryAfterSeconds } = rateLimit(`seller-pin-ip:${getClientIp(request)}`, 30, 900)
  if (!allowed) {return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } })}
  try {
    const body = await request.json()
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const pin = typeof body.pin === 'string' ? body.pin : ''
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\d{4}$/.test(pin)) {
      return NextResponse.json({ error: 'Email or PIN is incorrect.' }, { status: 400 })
    }

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
    if (!shop || shop.status !== 'approved') {return NextResponse.json({ error: 'Email or PIN is incorrect.' }, { status: 401 })}

    const sessionSecret = process.env.SELLER_SESSION_SECRET
    if (!sessionSecret || sessionSecret.length < 32) {return NextResponse.json({ error: 'Seller sign-in is not configured.' }, { status: 503 })}
    const rateKey = createHmac('sha256', sessionSecret)
      // Account-wide lockout cannot be bypassed by rotating source IPs.
      .update(`${shop.id}|business`).digest('hex')
    const { data: valid, error } = await sb.rpc('verify_seller_pin', {
      p_store_id: String(shop.id), p_market: 'business', p_pin: pin, p_rate_key: rateKey,
    })
    if (error) {return NextResponse.json({ error: 'Seller sign-in is temporarily unavailable.' }, { status: 503 })}
    if (!valid) {
      const { data: lock } = await sb.from('seller_pin_attempts')
        .select('locked_until').eq('rate_key', rateKey).maybeSingle()
      if (lock?.locked_until && new Date(lock.locked_until).getTime() > Date.now()) {
        const seconds = Math.ceil((new Date(lock.locked_until).getTime() - Date.now()) / 1000)
        return NextResponse.json({ error: 'Too many incorrect PIN attempts. Try again in 15 minutes.' }, { status: 429, headers: { 'Retry-After': String(seconds) } })
      }
      return NextResponse.json({ error: 'Email or PIN is incorrect.' }, { status: 401 })
    }

    const response = NextResponse.json({ success: true, seller: { id: shop.id, shop_name: shop.shop_name, market: 'business' } })
    setSellerSession(response, String(shop.id), 'business')
    return response
  } catch {
    return NextResponse.json({ error: 'Unable to sign in right now.' }, { status: 503 })
  }
}
