import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

export const sb = createClient(
  'https://bscecjbgnjitlfmgwcic.supabase.co',
  'sb_publishable_giz1AS9CcdTiksOrW5U0rQ_yY5kkzos',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
)

export const NAVY  = '#0D1B3E'
export const GOLD  = '#C9A84C'
export const GREEN = '#059669'
export const RED   = '#DC2626'
export const OFF   = '#F8FAFF'
export const GRAY  = '#64748B'

export function fmtTZS(n: number): string {
  if (n >= 1000000) return 'TZS ' + (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return 'TZS ' + Math.round(n / 1000) + 'K'
  return 'TZS ' + n.toLocaleString()
}

export function timeAgo(d: string): string {
  if (!d) return ''
  const secs = (Date.now() - new Date(d).getTime()) / 1000
  if (secs < 60) return 'just now'
  if (secs < 3600) return Math.floor(secs / 60) + 'm ago'
  if (secs < 86400) return Math.floor(secs / 3600) + 'h ago'
  return Math.floor(secs / 86400) + 'd ago'
}
