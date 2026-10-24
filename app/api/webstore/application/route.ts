import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabase, isActiveSeller } from '@/lib/security/server-supabase'
import { getClientIp, rateLimit } from '@/lib/security/rate-limit'
import { readSellerSession, readWebstoreOwnerSession, setWebstoreOwnerSession } from '@/lib/security/signed-session'
import { hasSameOrigin } from '@/lib/security/http'

const EMAIL = /^[^\s@,()]+@[^\s@,()]+\.[^\s@,()]+$/
const PHONE = /^[0-9+()\s.-]{6,32}$/
const MARKETS = new Set(['fashion', 'vehicle', 'electronics'])
const MAX_TEXT: Record<string, number> = {
  shop_name: 100, shop_desc: 2000, owner_name: 100, owner_phone: 32,
  owner_email: 254, shop_whatsapp: 32, shop_region: 100, shop_city: 100,
  shop_address: 250, shop_instagram: 120, shop_facebook: 250,
  shop_tiktok: 120, selected_template: 80, shop_category: 100,
}

function textField(body: Record<string, unknown>, key: string, required = false): string | null | undefined {
  const value = body[key]
  if (value === undefined || value === null || value === '') {return required ? undefined : null}
  if (typeof value !== 'string' || value.trim().length > MAX_TEXT[key]) {return undefined}
  const trimmed = value.trim()
  if (required && !trimmed) {return undefined}
  return trimmed
}

function safeAsset(value: unknown): string | null | undefined {
  if (value === undefined || value === null || value === '') {return null}
  if (typeof value !== 'string' || value.length > 2048) {return undefined}
  try {
    const url = new URL(value)
    const supabaseUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bscecjbgnjitlfmgwcic.supabase.co')
    if (url.protocol !== 'https:' || url.origin !== supabaseUrl.origin
      || !url.pathname.startsWith('/storage/v1/object/public/shop-assets/')) {return undefined}
    return url.toString()
  } catch { return undefined }
}

export async function POST(request: NextRequest) {
  if (!hasSameOrigin(request)) {return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })}
  const limit = rateLimit(`webstore-submit:${getClientIp(request)}`, 5, 600)
  if (!limit.allowed) {return NextResponse.json({ error: 'Too many applications. Please try again later.' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } })}
  try {
    const body = await request.json()
    if (!body || typeof body !== 'object' || Array.isArray(body)) {return NextResponse.json({ error: 'Invalid application.' }, { status: 400 })}
    const input = body as Record<string, unknown>
    const shopName = textField(input, 'shop_name', true)
    const description = textField(input, 'shop_desc', true)
    const ownerName = textField(input, 'owner_name')
    const ownerPhone = textField(input, 'owner_phone', true)
    const ownerEmail = textField(input, 'owner_email')
    const whatsapp = textField(input, 'shop_whatsapp', true)
    const region = textField(input, 'shop_region', true)
    const city = textField(input, 'shop_city')
    const address = textField(input, 'shop_address')
    const instagram = textField(input, 'shop_instagram')
    const facebook = textField(input, 'shop_facebook')
    const tiktok = textField(input, 'shop_tiktok')
    const template = textField(input, 'selected_template', true)
    const category = textField(input, 'shop_category', true)
    const logo = safeAsset(input.shop_logo_url)
    const cover = safeAsset(input.shop_cover_url)
    if (!shopName || shopName.length < 2 || !description || description.length < 6
      || !ownerPhone || !PHONE.test(ownerPhone) || !whatsapp || !PHONE.test(whatsapp)
      || (ownerEmail !== null && (!ownerEmail || !EMAIL.test(ownerEmail)))
      || !region || !template || !category || category.length > 100
      || [ownerName, city, address, instagram, facebook, tiktok].some(value => value === undefined)
      || logo === undefined || cover === undefined) {
      return NextResponse.json({ error: 'Please check the application details and try again.' }, { status: 400 })
    }

    const sb = createServiceSupabase()
    const { data: validTemplate, error: templateError } = await sb.from('webstore_templates')
      .select('id').eq('id', template).eq('market', String(input.market || '')).eq('is_active', true).maybeSingle()
    if (templateError || !validTemplate || !MARKETS.has(String(input.market))) {
      return NextResponse.json({ error: 'Please choose an available WebStore template.' }, { status: 400 })
    }

    const submission = {
      owner_name: ownerName || shopName,
      owner_phone: ownerPhone,
      owner_email: ownerEmail,
      shop_name: shopName,
      shop_desc: description,
      shop_category: category,
      shop_region: region,
      shop_city: city,
      shop_address: address,
      shop_whatsapp: whatsapp,
      shop_instagram: instagram,
      shop_facebook: facebook,
      shop_tiktok: tiktok,
      shop_logo_url: logo,
      shop_cover_url: cover,
      selected_template: template,
      webstore_status: 'submitted',
      webstore_submitted_at: new Date().toISOString(),
    }

    const seller = readSellerSession(request)
    if (seller) {
      if (seller.market !== 'business' || !await isActiveSeller(sb, seller.sellerId, seller.market)) {
        return NextResponse.json({ error: 'This seller account cannot submit a WebStore.' }, { status: 403 })
      }
      const { data: existing, error: existingError } = await sb.from('pending_payments')
        .select('id,status,webstore_status').eq('id', seller.sellerId).maybeSingle()
      if (existingError) {return NextResponse.json({ error: 'Unable to submit the WebStore.' }, { status: 503 })}
      if (!existing || existing.status !== 'approved') {return NextResponse.json({ error: 'Seller account is not active.' }, { status: 403 })}
      if (![null, 'draft', 'rejected'].includes(existing.webstore_status)) {
        return NextResponse.json({ error: 'This WebStore already has an active review or approval.' }, { status: 409 })
      }
      let updateQuery = sb.from('pending_payments').update(submission).eq('id', seller.sellerId).eq('status', 'approved')
      updateQuery = existing.webstore_status === null
        ? updateQuery.is('webstore_status', null)
        : updateQuery.eq('webstore_status', existing.webstore_status)
      const { data, error } = await updateQuery.select('id').maybeSingle()
      if (error) {return NextResponse.json({ error: 'Could not submit the WebStore. Please try again.' }, { status: 503 })}
      if (!data) {return NextResponse.json({ error: 'This WebStore changed while the application was being submitted. Reload and try again.' }, { status: 409 })}
      return NextResponse.json({ success: true, application_id: seller.sellerId, reused_store: true })
    }

    const { data, error } = await sb.from('pending_payments').insert({
      ...submission,
      status: 'pending',
      plan: 'basic',
    }).select('id').single()
    if (error || !data) {return NextResponse.json({ error: 'Could not submit the application. Please try again.' }, { status: 503 })}

    const response = NextResponse.json({ success: true })
    setWebstoreOwnerSession(response, String(data.id))
    return response
  } catch {
    return NextResponse.json({ error: 'Invalid application.' }, { status: 400 })
  }
}

export async function GET(request: NextRequest) {
  const owner = readWebstoreOwnerSession(request)
  const seller = readSellerSession(request)
  const applicationId = owner?.applicationId || (seller?.market === 'business' ? seller.sellerId : null)
  if (!applicationId) {return NextResponse.json({ error: 'Sign in to check this WebStore application.' }, { status: 401 })}
  const email = (new URL(request.url).searchParams.get('email') || '').trim().toLowerCase()
  if (!email || email.length > 254 || !EMAIL.test(email)) {return NextResponse.json({ error: 'No application found for that email.' }, { status: 404 })}
  const limit = rateLimit(`webstore-status:${applicationId}:${getClientIp(request)}`, 60, 300)
  if (!limit.allowed) {return NextResponse.json({ error: 'Too many requests.' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } })}
  try {
    const sb = createServiceSupabase()
    if (seller && !owner && !await isActiveSeller(sb, seller.sellerId, seller.market)) {
      return NextResponse.json({ error: 'Seller account is not active.' }, { status: 403 })
    }
    const { data, error } = await sb.from('pending_payments')
      .select('id,shop_name,shop_category,webstore_status,webstore_rejection_reason,owner_email')
      .eq('id', applicationId).maybeSingle()
    if (error) {return NextResponse.json({ error: 'Unable to load application status.' }, { status: 503 })}
    if (!data || String(data.owner_email || '').trim().toLowerCase() !== email) {
      return NextResponse.json({ error: 'No application found for that email.' }, { status: 404 })
    }
    return NextResponse.json({ application: {
      id: data.id,
      shop_name: data.shop_name,
      shop_category: data.shop_category,
      webstore_status: data.webstore_status,
      webstore_rejection_reason: data.webstore_rejection_reason,
    } })
  } catch {
    return NextResponse.json({ error: 'Unable to load application status.' }, { status: 503 })
  }
}

export async function PATCH(request: NextRequest) {
  if (!hasSameOrigin(request)) {return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })}
  const owner = readWebstoreOwnerSession(request)
  const seller = readSellerSession(request)
  const applicationId = owner?.applicationId || (seller?.market === 'business' ? seller.sellerId : null)
  if (!applicationId) {return NextResponse.json({ error: 'Sign in to publish this WebStore.' }, { status: 401 })}
  const limit = rateLimit(`webstore-publish:${applicationId}:${getClientIp(request)}`, 10, 300)
  if (!limit.allowed) {return NextResponse.json({ error: 'Too many publish attempts.' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } })}
  try {
    const sb = createServiceSupabase()
    if (seller && !owner && !await isActiveSeller(sb, seller.sellerId, seller.market)) {
      return NextResponse.json({ error: 'Seller account is not active.' }, { status: 403 })
    }
    const { data: application, error: readError } = await sb.from('pending_payments')
      .select('id,webstore_status').eq('id', applicationId).maybeSingle()
    if (readError) {return NextResponse.json({ error: 'Unable to publish this WebStore.' }, { status: 503 })}
    if (!application) {return NextResponse.json({ error: 'Application not found.' }, { status: 404 })}
    if (application.webstore_status !== 'approved') {return NextResponse.json({ error: 'This WebStore must be approved before publishing.' }, { status: 403 })}
    const { data: published, error } = await sb.from('pending_payments').update({
      webstore_status: 'published', webstore_published_at: new Date().toISOString(),
    }).eq('id', applicationId).eq('webstore_status', 'approved').select('id').maybeSingle()
    if (error) {return NextResponse.json({ error: 'Unable to publish this WebStore.' }, { status: 503 })}
    if (!published) {return NextResponse.json({ error: 'This WebStore is no longer approved for publishing.' }, { status: 409 })}
    return NextResponse.json({ success: true, status: 'published' })
  } catch {
    return NextResponse.json({ error: 'Unable to publish this WebStore.' }, { status: 503 })
  }
}
