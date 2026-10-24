import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabase, isActiveSeller } from '@/lib/security/server-supabase'
import { hasAdminSession, readSellerSession } from '@/lib/security/signed-session'
import { getClientIp, rateLimit } from '@/lib/security/rate-limit'
import { hasSameOrigin } from '@/lib/security/http'

const STORE_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function POST(request: NextRequest) {
  if (!hasSameOrigin(request)) {return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })}
  const session = readSellerSession(request)
  if (!session) {return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })}
  const limit = rateLimit(`push-subscribe:${session.sellerId}:${getClientIp(request)}`, 10, 3600)
  if (!limit.allowed) {return NextResponse.json({ error: 'Too many subscription updates.' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } })}
  try {
    const { store_id: storeId, subscription } = await request.json()
    if (typeof storeId !== 'string' || !STORE_ID.test(storeId)
      || !subscription || typeof subscription !== 'object'
      || typeof subscription.endpoint !== 'string' || subscription.endpoint.length > 2048
      || !subscription.endpoint.startsWith('https://')
      || typeof subscription.keys?.p256dh !== 'string' || subscription.keys.p256dh.length > 256
      || typeof subscription.keys?.auth !== 'string' || subscription.keys.auth.length > 256) {
      return NextResponse.json({ error: 'Invalid subscription.' }, { status: 400 })
    }
    if (storeId !== session.sellerId) {return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })}
    const sb = createServiceSupabase()
    if (!await isActiveSeller(sb, session.sellerId, session.market)) {return NextResponse.json({ error: 'Seller account is not active.' }, { status: 403 })}
    const { data: existing } = await sb.from('push_subscriptions').select('store_id')
      .eq('endpoint', subscription.endpoint).maybeSingle()
    if (existing && existing.store_id !== storeId) {return NextResponse.json({ error: 'Subscription already belongs to another store.' }, { status: 409 })}
    const { error } = await sb.from('push_subscriptions').upsert({
      store_id: storeId, endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh, auth_key: subscription.keys.auth,
    }, { onConflict: 'endpoint' })
    if (error) {return NextResponse.json({ error: 'Unable to save notification settings.' }, { status: 503 })}
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }
}

export async function PUT(request: NextRequest) {
  if (!hasSameOrigin(request)) {return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })}
  const seller = readSellerSession(request)
  const admin = hasAdminSession(request)
  if (!admin && !seller) {return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })}
  const limit = rateLimit(`notify-send:${admin ? 'admin' : seller?.sellerId}:${getClientIp(request)}`, 20, 3600)
  if (!limit.allowed) {return NextResponse.json({ error: 'Too many notifications.' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } })}
  try {
    const { store_id: storeId, title, body, url } = await request.json()
    if (typeof storeId !== 'string' || !STORE_ID.test(storeId)
      || typeof title !== 'string' || !title.trim() || title.length > 120
      || typeof body !== 'string' || !body.trim() || body.length > 1000
      || (url !== undefined && (typeof url !== 'string' || url.length > 2048 || !(url.startsWith('/') && !url.startsWith('//') || (() => { try { return new URL(url).origin === new URL(request.url).origin } catch { return false } })())))) {
      return NextResponse.json({ error: 'Invalid notification.' }, { status: 400 })
    }
    if (!admin && seller?.sellerId !== storeId) {return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })}
    const sb = createServiceSupabase()
    if (seller && !admin && !await isActiveSeller(sb, seller.sellerId, seller.market)) {return NextResponse.json({ error: 'Seller account is not active.' }, { status: 403 })}
    // This repository currently has no Web Push delivery provider configured.
    // Do not write a "sent" audit event or report success when no push is sent.
    return NextResponse.json({ error: 'Push delivery is not configured.' }, { status: 503 })
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }
}
