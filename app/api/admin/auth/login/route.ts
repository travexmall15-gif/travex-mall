import { NextRequest, NextResponse } from 'next/server'
import { getClientIp, rateLimit } from '@/lib/security/rate-limit'
import { adminPasscodeMatches, setAdminSession } from '@/lib/security/signed-session'
import { hasSameOrigin } from '@/lib/security/http'

export async function POST(request: NextRequest) {
  if (!hasSameOrigin(request)) {return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })}
  const limit = rateLimit(`admin-login:${getClientIp(request)}`, 5, 900)
  if (!limit.allowed) {return NextResponse.json({ error: 'Too many login attempts. Try again later.' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } })}
  try {
    const body = await request.json()
    if (!adminPasscodeMatches(body.passcode)) {return NextResponse.json({ error: 'Incorrect admin passcode.' }, { status: 401 })}
    const response = NextResponse.json({ success: true })
    setAdminSession(response)
    return response
  } catch {
    return NextResponse.json({ error: 'Admin sign-in is not configured.' }, { status: 503 })
  }
}
