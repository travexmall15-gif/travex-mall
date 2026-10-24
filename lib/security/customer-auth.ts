import 'server-only'
import type { NextRequest } from 'next/server'
import { createServiceSupabase } from '@/lib/security/server-supabase'

export async function getAuthenticatedCustomer(request: NextRequest) {
  const authorization = request.headers.get('authorization') || ''
  const match = /^Bearer\s+(.+)$/i.exec(authorization)
  if (!match) {return null}
  try {
    const sb = createServiceSupabase()
    const { data, error } = await sb.auth.getUser(match[1])
    if (error || !data.user) {return null}
    return { sb, user: data.user }
  } catch {
    return null
  }
}
