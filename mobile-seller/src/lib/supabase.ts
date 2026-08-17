import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const SB_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://bscecjbgnjitlfmgwcic.supabase.co'
const SB_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_giz1AS9CcdTiksOrW5U0rQ_yY5kkzos'

export const sb = createClient(
  SB_URL,
  SB_KEY,
  { auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false } }
)

export const C = {
  NAVY: '#0D1B3E', GOLD: '#C9A84C', GREEN: '#059669',
  RED: '#DC2626',  OFF: '#F8FAFF',  GRAY: '#64748B',
  WHITE: '#FFFFFF', LGRAY: '#E2E8F0'
}

export const fmtTZS = (n: number) => {
  if (n >= 1e6) return 'TZS ' + (n/1e6).toFixed(1) + 'M'
  if (n >= 1e3) return 'TZS ' + Math.round(n/1e3) + 'K'
  return 'TZS ' + n.toLocaleString()
}

export const ago = (d: string) => {
  if (!d) return ''
  const s = (Date.now() - new Date(d).getTime()) / 1000
  if (s < 60) return 'just now'
  if (s < 3600) return Math.floor(s/60) + 'm ago'
  if (s < 86400) return Math.floor(s/3600) + 'h ago'
  return Math.floor(s/86400) + 'd ago'
}
