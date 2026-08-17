import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bscecjbgnjitlfmgwcic.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_giz1AS9CcdTiksOrW5U0rQ_yY5kkzos'
)

// Track event
export async function POST(req: Request) {
  try {
    const { store_id, event, product_id, source } = await req.json()
    await sb.from('store_analytics').insert({ store_id, event, product_id, source })
  } catch {
    // Analytics failure is non-critical — never surface errors to client
  }
  return NextResponse.json({ success: true })
}

// Get analytics for store
export async function GET(req: Request) {
  const url    = new URL(req.url)
  const sid    = url.searchParams.get('store_id')
  const days   = parseInt(url.searchParams.get('days') || '30')
  const since  = new Date(); since.setDate(since.getDate() - days)

  const { data } = await sb.from('store_analytics')
    .select('event, created_at')
    .eq('store_id', sid)
    .gte('created_at', since.toISOString())

  const views    = (data||[]).filter(e => e.event === 'view').length
  const orders   = (data||[]).filter(e => e.event === 'order').length
  const waClicks = (data||[]).filter(e => e.event === 'whatsapp_click').length
  const conversion = views > 0 ? ((orders / views) * 100).toFixed(1) : '0'

  // Daily breakdown
  const daily: Record<string, number> = {}
  for (const e of data||[]) {
    const day = e.created_at.split('T')[0]
    if (e.event === 'view') daily[day] = (daily[day] || 0) + 1
  }

  return NextResponse.json({ views, orders, waClicks, conversion, daily })
}
