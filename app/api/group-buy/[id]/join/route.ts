import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabase } from '@/lib/security/server-supabase'
import { getClientIp, rateLimit } from '@/lib/security/rate-limit'
import { hasSameOrigin } from '@/lib/security/http'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const PHONE = /^[0-9+()\s.-]{6,32}$/

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!hasSameOrigin(request)) {return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })}
  const { id } = await params
  if (!UUID.test(id)) {return NextResponse.json({ error: 'Group deal not found.' }, { status: 404 })}
  const limit = rateLimit(`group-join:${id}:${getClientIp(request)}`, 8, 3600)
  if (!limit.allowed) {return NextResponse.json({ error: 'Too many join attempts.' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } })}
  let body: unknown
  try { body = await request.json() } catch { body = null }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })}
  const input = body as Record<string, unknown>
  const name = typeof input.name === 'string' ? input.name.trim() : ''
  const phone = typeof input.phone === 'string' ? input.phone.trim() : ''
  if (name.length < 2 || name.length > 120 || !PHONE.test(phone)) {
    return NextResponse.json({ error: 'Enter a valid name and phone number.' }, { status: 400 })
  }
  try {
    const sb = createServiceSupabase()
    const { data, error } = await sb.rpc('join_group_order', { p_group_id: id, p_name: name, p_phone: phone })
    if (error) {
      if (error.code === '23505') {return NextResponse.json({ error: 'This phone number has already joined.' }, { status: 409 })}
      if (error.code === 'P0002') {return NextResponse.json({ error: 'Group deal not found.' }, { status: 404 })}
      if (error.code === '55000') {return NextResponse.json({ error: 'This group deal is closed.' }, { status: 409 })}
      return NextResponse.json({ error: 'Unable to join this group deal.' }, { status: 503 })
    }
    return NextResponse.json({ success: true, data }, { status: 201, headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ error: 'Unable to join this group deal.' }, { status: 503 })
  }
}
