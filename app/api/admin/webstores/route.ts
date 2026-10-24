import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabase } from '@/lib/security/server-supabase'
import { hasAdminSession } from '@/lib/security/signed-session'
import { getClientIp, rateLimit } from '@/lib/security/rate-limit'
import { hasSameOrigin } from '@/lib/security/http'

function authorized(request: NextRequest) {
  return hasAdminSession(request)
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) {return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })}
  const limit = rateLimit(`admin-webstores-read:${getClientIp(request)}`, 60, 300)
  if (!limit.allowed) {return NextResponse.json({ error: 'Too many requests.' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } })}
  try {
    const sb = createServiceSupabase()
    const { data, error } = await sb.from('pending_payments')
      .select('id,shop_name,owner_name,owner_phone,shop_whatsapp,shop_category,shop_region,shop_desc,shop_logo_url,shop_cover_url,selected_template,shop_instagram,shop_facebook,shop_tiktok,created_at,webstore_status,webstore_submitted_at,webstore_reviewed_at,webstore_rejection_reason')
      .in('webstore_status', ['submitted', 'under_review', 'approved', 'rejected', 'published'])
      .order('webstore_submitted_at', { ascending: false }).limit(500)
    if (error) {return NextResponse.json({ error: 'Unable to load applications.' }, { status: 503 })}
    return NextResponse.json({ applications: data || [] })
  } catch {
    return NextResponse.json({ error: 'Unable to load applications.' }, { status: 503 })
  }
}

export async function PATCH(request: NextRequest) {
  if (!hasSameOrigin(request)) {return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })}
  if (!authorized(request)) {return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })}
  const limit = rateLimit(`admin-webstores-write:${getClientIp(request)}`, 30, 300)
  if (!limit.allowed) {return NextResponse.json({ error: 'Too many requests.' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } })}
  try {
    const body = await request.json()
    const id = typeof body.id === 'string' ? body.id : ''
    const status = body.status
    const reason = typeof body.reason === 'string' ? body.reason.trim() : ''
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id) || !['approved', 'rejected'].includes(status)
      || (status === 'rejected' && (!reason || reason.length > 1000))) {
      return NextResponse.json({ error: 'Invalid review request.' }, { status: 400 })
    }
    const sb = createServiceSupabase()
    const { data: app, error: readError } = await sb.from('pending_payments')
      .select('id,webstore_status').eq('id', id).maybeSingle()
    if (readError) {return NextResponse.json({ error: 'Unable to review this application.' }, { status: 503 })}
    if (!app) {return NextResponse.json({ error: 'Application not found.' }, { status: 404 })}
    if (!['submitted', 'under_review'].includes(app.webstore_status)) {return NextResponse.json({ error: 'This application is no longer awaiting review.' }, { status: 409 })}
    const update: Record<string, string> = { webstore_status: status, webstore_reviewed_at: new Date().toISOString() }
    if (status === 'rejected') {update.webstore_rejection_reason = reason}
    const { data: changed, error } = await sb.from('pending_payments').update(update).eq('id', id)
      .in('webstore_status', ['submitted', 'under_review']).select('id').maybeSingle()
    if (error) {return NextResponse.json({ error: 'Unable to save review decision.' }, { status: 503 })}
    if (!changed) {return NextResponse.json({ error: 'This application is no longer awaiting review.' }, { status: 409 })}
    return NextResponse.json({ success: true, status, ...(status === 'rejected' ? { reason } : {}) })
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }
}
