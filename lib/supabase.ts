import { createClient } from '@supabase/supabase-js'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bscecjbgnjitlfmgwcic.supabase.co'
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_giz1AS9CcdTiksOrW5U0rQ_yY5kkzos'

export const sb = createClient(SB_URL, SB_KEY, {
  global: {
    // Disable fetch caching — ensures fresh data on every query
    // This prevents stale Supabase responses being served from HTTP cache
    fetch: (url, options = {}) => fetch(url, {
      ...options,
      cache: 'no-store',
      headers: {
        ...((options as any).headers || {}),
        'Cache-Control': 'no-cache, no-store',
        'Pragma': 'no-cache',
      },
    }),
  },
})

// ── TYPES matching exact Supabase schema ──
export type CampusApplication = {
  id: string
  full_name: string
  email: string
  phone: string
  whatsapp_number: string
  university: string
  university_abbr: string
  region: string
  year_of_study: string
  business_category: string
  business_description: string
  id_card_url: string | null
  status: 'pending' | 'approved' | 'rejected'
  shop_number: string | null
  reviewed_at: string | null
  created_at: string
}

export type CampusStore = {
  id: string
  user_id: string | null
  store_name: string
  slug: string
  description: string | null
  logo: string | null
  banner: string | null
  category: string | null
  whatsapp_number: string | null
  university: string
  university_abbr: string
  year_of_study: string | null
  shop_number: string | null
  is_active: boolean | null
  is_verified: boolean | null
  subscription_status: string | null
  primary_color: string | null
  font: string | null
  created_at: string
}

export type CampusProduct = {
  id: string
  store_id: string
  name: string
  description: string | null
  price: number | null
  stock: number | null
  category: string | null
  image_url: string | null
  created_at: string
}

export type CampusOrder = {
  id: string
  store_id: string
  product_id: string | null
  product_name: string | null
  customer_name: string
  customer_phone: string
  delivery_location: string | null
  quantity: number
  total_price: number | null
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled'
  created_at: string
}

export type FeedPost = {
  id: string
  store_id: string
  caption: string
  media_url: string | null
  media_type: string | null
  price: number | null
  university_abbr: string | null
  likes_count: number
  created_at: string
}

export type AdminNotification = {
  id: string
  type: string
  title: string
  body: string
  is_read: boolean
  created_at: string
}

// ── HELPERS ──
export function fmtTZS(n: number | null) {
  if (!n) return '—'
  return 'TZS ' + Number(n).toLocaleString('en-US')
}

export function ago(ts: string) {
  const m = Math.floor((Date.now() - new Date(ts).getTime()) / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}
