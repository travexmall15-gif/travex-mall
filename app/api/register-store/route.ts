import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SB_URL = 'https://bscecjbgnjitlfmgwcic.supabase.co'
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
  || process.env.SUPABASE_ANON_KEY
  || 'sb_publishable_giz1AS9CcdTiksOrW5U0rQ_yY5kkzos'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Server-side validation
    const required = ['owner_name','owner_phone','owner_email','shop_name','shop_category','shop_region','login_password']
    for (const f of required) {
      if (!body[f] || !String(body[f]).trim()) {
        return NextResponse.json({ error: `Missing: ${f}` }, { status: 400 })
      }
    }
    if (!body.owner_email.includes('@'))
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    if (!/^\d{4}$/.test(String(body.login_password)))
      return NextResponse.json({ error: 'PIN must be exactly 4 digits' }, { status: 400 })
        const sb = createClient(SB_URL, SB_KEY)

    // Duplicate check
    const email = String(body.owner_email).trim().toLowerCase()
    const { data: existing } = await sb.from('pending_payments')
      .select('id,status')
      .or(`auth_email.eq.${email},owner_email.eq.${email}`)
      .limit(1)

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: `Application already exists for this email (status: ${existing[0].status}). Log in or use a different email.` },
        { status: 409 }
      )
    }

    // Insert
    const { data, error } = await sb.from('pending_payments').insert({
      owner_name:    String(body.owner_name).trim(),
      owner_phone:   String(body.owner_phone).trim(),
      owner_email:   email,
      auth_email:    email,
      shop_market:   body.shop_market || null,
      shop_name:     String(body.shop_name).trim(),
      shop_category: body.shop_category,
      shop_region:   body.shop_region,
      whatsapp_number: String(body.shop_whatsapp || body.whatsapp_number || '').trim(),
      plan:          body.plan || 'basic',
      login_password:String(body.login_password).trim(),
      shop_logo:     body.shop_logo || null,
      status:        'pending',
      created_at:    new Date().toISOString(),
    }).select('id').single()

    if (error) {
      let msg = error.message
      if (error.code === '23505') msg = 'An application with this email already exists.'
      if (error.code === '42703') msg = `Column error: ${error.message}`
      if (error.code === '42501') msg = 'Permission denied. Check RLS policies.'
      if (error.code === 'PGRST301') msg = 'Database unreachable. Try again.'
      return NextResponse.json({ error: msg, code: error.code, details: error.details }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data?.id })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
