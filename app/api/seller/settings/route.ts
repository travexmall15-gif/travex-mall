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

function safeSocial(value: unknown, max: number, hosts: string[]): string | null | undefined {
  const text = bounded(value, max)
  if (text === null) {return undefined}
  if (!text) {return ''}
  if (/^@?[A-Za-z0-9._-]{1,100}$/.test(text)) {return text.replace(/^@/, '')}
  try {
    const url = new URL(text.startsWith('https://') ? text : `https://${text}`)
    const host = url.hostname.toLowerCase()
    if (url.protocol !== 'https:' || url.username || url.password
      || !hosts.some(allowed => host === allowed || host.endsWith(`.${allowed}`))) {return undefined}
    return url.toString()
  } catch { return undefined }
}

function safeAsset(value: unknown): string | null | undefined {
  if (value === null || value === '') {return null}
  if (typeof value !== 'string' || value.length > 3_500_000) {return undefined}
  if (/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(value)) {return value}
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !url.username && !url.password ? url.toString() : undefined
  } catch { return undefined }
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
    let update: Record<string, string | null> = {}
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
      const optionalTextFields = [
        ['shop_city', 100], ['shop_address', 200],
      ] as const
      for (const [field, max] of optionalTextFields) {
        if (body[field] !== undefined) {
          const value = bounded(body[field], max)
          if (value === null) {return NextResponse.json({ error: 'Invalid shop details.' }, { status: 400 })}
          update[field] = value
        }
      }
      const socialFields = [
        ['shop_instagram', 100, ['instagram.com']],
        ['shop_facebook', 300, ['facebook.com', 'fb.com']],
        ['shop_tiktok', 100, ['tiktok.com']],
      ] as const
      for (const [field, max, hosts] of socialFields) {
        if (body[field] !== undefined) {
          const value = safeSocial(body[field], max, [...hosts])
          if (value === undefined) {return NextResponse.json({ error: 'Invalid social link.' }, { status: 400 })}
          update[field] = value
        }
      }
      for (const [bodyField, column] of [['shop_logo', 'shop_logo_url'], ['shop_cover', 'shop_cover_url']] as const) {
        if (body[bodyField] !== undefined) {
          const value = safeAsset(body[bodyField])
          if (value === undefined) {return NextResponse.json({ error: 'Invalid image.' }, { status: 400 })}
          update[column] = value
        }
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
