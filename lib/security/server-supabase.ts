import 'server-only'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bscecjbgnjitlfmgwcic.supabase.co'

export function createServiceSupabase() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured')}
  return createClient(SUPABASE_URL, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function isActiveSeller(supabase: ReturnType<typeof createServiceSupabase>, sellerId: string, market: string) {
  if (market !== 'business') return false
  const { data, error } = await supabase.from('pending_payments').select('id,status').eq('id', sellerId).maybeSingle()
  return !error && data?.status === 'approved'
}
