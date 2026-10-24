import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabase } from '@/lib/security/server-supabase'
import { hasAdminSession } from '@/lib/security/signed-session'
import { rateLimit, getClientIp } from '@/lib/security/rate-limit'
import { hasSameOrigin } from '@/lib/security/http'

const appIdPattern = /^[a-zA-Z0-9_-]{1,100}$/

const GEMINI_KEY = process.env.GEMINI_API_KEY || ''

async function scoreApplication(app: any) {
  if (!GEMINI_KEY) {return { score: 50, decision: 'flagged', reasons: ['No AI key'] }}

  const prompt = `You are reviewing a ShopNekt marketplace application.
Evaluate this seller application and give a score 0-100.

Shop: ${app.shop_name || app.store_name || app.business_description}
Owner: ${app.owner_name || app.full_name}
Phone: ${app.owner_phone || app.phone || app.whatsapp_number}
Category: ${app.shop_category || app.business_category}
Description: ${app.shop_desc || app.business_description}

Score criteria:
- Phone is valid (10-12 digits): +30
- Has description (>20 chars): +20
- Has category: +15
- Name looks real (not test/demo): +20
- Description is not spam: +15

Reply ONLY with JSON: {"score": NUMBER, "reasons": ["reason1","reason2"]}`

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    }
  )
  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
  try {
    const clean = text.replace(/```json|```/g, '').trim()
    const result = JSON.parse(clean)
    const score = result.score || 0
    return {
      score,
      decision: score >= 75 ? 'approved' : score >= 40 ? 'flagged' : 'rejected',
      reasons: result.reasons || []
    }
  } catch {
    return { score: 50, decision: 'flagged', reasons: ['Parse error'] }
  }
}

export async function POST(req: NextRequest) {
  if (!hasSameOrigin(req)) {return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })}
  if (!hasAdminSession(req)) {return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })}
  const { allowed, retryAfterSeconds } = rateLimit(`auto-approve:${getClientIp(req)}`, 10, 60)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } })
  }
  let body: any
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }) }
  const app_id = typeof body.app_id === 'string' ? body.app_id : ''
  if (!appIdPattern.test(app_id)) {return NextResponse.json({ error: 'Invalid application.' }, { status: 400 })}
  if (body.app_type === 'campus') {return NextResponse.json({ error: 'Campus is no longer an active ShopNekt feature.' }, { status: 410 })}
  if (body.app_type !== 'business') {return NextResponse.json({ error: 'Invalid application.' }, { status: 400 })}
  const sb = createServiceSupabase()

  const { data: app } = await sb.from('pending_payments').select('id,shop_name,owner_name,owner_phone,shop_category,shop_desc,status').eq('id', app_id).maybeSingle()
  if (!app) {return NextResponse.json({ error: 'Not found' }, { status: 404 })}
  if (app.status !== 'pending') {return NextResponse.json({ error: 'Application is no longer pending.' }, { status: 409 })}

  const { score, decision, reasons } = await scoreApplication(app)

  const { error: logError } = await sb.from('auto_approvals').insert({ app_id, app_type: 'business', score, decision, reasons })
  if (logError) {return NextResponse.json({ error: 'Unable to save review result.' }, { status: 503 })}

  const { error: updateError } = await sb.from('pending_payments').update({ ai_score: score, ai_decision: decision }).eq('id', app_id).eq('status', 'pending')
  if (updateError) {return NextResponse.json({ error: 'Unable to save review result.' }, { status: 503 })}

  return NextResponse.json({ success: true, score, decision, reasons })
}
