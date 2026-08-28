-- ═══════════════════════════════════════════════════════════
-- SHOPNEKT — Like Shop / Preferred Shops
-- Batch 1: Open Store + Seller Dashboard + Seller Storefront
-- ═══════════════════════════════════════════════════════════
-- Run this against the Supabase project (SQL editor or CLI migration).
-- Safe to re-run: uses IF NOT EXISTS guards.

-- NOTE ON user_id: ShopNekt has two buyer identity paths that both write to
-- tables like `orders.buyer_id` — a Supabase Auth session (session.user.id)
-- OR an OTP-based `customers` row (id stored client-side in
-- localStorage:"sn_customer_session"). Neither is guaranteed to be an
-- auth.users row, so user_id is a plain text id (not FK'd to auth.users),
-- matching the identity model already used by `orders`.
create table if not exists public.shop_likes (
  id         uuid primary key default gen_random_uuid(),
  store_id   text        not null,   -- matches pending_payments.id (Business Market store)
  user_id    text        not null,   -- session.user.id OR customers.id
  created_at timestamptz not null default now(),
  unique (store_id, user_id)
);

create index if not exists shop_likes_store_id_idx on public.shop_likes (store_id);
create index if not exists shop_likes_user_id_idx  on public.shop_likes (user_id);

-- RLS is left permissive here to match the existing access model used by
-- `orders` / `customers` / `feed_posts`, which are also written directly
-- from the client with the anon key and no per-row auth.uid() scoping.
alter table public.shop_likes enable row level security;

drop policy if exists "shop_likes_all" on public.shop_likes;
create policy "shop_likes_all"
  on public.shop_likes for all
  using (true)
  with check (true);

-- Public, read-only aggregate: total like count per store (no auth required,
-- used to render the "♥ 2.4K" count on the public storefront for any visitor).
create or replace view public.shop_like_counts as
  select store_id, count(*)::int as like_count
  from public.shop_likes
  group by store_id;

grant select on public.shop_like_counts to anon, authenticated;
