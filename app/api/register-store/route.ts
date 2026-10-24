import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, getClientIp } from '@/lib/security/rate-limit'
import { createServiceSupabase } from '@/lib/security/server-supabase'

export async function POST(req: NextRequest) {
  // 5 applications / 10 min per IP — generous for a genuine applicant
  // (who might retry after fixing a validation error), tight enough to
  // stop scripted bulk-signup abuse (Part 37).
  const { allowed, retryAfterSeconds } = rateLimit(`register-store:${getClientIp(req)}`, 5, 600)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many applications submitted. Please try again later.' }, { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } })
  }
  try {
    const body = await req.json()

    // Server-side validation
    const required = ['owner_name','owner_phone','owner_email','shop_name','shop_category','shop_region','login_password']
    for (const f of required) {
      if (!body[f] || !String(body[f]).trim()) {
        return NextResponse.json({ error: `Missing: ${f}` }, { status: 400 })
      }
    }
    const email = String(body.owner_email).trim().toLowerCase()
    if (email.length > 254 || !/^[^\s@,()]+@[^\s@,()]+\.[^\s@,()]+$/.test(email))
      {return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })}
    if (typeof body.login_password !== 'string' || !/^\d{4}$/.test(body.login_password))
      {return NextResponse.json({ error: 'PIN must be exactly 4 digits' }, { status: 400 })}
    const sb = createServiceSupabase()

    // Duplicate check
    let { data: existing } = await sb.from('pending_payments').select('id,status')
      .eq('auth_email', email).limit(1)
    if (!existing?.length) {
      const fallback = await sb.from('pending_payments').select('id,status').eq('owner_email', email).limit(1)
      existing = fallback.data
    }

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: `Application already exists for this email (status: ${existing[0].status}). Log in or use a different email.` },
        { status: 409 }
      )
    }

    // Never persist the submitted PIN in pending_payments. It is sent only
    // to the private server-side hashing RPC after the seller row is created.
    const basePayload: Record<string, any> = {
      owner_name:    String(body.owner_name).trim(),
      owner_phone:   String(body.owner_phone).trim(),
      owner_email:   email,
      auth_email:    email,
      shop_name:     String(body.shop_name).trim(),
      shop_category: body.shop_category,
      shop_region:   body.shop_region,
      plan:          body.plan || 'basic',
      status:        'pending',
      created_at:    new Date().toISOString(),
    }
    if (body.shop_logo && String(body.shop_logo).startsWith('https://')) {basePayload.shop_logo_url = body.shop_logo}
    if (body.shop_whatsapp) {basePayload.shop_whatsapp = String(body.shop_whatsapp).trim()}
    if (body.shop_desc)     {basePayload.shop_desc = String(body.shop_desc).trim()}

    let insertPayload = { ...basePayload }
    let data: any = null
    let error: any = null
    for (let attempt = 0; attempt < 6; attempt++) {
      const res = await sb.from('pending_payments').insert(insertPayload).select('id').single()
      data = res.data; error = res.error
      if (!error || error.code !== '42703') {break}
      // Column doesn't exist — parse its name out of the error and drop it, then retry.
      const m = /column "?([a-zA-Z0-9_]+)"?/.exec(error.message || '')
      const badCol = m?.[1]
      if (!badCol || !(badCol in insertPayload)) {break}
      const { [badCol]: _drop, ...rest } = insertPayload
      insertPayload = rest
    }

    if (error) {
      let msg = error.message
      if (error.code === '23505') {msg = 'An application with this email already exists.'}
      if (error.code === '42703') {msg = 'A required field is not configured. Please contact support.'}
      if (error.code === '42501') {msg = 'Unable to submit application. Please contact support.'}
      if (error.code === 'PGRST301') {msg = 'Database unreachable. Try again.'}
      // Only ever surface a curated, safe message — never raw DB error
      // text/details to the client (Part 44: no SQL errors/internal
      // details in production responses).
      const safe = ['23505', '42703', '42501', 'PGRST301'].includes(error.code)
        ? msg
        : 'Could not submit application. Please try again.'
      return NextResponse.json({ error: safe }, { status: 500 })
    }

    const { error: pinError } = await sb.rpc('set_seller_pin', {
      p_store_id: String(data.id),
      p_market: 'business',
      p_pin: body.login_password,
    })
    if (pinError) {
      // Avoid leaving a registration in a state where the seller selected
      // a PIN but cannot authenticate with it.
      await sb.from('pending_payments').delete().eq('id', data.id)
      return NextResponse.json({ error: 'Could not securely save the seller PIN. Please try again later.' }, { status: 503 })
    }

    return NextResponse.json({ success: true, id: data?.id })
  } catch (err: any) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
