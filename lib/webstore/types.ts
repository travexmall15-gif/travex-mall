// ═══════════════════════════════════════════════════════════
// SHOPNEKT WEBSTORE BUILDER — shared types
// ═══════════════════════════════════════════════════════════
// Mirrors the real pending_payments columns added in
// supabase/migrations/20260907_webstore_builder_phase1.sql — field
// names match 1:1 so no translation layer is needed between the DB
// row and the app.

export type Market = 'fashion' | 'vehicle' | 'electronics'

export type WebstoreStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'published'

/** The full WebStore/shop record, as read from pending_payments. */
export type WebstoreRecord = {
  id: string
  owner_name: string
  owner_phone: string
  owner_email: string | null
  shop_name: string
  shop_desc: string | null
  shop_category: string | null
  shop_region: string | null
  shop_city: string | null
  shop_address: string | null
  shop_whatsapp: string | null
  shop_instagram: string | null
  shop_facebook: string | null
  shop_tiktok: string | null
  shop_logo_url: string | null
  shop_cover_url: string | null
  selected_template: string | null
  webstore_status: WebstoreStatus
  webstore_rejection_reason: string | null
  status: 'pending' | 'approved' | 'rejected'
  plan: string | null
  created_at: string
}

/** Draft state while the seller is going through onboarding — not yet a real row until Stage 1 is saved. */
export type WebstoreDraft = {
  // Stage 1 — Business
  shop_name: string
  shop_desc: string
  shop_category: string
  market: Market | null
  // Stage 2 — Contact
  owner_phone: string
  shop_whatsapp: string
  owner_email: string
  // Stage 3 — Location
  shop_region: string
  shop_city: string
  shop_address: string
  // Stage 4 — Social (optional)
  shop_instagram: string
  shop_facebook: string
  shop_tiktok: string
  // Stage 5 — Branding
  shop_logo_url: string | null
  shop_cover_url: string | null
  // Stage 7
  selected_template: string | null
}

export const EMPTY_DRAFT: WebstoreDraft = {
  shop_name: '', shop_desc: '', shop_category: '', market: null,
  owner_phone: '', shop_whatsapp: '', owner_email: '',
  shop_region: '', shop_city: '', shop_address: '',
  shop_instagram: '', shop_facebook: '', shop_tiktok: '',
  shop_logo_url: null, shop_cover_url: null,
  selected_template: null,
}

export type WebstoreTemplateMeta = {
  id: string
  market: Market
  name: string
  description: string
  preview_image_url: string | null
}
