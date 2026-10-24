-- Batch 1 security hardening — PREPARE phase.
-- Backward-compatible with the currently deployed app: legacy PIN columns and
-- browser permissions remain until the later cutover migration.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.seller_credentials (
  store_id text not null,
  market text not null check (market = 'business'),
  pin_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (store_id, market)
);

alter table public.seller_credentials enable row level security;
revoke all on public.seller_credentials from public, anon, authenticated;
grant all on public.seller_credentials to service_role;

create table if not exists public.seller_pin_attempts (
  rate_key text primary key,
  attempts integer not null default 0,
  locked_until timestamptz,
  updated_at timestamptz not null default now()
);
alter table public.seller_pin_attempts enable row level security;
revoke all on public.seller_pin_attempts from public, anon, authenticated;
grant all on public.seller_pin_attempts to service_role;

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  store_id text not null,
  endpoint text not null unique,
  p256dh text not null,
  auth_key text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.push_subscriptions enable row level security;
revoke all on public.push_subscriptions from public, anon, authenticated;
grant all on public.push_subscriptions to service_role;

-- Copy existing 4-digit PINs into a private table without removing the old
-- column yet. The cutover migration catches registrations during deployment.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'pending_payments'
      and column_name = 'login_password'
  ) then
    execute $sql$
      insert into public.seller_credentials (store_id, market, pin_hash)
      select id::text, 'business', crypt(left(login_password, 4), gen_salt('bf', 12))
      from public.pending_payments
      where login_password ~ '^[0-9]{4}($|-)' 
      on conflict (store_id, market) do nothing
    $sql$;
  end if;

end $$;

create or replace function public.set_seller_pin(p_store_id text, p_market text, p_pin text)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public, extensions
as $$
begin
  if auth.role() <> 'service_role' then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if p_store_id is null or p_market <> 'business' or p_pin !~ '^[0-9]{4}$' then
    raise exception 'invalid pin request' using errcode = '22023';
  end if;
  insert into public.seller_credentials (store_id, market, pin_hash)
  values (p_store_id, p_market, crypt(p_pin, gen_salt('bf', 12)))
  on conflict (store_id, market) do update
  set pin_hash = excluded.pin_hash, updated_at = now();
end;
$$;
revoke all on function public.set_seller_pin(text, text, text) from public, anon, authenticated;
grant execute on function public.set_seller_pin(text, text, text) to service_role;

create or replace function public.verify_seller_pin(p_store_id text, p_market text, p_pin text, p_rate_key text)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public, extensions
as $$
declare
  v_attempts integer := 0;
  v_locked_until timestamptz;
  v_hash text;
begin
  if auth.role() <> 'service_role' then return false; end if;
  if p_store_id is null or p_market <> 'business'
     or p_pin !~ '^[0-9]{4}$' or p_rate_key !~ '^[a-f0-9]{64}$' then
    return false;
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_rate_key, 0));
  select attempts, locked_until into v_attempts, v_locked_until
  from public.seller_pin_attempts where rate_key = p_rate_key for update;
  v_attempts := coalesce(v_attempts, 0);
  if v_locked_until is not null and v_locked_until > now() then return false; end if;
  if v_locked_until is not null and v_locked_until <= now() then v_attempts := 0; end if;
  if v_attempts >= 5 then return false; end if;

  select pin_hash into v_hash from public.seller_credentials
  where store_id = p_store_id and market = p_market;

  if v_hash is not null and crypt(p_pin, v_hash) = v_hash then
    delete from public.seller_pin_attempts where rate_key = p_rate_key;
    return true;
  end if;

  v_attempts := v_attempts + 1;
  insert into public.seller_pin_attempts (rate_key, attempts, locked_until, updated_at)
  values (p_rate_key, v_attempts, case when v_attempts >= 5 then now() + interval '15 minutes' else null end, now())
  on conflict (rate_key) do update set
    attempts = excluded.attempts,
    locked_until = excluded.locked_until,
    updated_at = now();
  return false;
end;
$$;
revoke all on function public.verify_seller_pin(text, text, text, text) from public, anon, authenticated;
grant execute on function public.verify_seller_pin(text, text, text, text) to service_role;
