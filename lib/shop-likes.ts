// ═══════════════════════════════════════════════════════════
// SHOPNEKT — Like Shop / Preferred Shops data layer
// Batch 1: backed by the real `shop_likes` Supabase table
// (see supabase/migrations/20260828_shop_likes.sql)
// ═══════════════════════════════════════════════════════════
import { sb } from '@/lib/supabase'

/**
 * Resolves the current buyer's id the same way `orders`, `messages` and
 * `settings` pages already do: prefer a live Supabase Auth session, fall
 * back to the OTP-based customer session stored in localStorage.
 * Returns null if the visitor isn't signed in either way.
 */
export async function getCurrentBuyerId(): Promise<string | null> {
  const { data: { session } } = await sb.auth.getSession()
  if (session?.user) {return session.user.id}
  try {
    const raw = localStorage.getItem('sn_customer_session')
    if (raw) {
      const sess = JSON.parse(raw)
      if (sess?.id) {return sess.id as string}
    }
  } catch {}
  return null
}

export type PreferredShop = {
  store_id: string
  shop_name: string
  shop_category: string | null
  shop_region: string | null
  plan: string | null
  liked_at: string
}

/** Public, no-auth-required like count for a store (renders on the storefront). */
export async function getShopLikeCount(storeId: string): Promise<number> {
  const { count, error } = await sb
    .from('shop_likes')
    .select('id', { count: 'exact', head: true })
    .eq('store_id', storeId)
  if (error) {return 0}
  return count ?? 0
}

/** Whether the given user has liked this store. Returns false if not signed in. */
export async function isShopLikedByUser(storeId: string, userId: string | null | undefined): Promise<boolean> {
  if (!userId) {return false}
  const { data } = await sb
    .from('shop_likes')
    .select('id')
    .eq('store_id', storeId)
    .eq('user_id', userId)
    .maybeSingle()
  return !!data
}

/** Like a shop (adds it to the user's Preferred Shops). Requires an authenticated user. */
export async function likeShop(storeId: string, userId: string): Promise<{ error: string | null }> {
  const { error } = await sb.from('shop_likes').insert({ store_id: storeId, user_id: userId })
  // Unique constraint violation = already liked — treat as success, not an error.
  if (error && error.code !== '23505') {return { error: error.message }}
  return { error: null }
}

/** Unlike a shop (removes it from the user's Preferred Shops). */
export async function unlikeShop(storeId: string, userId: string): Promise<{ error: string | null }> {
  const { error } = await sb.from('shop_likes').delete().eq('store_id', storeId).eq('user_id', userId)
  return { error: error?.message ?? null }
}

/** Full Preferred Shops list for a signed-in user, joined with live store info. */
export async function listPreferredShops(userId: string): Promise<PreferredShop[]> {
  const { data: likes, error } = await sb
    .from('shop_likes')
    .select('store_id, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error || !likes || likes.length === 0) {return []}

  const storeIds = likes.map(l => l.store_id)
  const { data: stores } = await sb
    .from('pending_payments')
    .select('id, shop_name, shop_category, shop_region, plan')
    .in('id', storeIds)
    .eq('status', 'approved')

  const byId = new Map((stores || []).map(s => [s.id, s]))
  return likes
    .map(l => {
      const s = byId.get(l.store_id)
      if (!s) {return null}
      return {
        store_id: l.store_id,
        shop_name: s.shop_name,
        shop_category: s.shop_category,
        shop_region: s.shop_region,
        plan: s.plan,
        liked_at: l.created_at,
      } as PreferredShop
    })
    .filter((x): x is PreferredShop => x !== null)
}
