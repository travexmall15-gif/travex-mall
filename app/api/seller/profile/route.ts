import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabase, isActiveSeller } from '@/lib/security/server-supabase'
import { getClientIp, rateLimit } from '@/lib/security/rate-limit'
import { readSellerSession } from '@/lib/security/signed-session'

export async function GET(request: NextRequest) {
  const session = readSellerSession(request)
  if (!session) {return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })}
  const limit = rateLimit(`seller-profile:${session.sellerId}:${getClientIp(request)}`, 60, 300)
  if (!limit.allowed) {return NextResponse.json({ error: 'Too many requests.' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } })}
  if (session.market !== 'business') {return NextResponse.json({ error: 'This profile is not available.' }, { status: 403 })}
  try {
    const sb = createServiceSupabase()
    if (!await isActiveSeller(sb, session.sellerId, session.market)) {
      return NextResponse.json({ error: 'Seller account is not active.' }, { status: 403 })
    }
    const { data, error } = await sb.from('pending_payments')
      .select('id,owner_name,owner_email,owner_phone,auth_email,shop_name,shop_category,shop_region,shop_whatsapp,shop_desc,shop_logo_url,plan,shop_number,subscription_end,shop_address,shop_instagram,shop_facebook,shop_tiktok,selected_template,webstore_status,status,created_at')
      .eq('id', session.sellerId).maybeSingle()
    if (error) {return NextResponse.json({ error: 'Unable to load seller profile.' }, { status: 503 })}
    if (!data) {return NextResponse.json({ error: 'Seller account not found.' }, { status: 404 })}
    return NextResponse.json({ seller: { ...data, shop_logo: data.shop_logo_url } }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ error: 'Unable to load seller profile.' }, { status: 503 })
  }
}
