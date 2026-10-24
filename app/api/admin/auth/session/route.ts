import { NextRequest, NextResponse } from 'next/server'
import { clearSession, hasAdminSession } from '@/lib/security/signed-session'
import { hasSameOrigin } from '@/lib/security/http'

export async function GET(request: NextRequest) {
  return NextResponse.json({ authenticated: hasAdminSession(request) }, { status: hasAdminSession(request) ? 200 : 401 })
}

export async function DELETE(request: NextRequest) {
  if (!hasSameOrigin(request)) {return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })}
  const response = NextResponse.json({ success: true })
  clearSession(response, 'admin')
  return response
}
