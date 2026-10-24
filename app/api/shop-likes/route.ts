import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabase } from '@/lib/security/server-supabase'
import { hasSameOrigin } from '@/lib/security/http'
import { getClientIp, rateLimit } from '@/lib/security/rate-limit'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

async function authenticatedUser(request: NextRequest, sb: ReturnType<typeof createServiceSupabase>) {
  const authorization = request.headers.get('authorization') || ''
  const match = /^Bearer\s+(.+)$/i.exec(authorization)
  if (!match) {return null}
  const { data, error } = await sb.auth.getUser(match[1])
  return error ? null : data.user
}

export async function GET(request: NextRequest) {
  try {
    const sb = createServiceSupabase()
    const user = await authenticatedUser(request, sb)
    const url = new URL(request.url)

    if (url.searchParams.get('list') === '1') {
      if (!user) {return NextResponse.json({ error: 'Sign in to view preferred shops.' }, { status: 401 })}
      const { data: likes, error: likesError } = await sb.from('shop_likes')
        .select('store_id,created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(200)
      if (likesError) {return NextResponse.json({ error: 'Unable to load preferred shops.' }, { status: 503 })}
      const ids = (likes || []).map(like => like.store_id)
      if (!ids.length) {return NextResponse.json({ shops: [] }, { headers: { 'Cache-Control': 'no-store' } })}
      const { data: stores } = await sb.from('pending_payments')
        .select('id,shop_name,shop_category,shop_region,plan').in('id', ids).eq('status', 'approved')
      const storeMap = new Map((stores || []).map(store => [store.id, store]))
      const likedAt = new Map((likes || []).map(like => [like.store_id, like.created_at]))
      const shops = ids.flatMap(id => {
        const store = storeMap.get(id)
        return store ? [{
          store_id: id,
          shop_name: store.shop_name,
          shop_category: store.shop_category,
          shop_region: store.shop_region,
          plan: store.plan,
          liked_at: likedAt.get(id) || null,
        }] : []
      })
      return NextResponse.json({ shops }, { headers: { 'Cache-Control': 'no-store' } })
    }

    const rawIds = url.searchParams.get('store_ids')
    if (rawIds !== null) {
      if (!user) {return NextResponse.json({ error: 'Sign in to view preferred shops.' }, { status: 401 })}
      const ids = rawIds.split(',')
      if (ids.length > 100 || ids.some(id => !UUID.test(id))) {
        return NextResponse.json({ error: 'Invalid store list.' }, { status: 400 })
      }
      const { data, error } = await sb.from('shop_likes').select('store_id')
        .eq('user_id', user.id).in('store_id', ids)
      if (error) {return NextResponse.json({ error: 'Unable to load preferred shops.' }, { status: 503 })}
      return NextResponse.json({ liked_ids: (data || []).map(row => row.store_id) }, { headers: { 'Cache-Control': 'no-store' } })
    }

    const rawCountIds = url.searchParams.get('counts_for')
    if (rawCountIds !== null) {
      const ids = rawCountIds.split(',')
      if (ids.length > 100 || ids.some(id => !UUID.test(id))) {
        return NextResponse.json({ error: 'Invalid store list.' }, { status: 400 })
      }
      const { data, error } = await sb.from('shop_like_counts').select('store_id,like_count').in('store_id', ids)
      if (error) {return NextResponse.json({ error: 'Unable to load shop likes.' }, { status: 503 })}
      return NextResponse.json({ counts: data || [] }, { headers: { 'Cache-Control': 'no-store' } })
    }

    const storeId = url.searchParams.get('store_id') || ''
    if (!UUID.test(storeId)) {return NextResponse.json({ error: 'Invalid store.' }, { status: 400 })}
    const [{ data: countRow }, likedResult] = await Promise.all([
      sb.from('shop_like_counts').select('like_count').eq('store_id', storeId).maybeSingle(),
      user ? sb.from('shop_likes').select('id').eq('store_id', storeId).eq('user_id', user.id).maybeSingle() : Promise.resolve({ data: null }),
    ])
    return NextResponse.json({ count: countRow?.like_count || 0, liked: !!likedResult.data }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ error: 'Unable to load shop likes.' }, { status: 503 })
  }
}

export async function POST(request: NextRequest) {
  if (!hasSameOrigin(request)) {return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })}
  let body: unknown
  try { body = await request.json() } catch { body = null }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })}
  const input = body as Record<string, unknown>
  const storeId = typeof input.store_id === 'string' ? input.store_id : ''
  if (!UUID.test(storeId) || typeof input.liked !== 'boolean') {
    return NextResponse.json({ error: 'Invalid like request.' }, { status: 400 })
  }

  try {
    const sb = createServiceSupabase()
    const user = await authenticatedUser(request, sb)
    if (!user) {return NextResponse.json({ error: 'Sign in to save a shop.' }, { status: 401 })}
    const limit = rateLimit(`shop-like:${user.id}:${getClientIp(request)}`, 30, 60)
    if (!limit.allowed) {
      return NextResponse.json({ error: 'Too many like requests.' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } })
    }
    const { data: store } = await sb.from('pending_payments').select('id').eq('id', storeId).eq('status', 'approved').maybeSingle()
    if (!store) {return NextResponse.json({ error: 'Store not found.' }, { status: 404 })}

    if (input.liked) {
      const { error } = await sb.from('shop_likes').insert({ store_id: storeId, user_id: user.id })
      if (error && error.code !== '23505') {return NextResponse.json({ error: 'Unable to save this shop.' }, { status: 503 })}
    } else {
      const { error } = await sb.from('shop_likes').delete().eq('store_id', storeId).eq('user_id', user.id)
      if (error) {return NextResponse.json({ error: 'Unable to update this shop.' }, { status: 503 })}
    }
    return NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ error: 'Unable to update this shop.' }, { status: 503 })
  }
}
