import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { rateLimit, getClientIp } from '@/lib/security/rate-limit'

const SB_URL = 'https://bscecjbgnjitlfmgwcic.supabase.co'
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
  || process.env.SUPABASE_ANON_KEY
  || 'sb_publishable_giz1AS9CcdTiksOrW5U0rQ_yY5kkzos'

export async function POST(req: NextRequest) {
  try {
    const { shop_id, login_password, market, period_days = 30 } = await req.json()

    if (!shop_id) {
      return NextResponse.json({ error: 'shop_id required' }, { status: 400 })
    }
    if (!login_password) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // The PIN is only 4 digits (10,000 possibilities) — rate limit PIN
    // attempts per shop_id to blunt brute-forcing (Part 37), on top of
    // the ownership check itself.
    const { allowed, retryAfterSeconds } = rateLimit(`dashboard-stats:${shop_id}:${getClientIp(req)}`, 10, 300)
    if (!allowed) {
      return NextResponse.json({ error: 'Too many attempts. Please wait before retrying.' }, { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } })
    }

    const sb = createClient(SB_URL, SB_KEY)

    // Verify shop exists AND the caller supplied the correct seller PIN
    // (login_password) for this shop — never trust a client-supplied
    // shop_id alone, since shop ids are public (they're the storefront
    // URL slug at /store/[id]). This is a stop-gap authorization check
    // matching the app's existing PIN-based seller auth model; the
    // durable fix is a real server-verifiable session (see security
    // audit notes) rather than a per-request shared secret.
    const table  = market === 'campus' ? 'campus_stores' : 'pending_payments'
    const idCol  = 'id'

    const { data: shopRecord } = await sb
      .from(table).select('id, login_password').eq(idCol, shop_id).maybeSingle()

    if (!shopRecord || String(shopRecord.login_password || '') !== String(login_password)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const since = new Date()
    since.setDate(since.getDate() - period_days)

    const ordersTable = 'orders'
    const ordersIdCol = market === 'campus' ? 'store_id' : 'shop_id'

    const [ordersResult, productsResult] = await Promise.all([
      sb.from(ordersTable)
        .select('id,status,total_amount,total_price,product_name,customer_name,customer_phone,created_at')
        .eq(ordersIdCol, shop_id)
        .gte('created_at', since.toISOString())
        .order('created_at', { ascending: false }),
      sb.from(market === 'campus' ? 'campus_products' : 'products')
        .select('id,name,price,stock')
        .eq(market === 'campus' ? 'store_id' : 'shop_id', shop_id),
    ])

    const orders = ordersResult.data || []
    const products = productsResult.data || []

    // Compute stats server-side
    const revenue = orders
      .filter(o => o.status !== 'cancelled')
      .reduce((s, o) => s + Number(o.total_amount || o.total_price || 0), 0)

    const stats = {
      total_orders:   orders.length,
      pending_orders: orders.filter(o => o.status === 'pending').length,
      revenue,
      total_products: products.length,
    }

    return NextResponse.json({ stats, orders: orders.slice(0, 50), products })

  } catch (err: any) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
