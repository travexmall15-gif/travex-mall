import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  'https://bscecjbgnjitlfmgwcic.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || 'sb_publishable_giz1AS9CcdTiksOrW5U0rQ_yY5kkzos'
)

export async function GET(req: Request) {
  // Protect this endpoint — it performs privileged writes (suspending
  // sellers, expiring campaigns) and was previously callable by anyone
  // on the internet with no authentication at all. Vercel Cron
  // automatically sends `Authorization: Bearer $CRON_SECRET` on its own
  // invocations once CRON_SECRET is set as an environment variable —
  // see https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs
  const authHeader = req.headers.get('authorization')
  const expected = process.env.CRON_SECRET
  if (!expected || authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
  const now    = new Date()
  const results = { reminded: 0, suspended: 0, reactivated: 0 }

  // Business sellers
  const { data: sellers } = await sb.from('pending_payments')
    .select('id,shop_name,owner_phone,shop_whatsapp,plan,subscription_end,status')
    .in('status', ['approved','suspended'])
    .not('subscription_end', 'is', null)

  for (const s of sellers || []) {
    const end  = new Date(s.subscription_end)
    const days = Math.ceil((end.getTime() - now.getTime()) / 86400000)
    const phone = (s.shop_whatsapp || s.owner_phone || '').replace(/\D/g, '')

    if (days <= 0 && s.status === 'approved') {
      await sb.from('pending_payments').update({ status: 'suspended' }).eq('id', s.id)
      results.suspended++
    } else if (days > 0 && days <= 7 && phone && s.status === 'approved') {
      results.reminded++
    }
  }

  // Campus sellers
  const { data: campus } = await sb.from('campus_stores')
    .select('id,store_name,whatsapp,phone,subscription_end,is_active')
    .not('subscription_end', 'is', null)

  for (const s of campus || []) {
    const end  = new Date(s.subscription_end)
    const days = Math.ceil((end.getTime() - now.getTime()) / 86400000)
    if (days <= 0 && s.is_active) {
      await sb.from('campus_stores').update({ is_active: false }).eq('id', s.id)
      results.suspended++
    }
  }

  // Auto-expire flash deals
  await sb.from('flash_deals')
    .update({ is_active: false })
    .lt('ends_at', now.toISOString())
    .eq('is_active', true)

  // Auto-expire group orders
  await sb.from('group_orders')
    .update({ status: 'expired' })
    .lt('expires_at', now.toISOString())
    .eq('status', 'open')

  return NextResponse.json({ success: true, ...results })
  } catch (err) {
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 })
  }
}
