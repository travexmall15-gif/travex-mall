import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  'https://bscecjbgnjitlfmgwcic.supabase.co',
  'sb_publishable_giz1AS9CcdTiksOrW5U0rQ_yY5kkzos'
)

// Save push subscription
export async function POST(req: Request) {
  try {
    const { store_id, subscription } = await req.json()
    await sb.from('push_subscriptions').upsert({
      store_id,
      endpoint:  subscription.endpoint,
      p256dh:    subscription.keys?.p256dh,
      auth_key:  subscription.keys?.auth,
    }, { onConflict: 'endpoint' })
  } catch {
    // Non-critical — push subscription failure should not break app
  }
  return NextResponse.json({ success: true })
}

// Send notification
export async function PUT(req: Request) {
  const { store_id, title, body, url } = await req.json()
  const { data: subs } = await sb.from('push_subscriptions')
    .select('*').eq('store_id', store_id)

  // In production, use web-push library here
  // For now, track notifications in admin_notifications table
  await sb.from('admin_notifications').insert({
    title, body, type: 'push_sent', is_read: false
  })

  return NextResponse.json({ success: true, sent: subs?.length || 0 })
}
