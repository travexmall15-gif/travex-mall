import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabase } from '@/lib/security/server-supabase'
import { clearSession, readSellerSession } from '@/lib/security/signed-session'

export async function GET(request: NextRequest) {
  const session = readSellerSession(request)
  if (!session) {return NextResponse.json({ authenticated: false }, { status: 401 })}
  try {
    const sb = createServiceSupabase()
    if (session.market !== 'business') return NextResponse.json({ authenticated: false }, { status: 401 })
    const { data } = await sb.from('pending_payments').select('id,status').eq('id', session.sellerId).maybeSingle()
    const active = data?.status === 'approved'
    if (!data || !active) {
      const response = NextResponse.json({ authenticated: false }, { status: 401 })
      clearSession(response, 'seller')
      return response
    }
    return NextResponse.json({ authenticated: true, seller: { id: session.sellerId, market: session.market } })
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 503 })
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  clearSession(response, 'seller')
  return response
}
