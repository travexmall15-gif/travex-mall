-- ═══════════════════════════════════════════════════════════
-- SHOPNEKT — Batch 2: link Vybe posts to a specific product
-- ═══════════════════════════════════════════════════════════
-- Enables the "VIEW PRODUCT" commerce button on Social Vybe posts,
-- per Batch 2 spec item 2/10 (no duplicate product records — this is
-- just a reference, same pattern as flash_deals.product_id and
-- group_orders.product_id which already existed).
--
-- Run this against the Supabase project (SQL editor or CLI migration).
-- Safe to re-run.

alter table public.feed_posts
  add column if not exists product_id uuid;

create index if not exists feed_posts_product_id_idx on public.feed_posts (product_id);

-- Note: the seller-side "attach a product to this Vybe post" UI lives in
-- the legacy dashboard (public/dashboard/dashboard.html), which is not a
-- Batch 2 target page. Until that creation flow sets product_id on new
-- posts, "View Product" simply won't render for existing posts — this
-- migration only makes the column available; it does not backfill it.
