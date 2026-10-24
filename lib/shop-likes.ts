// ═══════════════════════════════════════════════════════════
// SHOPNEKT — Like Shop / Preferred Shops data layer
// Batch 1: backed by the real `shop_likes` Supabase table
// (see supabase/migrations/20260828_shop_likes.sql)
// ═══════════════════════════════════════════════════════════
import { sb } from '@/lib/supabase'

/**
 * Only a verified Supabase Auth session is treated as a buyer identity.
 * Browser localStorage values are user-controlled and cannot authorize data.
 */
export async function getCurrentBuyerId(): Promise<string | null> {
  const { data: { session } } = await sb.auth.getSession()
  return session?.user?.id || null
}

async function shopLikesRequest(url: string, init?: RequestInit) {
  const { data: { session } } = await sb.auth.getSession()
  const headers = new Headers(init?.headers)
  if (session?.access_token) {headers.set('Authorization', `Bearer ${session.access_token}`)}
  return fetch(url, { ...init, headers, cache: 'no-store' })
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
  const response = await shopLikesRequest(`/api/shop-likes?store_id=${encodeURIComponent(storeId)}`).catch(() => null)
  if (!response?.ok) {return 0}
  const result = await response.json().catch(() => null)
  return typeof result?.count === 'number' ? result.count : 0
}

/** Whether the given user has liked this store. Returns false if not signed in. */
export async function isShopLikedByUser(storeId: string, userId: string | null | undefined): Promise<boolean> {
  if (!userId) {return false}
  const response = await shopLikesRequest(`/api/shop-likes?store_id=${encodeURIComponent(storeId)}`).catch(() => null)
  if (!response?.ok) {return false}
  const result = await response.json().catch(() => null)
  return result?.liked === true
}

/** Like a shop (adds it to the user's Preferred Shops). Requires an authenticated user. */
export async function likeShop(storeId: string, userId: string): Promise<{ error: string | null }> {
  return setShopLike(storeId, userId, true)
}

/** Unlike a shop (removes it from the user's Preferred Shops). */
export async function unlikeShop(storeId: string, userId: string): Promise<{ error: string | null }> {
  return setShopLike(storeId, userId, false)
}

async function setShopLike(storeId: string, userId: string, liked: boolean): Promise<{ error: string | null }> {
  const currentBuyerId = await getCurrentBuyerId()
  if (!currentBuyerId || currentBuyerId !== userId) {return { error: 'Sign in again to update preferred shops.' }}
  const response = await shopLikesRequest('/api/shop-likes', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ store_id: storeId, liked }),
  }).catch(() => null)
  if (!response?.ok) {return { error: 'Unable to update preferred shops.' }}
  return { error: null }
}

/** Full Preferred Shops list for a signed-in user, joined with live store info. */
export async function listPreferredShops(userId: string): Promise<PreferredShop[]> {
  if (await getCurrentBuyerId() !== userId) {return []}
  const response = await shopLikesRequest('/api/shop-likes?list=1').catch(() => null)
  if (!response?.ok) {return []}
  const result = await response.json().catch(() => null)
  return Array.isArray(result?.shops) ? result.shops as PreferredShop[] : []
}

/** Returns only the current authenticated buyer's liked IDs from the server. */
export async function getLikedStoreIds(storeIds: string[]): Promise<Set<string>> {
  const buyerId = await getCurrentBuyerId()
  if (!buyerId || storeIds.length === 0) {return new Set()}
  const ids = storeIds.slice(0, 100).join(',')
  const response = await shopLikesRequest(`/api/shop-likes?store_ids=${encodeURIComponent(ids)}`).catch(() => null)
  if (!response?.ok) {return new Set()}
  const result = await response.json().catch(() => null)
  return new Set(Array.isArray(result?.liked_ids) ? result.liked_ids : [])
}
