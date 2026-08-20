import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SB_URL = 'https://bscecjbgnjitlfmgwcic.supabase.co'
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
  || process.env.SUPABASE_ANON_KEY
  || 'sb_publishable_giz1AS9CcdTiksOrW5U0rQ_yY5kkzos'

export async function POST(req: NextRequest) {
  try {
    const { shop_id, market, period_days = 30 } = await req.json()

    if (!shop_id) {
      return NextResponse.json({ error: 'shop_id required' }, { status: 400 })
    }

    const sb = createClient(SB_URL, SB_KEY)

    // Verify session is valid — NEVER trust browser-supplied shop_id alone
    const table  = market === 'campus' ? 'campus_stores' : 'pending_payments'
    const idCol  = 'id'
    const statusFilter = market === 'campus' ? { is_active: true } : { status: 'approved' }

    const { data: shopRecord } = await sb
      .from(table).select('id').eq(idCol, shop_id).maybeSingle()

    if (!shopRecord) {
      return NextResponse.json({ error: 'Unauthorized — shop not found' }, { status: 403 })
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
      orders_errors:  ordersResult.error?.message,
      products_errors: productsResult.error?.message,
    }

    return NextResponse.json({ stats, orders: orders.slice(0, 50), products })

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
