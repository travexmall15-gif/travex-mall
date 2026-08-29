import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Minimal, public-safe health check. Deliberately:
//  - never uses the service-role key (a health check does not need to
//    bypass RLS — it only needs to confirm the DB is reachable)
//  - never returns which key type is configured, raw Supabase error
//    messages/codes, or storage bucket names — all of that was an
//    unauthenticated information-disclosure risk (this route has no
//    auth check and is publicly reachable at /api/health-check)
export async function GET() {
  const SB_URL = 'https://bscecjbgnjitlfmgwcic.supabase.co'
  const SB_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_giz1AS9CcdTiksOrW5U0rQ_yY5kkzos'

  try {
    const sb = createClient(SB_URL, SB_ANON_KEY)
    const { error } = await sb
      .from('pending_payments')
      .select('id', { count: 'exact', head: true })

    return NextResponse.json({ status: error ? 'degraded' : 'ok' }, { status: error ? 503 : 200 })
  } catch {
    return NextResponse.json({ status: 'degraded' }, { status: 503 })
  }
}
