-- Batch 3: harden existing public-schema functions without changing tables.
-- This migration is safe to apply before the application cutover.

create or replace function public.update_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  new.updated_at := pg_catalog.now();
  return new;
end;
$$;
revoke all on function public.update_updated_at() from public, anon, authenticated;
grant execute on function public.update_updated_at() to service_role;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
begin
  insert into public.profiles (id, name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
revoke all on function public.handle_new_user() from public, anon, authenticated;
grant execute on function public.handle_new_user() to service_role;

create or replace function public.generate_tracking_code()
returns text
language plpgsql
set search_path = pg_catalog
as $$
begin
  return 'TM' || upper(substring(pg_catalog.gen_random_uuid()::text, 1, 6));
end;
$$;

create or replace function public.approve_subscription(
  p_subscription_id uuid,
  p_admin_name text default 'Admin'
)
returns void
language plpgsql
set search_path = pg_catalog, public
as $$
declare
  sub_rec public.subscriptions%rowtype;
  current_expiry timestamptz;
  new_expiry timestamptz;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if p_subscription_id is null or p_admin_name is null or length(p_admin_name) > 120 then
    raise exception 'invalid subscription approval' using errcode = '22023';
  end if;

  select * into sub_rec
  from public.subscriptions
  where id = p_subscription_id
  for update;
  if not found then raise exception 'subscription not found'; end if;

  select subscription_expires into current_expiry
  from public.stores
  where id = sub_rec.store_id;

  if current_expiry is not null and current_expiry > pg_catalog.now() then
    new_expiry := current_expiry + pg_catalog.make_interval(months => coalesce(sub_rec.duration_months, 1));
  else
    new_expiry := pg_catalog.now() + pg_catalog.make_interval(months => coalesce(sub_rec.duration_months, 1));
  end if;

  update public.subscriptions
  set status = 'active', approved_at = pg_catalog.now(), approved_by = p_admin_name,
      starts_at = pg_catalog.now(), expires_at = new_expiry,
      plan = coalesce(sub_rec.plan_type::text, sub_rec.plan, 'basic')
  where id = p_subscription_id;

  update public.stores
  set subscription_status = 'approved',
      subscription_plan = coalesce(sub_rec.plan_type::text, sub_rec.plan, 'basic'),
      subscription_start = pg_catalog.now(),
      subscription_expires = new_expiry,
      subscription_grace_until = null,
      is_active = true
  where id = sub_rec.store_id;
end;
$$;
revoke all on function public.approve_subscription(uuid, text) from public, anon, authenticated;
grant execute on function public.approve_subscription(uuid, text) to service_role;

-- These counters remain callable for compatibility, but their names and
-- objects are pinned to trusted schemas. Batch 2 restricts direct row writes.
alter function public.increment_likes(uuid) set search_path = pg_catalog, public;
alter function public.decrement_likes(uuid) set search_path = pg_catalog, public;

-- PIN RPCs are callable only through the server's service-role client.
alter function public.set_seller_pin(text, text, text) set search_path = pg_catalog, extensions;
alter function public.verify_seller_pin(text, text, text, text) set search_path = pg_catalog, extensions;
