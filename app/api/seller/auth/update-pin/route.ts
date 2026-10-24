import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabase, isActiveSeller } from '@/lib/security/server-supabase'
import { readSellerSession } from '@/lib/security/signed-session'
import { getClientIp, rateLimit } from '@/lib/security/rate-limit'
import { hasSameOrigin } from '@/lib/security/http'

export async function POST(request: NextRequest) {
  if (!hasSameOrigin(request)) {return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })}
  const session = readSellerSession(request)
  if (!session) {return NextResponse.json({ error: 'Sign in before changing your PIN.' }, { status: 401 })}
  const limit = rateLimit(`seller-pin-change:${session.sellerId}:${getClientIp(request)}`, 5, 3600)
  if (!limit.allowed) {return NextResponse.json({ error: 'Too many PIN changes. Try again later.' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } })}
  try {
    const { pin } = await request.json()
    if (typeof pin !== 'string' || !/^\d{4}$/.test(pin)) {return NextResponse.json({ error: 'PIN must be exactly 4 digits.' }, { status: 400 })}
    const sb = createServiceSupabase()
    if (!await isActiveSeller(sb, session.sellerId, session.market)) {return NextResponse.json({ error: 'Seller account is not active.' }, { status: 403 })}
    const { error } = await sb.rpc('set_seller_pin', { p_store_id: session.sellerId, p_market: session.market, p_pin: pin })
    if (error) {return NextResponse.json({ error: 'Unable to update PIN.' }, { status: 503 })}
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }
}
