import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabase } from '@/lib/security/server-supabase'
import { hasSameOrigin } from '@/lib/security/http'
import { getClientIp, rateLimit } from '@/lib/security/rate-limit'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function POST(request: NextRequest) {
  if (!hasSameOrigin(request)) {return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })}
  const limit = rateLimit(`vybe-like:${getClientIp(request)}`, 30, 60)
  if (!limit.allowed) {
    return NextResponse.json({ error: 'Too many like requests.' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } })
  }
  let body: unknown
  try { body = await request.json() } catch { body = null }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })}
  const input = body as Record<string, unknown>
  if (typeof input.post_id !== 'string' || !UUID.test(input.post_id) || typeof input.liked !== 'boolean') {
    return NextResponse.json({ error: 'Invalid like request.' }, { status: 400 })
  }

  try {
    const sb = createServiceSupabase()
    const { data, error } = await sb.rpc('adjust_feed_post_likes', {
      p_post_id: input.post_id,
      p_delta: input.liked ? 1 : -1,
    })
    if (error) {return NextResponse.json({ error: 'Unable to update this like.' }, { status: 503 })}
    if (typeof data !== 'number') {return NextResponse.json({ error: 'Post not found.' }, { status: 404 })}
    return NextResponse.json({ likes: data }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ error: 'Unable to update this like.' }, { status: 503 })
  }
}
