import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabase, isActiveSeller } from '@/lib/security/server-supabase'
import { getClientIp, rateLimit } from '@/lib/security/rate-limit'
import { readSellerSession } from '@/lib/security/signed-session'
import { hasSameOrigin } from '@/lib/security/http'

function bounded(value: unknown, max: number) {
  if (typeof value !== 'string') {return null}
  const result = value.trim()
  return result.length <= max ? result : null
}

export async function PATCH(request: NextRequest) {
  if (!hasSameOrigin(request)) {return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })}
  const session = readSellerSession(request)
  if (!session) {return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })}
  const limit = rateLimit(`seller-settings:${session.sellerId}:${getClientIp(request)}`, 30, 300)
  if (!limit.allowed) {return NextResponse.json({ error: 'Too many updates.' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } })}
  try {
    const body = await request.json()
    const sb = createServiceSupabase()
    if (!await isActiveSeller(sb, session.sellerId, session.market)) {return NextResponse.json({ error: 'Seller account is not active.' }, { status: 403 })}
    if (session.market !== 'business') {return NextResponse.json({ error: 'This seller account is not available.' }, { status: 403 })}
    const table = 'pending_payments'
    let update: Record<string, string> = {}
    if (body.section === 'account') {
      const ownerName = bounded(body.owner_name, 100)
      if (!ownerName) {return NextResponse.json({ error: 'Invalid owner name.' }, { status: 400 })}
      update = { owner_name: ownerName }
    } else if (body.section === 'shop') {
      const shopName = bounded(body.shop_name, 100)
      const category = bounded(body.shop_category, 100)
      const region = bounded(body.shop_region, 100)
      const whatsapp = bounded(body.shop_whatsapp, 32)
      const description = bounded(body.shop_desc, 2000)
      if (!shopName || !category || !region || !whatsapp || !/^[0-9+()\s.-]{6,32}$/.test(whatsapp) || description === null) {
        return NextResponse.json({ error: 'Invalid shop details.' }, { status: 400 })
      }
      update = { shop_name: shopName, shop_category: category, shop_region: region, shop_whatsapp: whatsapp, shop_desc: description }
      if (body.shop_logo !== undefined) {
        const logo = bounded(body.shop_logo, 3_500_000)
        if (!logo || !(logo.startsWith('https://') || /^data:image\/(png|jpeg|webp);base64,/.test(logo))) {
          return NextResponse.json({ error: 'Invalid logo.' }, { status: 400 })
        }
        update.shop_logo_url = logo
      }
    } else {
      return NextResponse.json({ error: 'Invalid settings request.' }, { status: 400 })
    }

    const { error } = await sb.from(table).update(update).eq('id', session.sellerId)
    if (error) {return NextResponse.json({ error: 'Unable to save shop settings.' }, { status: 503 })}
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Unable to save settings.' }, { status: 400 })
  }
}
