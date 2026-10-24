-- Batch 1 security hardening — CUTOVER phase.
-- Apply only after the Batch 1 application is deployed and smoke-tested.

-- Catch PINs created by the old app during the prepare/deploy window.
-- Do not overwrite hashes already created by the new secure PIN flow.
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
    execute 'alter table public.pending_payments drop column login_password';
  end if;
end $$;

-- All writes now go through server APIs which validate seller/admin sessions.
revoke insert, update, delete on public.pending_payments from anon, authenticated;

-- Sensitive tables are accessed only through authenticated Next.js APIs.
alter table public.admin_notifications enable row level security;
alter table public.store_analytics enable row level security;
alter table public.auto_approvals enable row level security;

revoke all on public.admin_notifications from public, anon, authenticated;
revoke all on public.push_subscriptions from public, anon, authenticated;
revoke all on public.store_analytics from public, anon, authenticated;
revoke all on public.auto_approvals from public, anon, authenticated;

grant all on public.admin_notifications to service_role;
grant all on public.push_subscriptions to service_role;
grant all on public.store_analytics to service_role;
grant all on public.auto_approvals to service_role;
