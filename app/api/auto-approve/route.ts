import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bscecjbgnjitlfmgwcic.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_giz1AS9CcdTiksOrW5U0rQ_yY5kkzos'
)

const GEMINI_KEY = process.env.GEMINI_API_KEY || ''

async function scoreApplication(app: any) {
  if (!GEMINI_KEY) return { score: 50, decision: 'flagged', reasons: ['No AI key'] }

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

export async function POST(req: Request) {
  const { app_id, app_type } = await req.json()

  const table = app_type === 'campus' ? 'campus_applications' : 'pending_payments'
  const { data: app } = await sb.from(table).select('*').eq('id', app_id).single()
  if (!app) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { score, decision, reasons } = await scoreApplication(app)

  await sb.from('auto_approvals').insert({ app_id, app_type, score, decision, reasons })

  if (decision === 'approved') {
    await sb.from(table).update({ ai_score: score, ai_decision: 'approved' }).eq('id', app_id)
  } else {
    await sb.from(table).update({ ai_score: score, ai_decision: decision }).eq('id', app_id)
  }

  return NextResponse.json({ success: true, score, decision, reasons })
}
