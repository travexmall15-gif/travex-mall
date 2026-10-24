import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabase } from '@/lib/security/server-supabase'
import { getClientIp, rateLimit } from '@/lib/security/rate-limit'
import { setSellerSession } from '@/lib/security/signed-session'

const TOKEN = /^[A-Za-z0-9_-]{24,256}$/

export async function GET(request: NextRequest) {
  const limit = rateLimit(`seller-one-time-token:${getClientIp(request)}`, 10, 900)
  if (!limit.allowed) {return NextResponse.json({ error: 'Too many sign-in attempts.' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } })}
  const token = new URL(request.url).searchParams.get('token') || ''
  if (!TOKEN.test(token)) {return NextResponse.json({ error: 'This sign-in link is invalid or has already been used.' }, { status: 401 })}
  try {
    const sb = createServiceSupabase()
    const { data: rows, error } = await sb.from('pending_payments')
      .select('id,shop_name,owner_name,owner_phone,plan,shop_number,token_expires_at,status')
      .eq('login_token', token).limit(1)
    const shop = rows?.[0]
    if (error || !shop || shop.status !== 'approved') {
      return NextResponse.json({ error: 'This sign-in link is invalid or has already been used.' }, { status: 401 })
    }
    if (shop.token_expires_at && new Date(shop.token_expires_at).getTime() <= Date.now()) {
      return NextResponse.json({ error: 'This sign-in link has expired. Use your PIN to sign in.' }, { status: 401 })
    }
    const { data: consumed, error: consumeError } = await sb.from('pending_payments')
      .update({ login_token: null }).eq('id', shop.id).eq('login_token', token).select('id').maybeSingle()
    if (consumeError || !consumed) {return NextResponse.json({ error: 'This sign-in link has already been used.' }, { status: 401 })}
    const response = NextResponse.json({
      success: true,
      seller: {
        id: shop.id, shop_name: shop.shop_name, owner_name: shop.owner_name,
        owner_phone: shop.owner_phone, plan: shop.plan, shop_number: shop.shop_number,
        market: 'business',
      },
    })
    setSellerSession(response, String(shop.id), 'business')
    return response
  } catch {
    return NextResponse.json({ error: 'Unable to sign in right now.' }, { status: 503 })
  }
}
