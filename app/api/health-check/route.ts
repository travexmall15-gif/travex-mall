import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

export async function GET() {
  const SB_URL = 'https://bscecjbgnjitlfmgwcic.supabase.co'
  const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
    || process.env.SUPABASE_ANON_KEY
    || 'sb_publishable_giz1AS9CcdTiksOrW5U0rQ_yY5kkzos'

  const checks: Record<string, string> = {
    api: 'ok',
    key_type: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'service_role' : process.env.SUPABASE_ANON_KEY ? 'anon_env' : 'anon_hardcoded',
  }

  try {
    const sb = createClient(SB_URL, SB_KEY)
    const { count, error } = await sb
      .from('pending_payments')
      .select('*', { count: 'exact', head: true })

    if (error) {
      checks['db'] = `error: ${error.message} (code: ${error.code})`
      checks['rls_hint'] = 'If code is 42501, RLS is blocking the query. Add service role key.'
    } else {
      checks['db'] = 'ok'
      checks['total_applications'] = String(count ?? 0)
    }

    // Check storage
    const { data: buckets, error: bucketErr } = await sb.storage.listBuckets()
    if (bucketErr) {
      checks['storage'] = `error: ${bucketErr.message}`
    } else {
      checks['storage'] = 'ok'
      checks['buckets'] = (buckets || []).map(b => b.name).join(', ')
    }
  } catch (e: any) {
    checks['exception'] = e.message
  }

  return NextResponse.json(checks)
}
