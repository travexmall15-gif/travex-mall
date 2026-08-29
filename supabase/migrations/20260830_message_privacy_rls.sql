-- ═══════════════════════════════════════════════════════════
-- SHOPNEKT — Security hardening: message privacy (RLS)
-- ═══════════════════════════════════════════════════════════
-- Addresses: any authenticated user could previously view ANY
-- conversation by guessing/changing the id in /messages/<id> — there
-- was no server/DB-level check that the requester was buyer_id or
-- seller_id on that conversation (only a client-side page component,
-- which is not security).
--
-- IMPORTANT CAVEAT — read before running:
-- ShopNekt has TWO buyer identity paths: a real Supabase Auth session
-- (auth.uid() works) OR an OTP-based row in `customers` with the id
-- kept client-side in localStorage (auth.uid() is NULL for these users
-- — see lib/shop-likes.ts:getCurrentBuyerId()). The policies below use
-- auth.uid(), so they fully protect Supabase-Auth buyers and sellers,
-- but an OTP-only buyer's own conversations will also be blocked by
-- these policies (auth.uid() is null, matching nothing) UNLESS your
-- app additionally logs OTP customers into Supabase Auth (e.g. via
-- linkIdentity or a custom JWT) — that is NOT done anywhere in the
-- current codebase. Until that identity gap is closed, treat this
-- migration as protecting the Supabase-Auth-based portion of traffic;
-- the client-side guard added in app/messages/[id]/page.tsx is the
-- current defense for OTP-based buyers. Do not treat either layer
-- alone as sufficient — see PART 25's 'defense in depth' principle.

alter table public.conversations enable row level security;
alter table public.messages      enable row level security;

drop policy if exists "conversations_participant_select" on public.conversations;
create policy "conversations_participant_select"
  on public.conversations for select
  using (auth.uid() = buyer_id or auth.uid() = seller_id);

drop policy if exists "conversations_participant_update" on public.conversations;
create policy "conversations_participant_update"
  on public.conversations for update
  using (auth.uid() = buyer_id or auth.uid() = seller_id);

drop policy if exists "messages_participant_select" on public.messages;
create policy "messages_participant_select"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and (auth.uid() = c.buyer_id or auth.uid() = c.seller_id)
    )
  );

drop policy if exists "messages_participant_insert" on public.messages;
create policy "messages_participant_insert"
  on public.messages for insert
  with check (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and (auth.uid() = c.buyer_id or auth.uid() = c.seller_id)
    )
  );

-- NOTE: If enabling this RLS breaks messaging for OTP-based (non-Supabase-
-- Auth) buyers in production, that confirms the identity gap above and
-- the underlying auth architecture needs to be unified (e.g. issue OTP
-- customers a real Supabase Auth session) before these policies can be
-- the sole enforcement layer. Do not silently relax these policies back
-- to `using (true)` as a workaround — that reopens the vulnerability.
