-- ═══════════════════════════════════════════════════════════
-- SHOPNEKT WEBSTORE BUILDER — Phase 1 migration
-- ═══════════════════════════════════════════════════════════
-- Run this in the Supabase SQL Editor before using the new
-- WebStore onboarding flow. Safe to re-run (IF NOT EXISTS guards).
--
-- IMPORTANT LESSON APPLIED: earlier work assumed pending_payments had
-- columns (shop_market, shop_logo) that turned out not to exist,
-- causing real INSERT errors. This migration does NOT assume anything
-- about the current schema beyond the confirmed-working columns
-- (id, owner_name, owner_phone, owner_email, shop_name, shop_category,
-- shop_region, shop_whatsapp, shop_desc, plan, status, created_at) —
-- every column below is added explicitly with IF NOT EXISTS.

-- ── Extend pending_payments with WebStore-specific fields ──
-- (kept on the same row as the shop/seller record per "extend, don't
-- duplicate" — the WebStore's owner IS the shop record already here)

alter table public.pending_payments
  add column if not exists shop_logo_url        text,
  add column if not exists shop_cover_url        text,
  add column if not exists shop_instagram        text,
  add column if not exists shop_facebook         text,
  add column if not exists shop_tiktok           text,
  add column if not exists shop_city             text,
  add column if not exists shop_address          text,
  add column if not exists selected_template      text,
  add column if not exists webstore_status        text not null default 'draft',
  add column if not exists webstore_rejection_reason text,
  add column if not exists webstore_submitted_at  timestamptz,
  add column if not exists webstore_reviewed_at   timestamptz,
  add column if not exists webstore_published_at  timestamptz;

-- webstore_status is a plain text column (not a native Postgres enum)
-- so future values can be added without a schema migration — but we
-- constrain it to the known lifecycle to catch typos/bugs early.
alter table public.pending_payments drop constraint if exists webstore_status_check;
alter table public.pending_payments
  add constraint webstore_status_check
  check (webstore_status in ('draft','submitted','under_review','approved','rejected','published'));

comment on column public.pending_payments.webstore_status is
  'WebStore publishing lifecycle — separate from `status`, which governs basic shop/account approval. draft -> submitted -> under_review -> (approved -> published) | rejected -> (edit) -> submitted again.';

-- ── WebStore template registry ──
-- Real, structured metadata about each available template — the
-- actual template UI/layout code lives in the app (lib/webstore-
-- templates/), this table is just what the onboarding UI queries to
-- show template choices per marketplace, and what the renderer looks
-- up to confirm a selected_template id is real and matches the shop's
-- market before rendering it.

create table if not exists public.webstore_templates (
  id           text primary key,          -- e.g. 'fashion-01', 'electronics-01'
  market       text not null,             -- 'fashion' | 'vehicle' | 'electronics'
  name         text not null,
  description  text not null,
  preview_image_url text,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

insert into public.webstore_templates (id, market, name, description) values
  ('fashion-01', 'fashion', 'Modern Boutique', 'Clean editorial layout with a full-width hero and grid product showcase.'),
  ('vehicle-01', 'vehicle', 'Auto Showroom', 'Dealership-style layout emphasizing large vehicle photography and specs.'),
  ('electronics-01', 'electronics', 'Tech Catalog', 'Structured, spec-forward layout built for browsing many products quickly.')
on conflict (id) do nothing;

-- RLS: template registry is public read-only reference data.
alter table public.webstore_templates enable row level security;
drop policy if exists "public read templates" on public.webstore_templates;
create policy "public read templates" on public.webstore_templates
  for select using (is_active = true);
