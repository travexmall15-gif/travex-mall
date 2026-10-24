import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabase } from '@/lib/security/server-supabase'
import { hasSameOrigin } from '@/lib/security/http'
import { getClientIp, rateLimit } from '@/lib/security/rate-limit'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function POST(request: NextRequest) {
  if (!hasSameOrigin(request)) {return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })}
  const limit = rateLimit(`store-message:${getClientIp(request)}`, 5, 600)
  if (!limit.allowed) {return NextResponse.json({ error: 'Too many messages. Try again later.' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } })}
  let body: unknown
  try { body = await request.json() } catch { body = null }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {return NextResponse.json({ error: 'Invalid message.' }, { status: 400 })}
  const input = body as Record<string, unknown>
  const storeId = typeof input.store_id === 'string' ? input.store_id : ''
  const senderName = typeof input.sender_name === 'string' ? input.sender_name.trim() : ''
  const message = typeof input.message === 'string' ? input.message.trim() : ''
  if (!UUID.test(storeId)) {return NextResponse.json({ error: 'Store not found.' }, { status: 404 })}
  if (senderName.length < 2 || senderName.length > 120 || message.length < 1 || message.length > 2000) {
    return NextResponse.json({ error: 'Enter a name and a message under 2,000 characters.' }, { status: 400 })
  }
  try {
    const sb = createServiceSupabase()
    const { data: store } = await sb.from('pending_payments').select('id,selected_template,webstore_status')
      .eq('id', storeId).eq('status', 'approved').maybeSingle()
    if (!store || (store.selected_template && store.webstore_status !== 'published')) {
      return NextResponse.json({ error: 'Store not found.' }, { status: 404 })
    }
    const { error } = await sb.from('store_messages').insert({ store_id: storeId, sender_name: senderName, message })
    if (error) {return NextResponse.json({ error: 'Unable to send this message.' }, { status: 503 })}
    return NextResponse.json({ success: true }, { status: 201, headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ error: 'Unable to send this message.' }, { status: 503 })
  }
}
