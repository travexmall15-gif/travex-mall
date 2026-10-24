-- Batch 2/3 follow-up: remove browser writes to public feeds and private
-- group membership data, and make the associated writes server-only.

-- Preserve the payment-pending state used by the customer payment flow when
-- the deployed orders.status column is a PostgreSQL enum.
do $$
declare
  status_type text;
begin
  select pg_catalog.format('%I.%I', ns.nspname, typ.typname)
    into status_type
    from information_schema.columns as col
    join pg_catalog.pg_type as typ on typ.typname = col.udt_name
    join pg_catalog.pg_namespace as ns on ns.oid = typ.typnamespace
   where col.table_schema = 'public' and col.table_name = 'orders'
     and col.column_name = 'status' and typ.typtype = 'e'
   limit 1;
  if status_type is not null then
    execute 'alter type ' || status_type || ' add value if not exists ''payment_pending''';
  end if;
end;
$$;

create table if not exists public.shop_likes (
  id uuid primary key default gen_random_uuid(),
  store_id text not null,
  user_id text not null,
  created_at timestamptz not null default now(),
  unique (store_id, user_id)
);
create index if not exists shop_likes_store_id_idx on public.shop_likes (store_id);
create index if not exists shop_likes_user_id_idx on public.shop_likes (user_id);
create or replace view public.shop_like_counts as
  select store_id, count(*)::int as like_count
    from public.shop_likes
   group by store_id;

create or replace function public.join_group_order(
  p_group_id uuid,
  p_name text,
  p_phone text
)
returns jsonb
language plpgsql
set search_path = pg_catalog, public
as $$
declare
  v_group record;
  v_phone text;
  v_count integer;
  v_status text;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if p_group_id is null
     or p_name is null or pg_catalog.length(pg_catalog.btrim(p_name)) < 2
     or pg_catalog.length(pg_catalog.btrim(p_name)) > 120
     or p_phone is null then
    raise exception 'invalid group join request' using errcode = '22023';
  end if;

  v_phone := pg_catalog.regexp_replace(pg_catalog.btrim(p_phone), '[^0-9]', '', 'g');
  if pg_catalog.length(v_phone) < 6 or pg_catalog.length(v_phone) > 20 then
    raise exception 'invalid group join request' using errcode = '22023';
  end if;

  select g.id, g.status, g.expires_at, g.current_members, g.min_members
    into v_group
    from public.group_orders as g
   where g.id = p_group_id
   for update;
  if not found then
    raise exception 'group not found' using errcode = 'P0002';
  end if;
  if v_group.status <> 'open'
     or v_group.expires_at <= pg_catalog.now()
     or coalesce(v_group.current_members, 0) >= coalesce(v_group.min_members, 1) then
    raise exception 'group closed' using errcode = '55000';
  end if;

  if exists (
    select 1
      from public.group_order_members as m
     where m.group_id = p_group_id
       and pg_catalog.regexp_replace(m.phone, '[^0-9]', '', 'g') = v_phone
  ) then
    raise exception 'phone already joined' using errcode = '23505';
  end if;

  insert into public.group_order_members (group_id, name, phone)
  values (p_group_id, pg_catalog.btrim(p_name), pg_catalog.btrim(p_phone));

  update public.group_orders as g
     set current_members = coalesce(g.current_members, 0) + 1,
         status = case
           when coalesce(g.current_members, 0) + 1 >= coalesce(g.min_members, 1) then 'completed'
           else 'open'
         end
   where g.id = p_group_id
   returning g.current_members, g.status into v_count, v_status;

  return pg_catalog.jsonb_build_object('current_members', v_count, 'status', v_status);
end;
$$;
revoke all on function public.join_group_order(uuid, text, text) from public, anon, authenticated;
grant execute on function public.join_group_order(uuid, text, text) to service_role;

create or replace function public.submit_order_payment(
  p_order_id uuid,
  p_buyer_id text,
  p_payment_method text,
  p_payment_option text,
  p_delivery_location text,
  p_note text
)
returns boolean
language plpgsql
set search_path = pg_catalog, public
as $$
declare
  v_order public.orders%rowtype;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if p_order_id is null or p_buyer_id is null
     or coalesce(p_payment_method, '') not in ('tigopesa', 'mpesa', 'yas', 'airtel', 'halotel', 'bank')
     or coalesce(p_payment_option, '') not in ('full', 'item-only', 'delivery-later')
     or pg_catalog.length(coalesce(p_delivery_location, '')) > 250
     or pg_catalog.length(coalesce(p_note, '')) > 1000 then
    raise exception 'invalid payment request' using errcode = '22023';
  end if;

  select * into v_order from public.orders as o
   where o.id = p_order_id and o.buyer_id::text = p_buyer_id
   for update;
  if not found then return false; end if;
  if v_order.status not in ('pending', 'rejected') then return false; end if;

  insert into public.payments (
    order_id, payment_method, payment_option, delivery_location,
    note, status, created_at
  ) values (
    p_order_id, p_payment_method, p_payment_option, coalesce(p_delivery_location, ''),
    coalesce(p_note, ''), 'pending_confirmation', pg_catalog.now()
  );

  update public.orders set status = 'payment_pending' where id = p_order_id;
  return true;
end;
$$;
revoke all on function public.submit_order_payment(uuid, text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.submit_order_payment(uuid, text, text, text, text, text) to service_role;

create or replace function public.adjust_feed_post_likes(p_post_id uuid, p_delta smallint)
returns integer
language plpgsql
set search_path = pg_catalog, public
as $$
declare
  v_likes integer;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if p_post_id is null or p_delta not in (-1, 1) then
    raise exception 'invalid like request' using errcode = '22023';
  end if;

  update public.feed_posts as f
     set likes = pg_catalog.greatest(coalesce(f.likes, 0) + p_delta, 0),
         likes_count = pg_catalog.greatest(coalesce(f.likes_count, 0) + p_delta, 0)
   where f.id = p_post_id
     and exists (
       select 1 from public.pending_payments as s
        where s.id::text = f.store_id::text and s.status = 'approved'
     )
   returning pg_catalog.greatest(coalesce(f.likes_count, 0), 0) into v_likes;

  return v_likes;
end;
$$;
revoke all on function public.adjust_feed_post_likes(uuid, smallint) from public, anon, authenticated;
grant execute on function public.adjust_feed_post_likes(uuid, smallint) to service_role;

create or replace function public.is_approved_business_store(p_store_id text)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog
as $$
  select exists (
    select 1 from public.pending_payments as s
     where s.id::text = p_store_id and s.status = 'approved'
  );
$$;
revoke all on function public.is_approved_business_store(text) from public, anon, authenticated;
grant execute on function public.is_approved_business_store(text) to anon, authenticated, service_role;

-- These old counter RPCs were callable by default through PostgREST. Keep them
-- only for trusted server-side compatibility; public UI now uses the validated
-- rate-limited API route and adjust_feed_post_likes above.
revoke all on function public.increment_likes(uuid) from public, anon, authenticated;
grant execute on function public.increment_likes(uuid) to service_role;
revoke all on function public.decrement_likes(uuid) from public, anon, authenticated;
grant execute on function public.decrement_likes(uuid) to service_role;

-- Preserve public storefront listings while ensuring the browser cannot write
-- seller content or read group members' names and phone numbers.
alter table public.feed_posts enable row level security;
alter table public.flash_deals enable row level security;
alter table public.group_orders enable row level security;
alter table public.group_order_members enable row level security;
alter table public.products enable row level security;
alter table public.pending_payments enable row level security;
alter table public.shop_likes enable row level security;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'seller_credentials', 'seller_pin_attempts', 'push_subscriptions',
    'admin_notifications', 'store_analytics', 'auto_approvals', 'ai_chat_sessions',
    'seller_sales', 'seller_debts', 'pending_payments', 'orders', 'payments',
    'customers', 'profiles', 'store_messages', 'campus_applications',
    'campus_stores', 'campus_products', 'campus_orders'
  ] loop
    if pg_catalog.to_regclass(pg_catalog.format('public.%I', table_name)) is not null then
      execute pg_catalog.format('alter table public.%I enable row level security', table_name);
      execute pg_catalog.format('revoke all on public.%I from public, anon, authenticated', table_name);
      execute pg_catalog.format('grant all on public.%I to service_role', table_name);
    end if;
  end loop;
end;
$$;

do $$
declare
  p record;
begin
  for p in
    select schemaname, tablename, policyname
      from pg_catalog.pg_policies
     where schemaname = 'public'
       and tablename in ('feed_posts', 'flash_deals', 'group_orders', 'group_order_members', 'products')
  loop
    execute pg_catalog.format('drop policy if exists %I on %I.%I', p.policyname, p.schemaname, p.tablename);
  end loop;
end;
$$;

do $$
declare
  p record;
begin
  for p in
    select policyname from pg_catalog.pg_policies
     where schemaname = 'public' and tablename = 'shop_likes'
  loop
    execute pg_catalog.format('drop policy if exists %I on public.shop_likes', p.policyname);
  end loop;
end;
$$;

revoke all on public.feed_posts, public.flash_deals, public.group_orders,
  public.group_order_members, public.products from public, anon, authenticated;
grant all on public.feed_posts, public.flash_deals, public.group_orders,
  public.group_order_members, public.products to service_role;
revoke all on public.pending_payments from public, anon, authenticated;
grant all on public.pending_payments to service_role;
revoke all on public.shop_likes from public, anon, authenticated;
grant all on public.shop_likes to service_role;
revoke all on public.shop_like_counts from public, anon, authenticated;
grant select on public.shop_like_counts to anon, authenticated;

grant select (id, store_id, shop_name, content, post_text, caption, tag, category,
  price, media_url, likes, likes_count, comments, university_abbr, product_id, created_at)
  on public.feed_posts to anon, authenticated;
grant select (id, store_id, shop_name, product_id, product_name, product_image,
  original_price, deal_price, discount_pct, starts_at, ends_at, max_orders,
  current_orders, status, created_at)
  on public.flash_deals to anon, authenticated;
grant select (id, store_id, shop_name, product_id, product_name, product_image,
  unit_price, discount_pct, min_members, current_members, expires_at, status, created_at)
  on public.group_orders to anon, authenticated;
grant select (id, name, price, stock, description, category, image_url, store_id,
  created_at, is_active, is_available)
  on public.products to anon, authenticated;

create policy feed_posts_public_read on public.feed_posts
  for select to anon, authenticated
  using (public.is_approved_business_store(feed_posts.store_id::text));
create policy flash_deals_public_read on public.flash_deals
  for select to anon, authenticated
  using (status = 'active' and ends_at > pg_catalog.now()
    and public.is_approved_business_store(flash_deals.store_id::text));
create policy group_orders_public_read on public.group_orders
  for select to anon, authenticated
  using (status in ('open', 'completed')
    and public.is_approved_business_store(group_orders.store_id::text));
create policy products_public_read on public.products
  for select to anon, authenticated
  using (coalesce(is_active, true) and coalesce(is_available, true)
    and coalesce(stock, 0) > 0
    and public.is_approved_business_store(products.store_id::text));

-- Private participant details are never exposed by the public group APIs.
revoke all on public.group_order_members from public, anon, authenticated;
