import { sb } from '@/lib/supabase'
import type { Market, WebstoreTemplateMeta } from './types'

/** Real query against webstore_templates — no hardcoded template lists in the UI. */
export async function getTemplatesForMarket(market: Market): Promise<WebstoreTemplateMeta[]> {
  const { data } = await sb
    .from('webstore_templates')
    .select('id, market, name, description, preview_image_url')
    .eq('market', market)
    .eq('is_active', true)
    .order('id', { ascending: true })
  return (data || []) as WebstoreTemplateMeta[]
}

export async function getTemplateById(id: string): Promise<WebstoreTemplateMeta | null> {
  const { data } = await sb
    .from('webstore_templates')
    .select('id, market, name, description, preview_image_url')
    .eq('id', id)
    .eq('is_active', true)
    .maybeSingle()
  return data as WebstoreTemplateMeta | null
}
