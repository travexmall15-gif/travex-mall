import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabase } from '@/lib/security/server-supabase'
import { hasAdminSession } from '@/lib/security/signed-session'
import { getClientIp, rateLimit } from '@/lib/security/rate-limit'
import { hasSameOrigin } from '@/lib/security/http'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const STATUSES = new Set(['approved', 'rejected', 'pending', 'suspended', 'deleted'])
const PLANS = new Set(['basic', 'premium'])

export async function GET(request: NextRequest) {
  if (!hasAdminSession(request)) {return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })}
  const limit = rateLimit(`admin-operations-read:${getClientIp(request)}`, 60, 300)
  if (!limit.allowed) {return NextResponse.json({ error: 'Too many requests.' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } })}
  try {
    const sb = createServiceSupabase()
    const [applications, posts] = await Promise.all([
      sb.from('pending_payments').select('id,owner_name,owner_email,owner_phone,shop_name,shop_category,shop_region,shop_whatsapp,shop_desc,plan,status,user_id,subscription_end,ai_score,ai_decision,delivery_id,delivery_status,tracking_code,created_at,shop_number,is_sponsored,shop_logo_url,shop_cover_url,shop_instagram,shop_facebook,shop_tiktok,shop_city,shop_address,selected_template,webstore_status,webstore_rejection_reason,webstore_submitted_at,webstore_reviewed_at,webstore_published_at').order('created_at', { ascending: false }).limit(1000),
      sb.from('feed_posts').select('*').order('created_at', { ascending: false }).limit(30),
    ])
    if (applications.error || posts.error) {return NextResponse.json({ error: 'Unable to load admin data.' }, { status: 503 })}
    return NextResponse.json({ applications: applications.data || [], posts: posts.data || [] })
  } catch {
    return NextResponse.json({ error: 'Unable to load admin data.' }, { status: 503 })
  }
}

export async function POST(request: NextRequest) {
  if (!hasSameOrigin(request)) {return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })}
  if (!hasAdminSession(request)) {return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })}
  const limit = rateLimit(`admin-operations-write:${getClientIp(request)}`, 40, 300)
  if (!limit.allowed) {return NextResponse.json({ error: 'Too many requests.' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } })}
  try {
    const body = await request.json()
    const action = typeof body.action === 'string' ? body.action : ''
    const id = typeof body.id === 'string' ? body.id : ''
    if (action.toLowerCase().includes('campus') || body.market === 'campus') {
      return NextResponse.json({ error: 'Campus is no longer an active ShopNekt feature.' }, { status: 410 })
    }
    if (!UUID.test(id)) {return NextResponse.json({ error: 'Invalid record.' }, { status: 400 })}

    const sb = createServiceSupabase()
    if (action === 'set-market-status' || action === 'set-seller-status') {
      if (action === 'set-seller-status' && body.market !== 'business') {return NextResponse.json({ error: 'Invalid seller.' }, { status: 400 })}
      if (!STATUSES.has(body.status)) {return NextResponse.json({ error: 'Invalid status.' }, { status: 400 })}
      const { data, error } = await sb.from('pending_payments').update({ status: body.status }).eq('id', id).select('id').maybeSingle()
      if (error) {return NextResponse.json({ error: 'Unable to update store status.' }, { status: 503 })}
      if (!data) {return NextResponse.json({ error: 'Store not found.' }, { status: 404 })}
      return NextResponse.json({ success: true })
    }

    if (action === 'set-market-plan' || action === 'set-seller-plan') {
      if (action === 'set-seller-plan' && body.market !== 'business') {return NextResponse.json({ error: 'Invalid seller.' }, { status: 400 })}
      if (!PLANS.has(body.plan)) {return NextResponse.json({ error: 'Invalid plan.' }, { status: 400 })}
      const { error } = await sb.from('pending_payments').update({ plan: body.plan }).eq('id', id)
      if (error) {return NextResponse.json({ error: 'Unable to update plan.' }, { status: 503 })}
      return NextResponse.json({ success: true })
    }

    if (action === 'set-market-subscription' || action === 'set-seller-subscription') {
      if (action === 'set-seller-subscription' && body.market !== 'business') {return NextResponse.json({ error: 'Invalid seller.' }, { status: 400 })}
      const end = typeof body.subscription_end === 'string' ? new Date(body.subscription_end) : null
      if (!end || Number.isNaN(end.getTime())) {return NextResponse.json({ error: 'Invalid subscription date.' }, { status: 400 })}
      const { error } = await sb.from('pending_payments').update({ subscription_end: end.toISOString() }).eq('id', id)
      if (error) {return NextResponse.json({ error: 'Unable to update subscription.' }, { status: 503 })}
      return NextResponse.json({ success: true, subscription_end: end.toISOString() })
    }

    if (action === 'delete-market' || action === 'delete-seller') {
      if (action === 'delete-seller' && body.market !== 'business') {return NextResponse.json({ error: 'Invalid seller.' }, { status: 400 })}
      // Keep the record for audit/history. Deleted sellers immediately stop
      // authenticating and disappear from every public approved-store query.
      const { error } = await sb.from('pending_payments').update({ status: 'deleted' }).eq('id', id)
      if (error) {return NextResponse.json({ error: 'Unable to remove seller.' }, { status: 503 })}
      return NextResponse.json({ success: true })
    }

    if (action === 'set-feed-read') {
      if (typeof body.is_read !== 'boolean') {return NextResponse.json({ error: 'Invalid notification status.' }, { status: 400 })}
      let query = sb.from('feed_posts').update({ is_read: body.is_read })
      if (id !== '00000000-0000-0000-0000-000000000000') {query = query.eq('id', id)}
      else {query = query.eq('is_read', false)}
      const { error } = await query
      if (error) {return NextResponse.json({ error: 'Unable to update notification.' }, { status: 503 })}
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Unsupported admin operation.' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Unable to complete admin operation.' }, { status: 400 })
  }
}
