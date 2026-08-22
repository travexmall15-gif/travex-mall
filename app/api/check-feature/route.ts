import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SB_URL = 'https://bscecjbgnjitlfmgwcic.supabase.co'
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
  || process.env.SUPABASE_ANON_KEY
  || 'sb_publishable_giz1AS9CcdTiksOrW5U0rQ_yY5kkzos'

// Feature → minimum plan required
const PLAN_GATES: Record<string, string[]> = {
  flashDeals: ['premium'],
  groupBuy:   ['premium'],
  ai:         ['premium'],
  reports:    ['premium'],
  accounting: ['premium'],
  vybe:       ['basic', 'premium'],   // all plans
  products:   ['basic', 'premium'],
  orders:     ['basic', 'premium'],
}

export async function POST(req: NextRequest) {
  try {
    const { shop_id, feature } = await req.json()
    if (!shop_id || !feature) {
      return NextResponse.json({ allowed: false, reason: 'Missing shop_id or feature' }, { status: 400 })
    }

    const sb = createClient(SB_URL, SB_KEY)

    // Verify shop exists + get real plan from DB
    const { data: shop, error } = await sb
      .from('pending_payments')
      .select('id, plan, status')
      .eq('id', shop_id)
      .eq('status', 'approved')
      .maybeSingle()

    if (error || !shop) {
      return NextResponse.json({ allowed: false, reason: 'Shop not found or not approved' }, { status: 403 })
    }

    const plan = shop.plan || 'basic'
    const required = PLAN_GATES[feature] || ['premium']
    const allowed = required.includes(plan)

    return NextResponse.json({ allowed, plan, feature })
  } catch (e: any) {
    return NextResponse.json({ allowed: false, reason: e.message }, { status: 500 })
  }
}
