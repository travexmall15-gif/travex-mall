# Batch 1 security deployment

## Safe rollout order

The migrations separate preparation from destructive cutover so a deployment between them does not break existing seller sign-in.

1. Apply `supabase/migrations/20260928_batch1_security.sql` first. It creates the private credential and lockout tables, server-only PIN RPCs, and copies current PINs without removing legacy columns or changing existing browser permissions.
2. Add these server-only Vercel environment variables in Production, Preview, and Development as appropriate:
   - `SELLER_SESSION_SECRET`: at least 32 random bytes, used to sign seller sessions and PIN-attempt keys.
   - `SHOPNEKT_SESSION_SECRET`: at least 32 random bytes, used to sign admin sessions.
   - `SHOPNEKT_ADMIN_PASSCODE`: a strong passphrase of at least 20 characters. The previous hard-coded `shopnekt2026` value is no longer accepted.
   - `SUPABASE_SERVICE_ROLE_KEY`: the existing Supabase service-role key. Keep it server-only.
3. Deploy the Batch 1 application and verify seller sign-in, protected APIs, and admin review.
4. **Do not run the cutover yet.** The legacy admin panel and seller settings page still contain direct Supabase writes. Those paths must first be moved behind authenticated server APIs; otherwise the cutover will break them. The legacy seller dashboard also still reads seller records directly, so seller-wide RLS isolation remains unfinished.
5. Only after those remaining paths are migrated and tested, apply `supabase/migrations/20260928120000_batch1_security_cutover.sql`. It catches PINs created during rollout, removes plaintext PIN storage, and closes direct browser access to sensitive writes/tables served by protected APIs.
6. Sellers must sign in again to receive an HttpOnly server session.

PIN reset now requires an active seller session. The old unauthenticated shop-name/phone reset was removed because it did not prove ownership. A verified recovery mechanism (such as an email or phone OTP flow) is still needed to restore self-service PIN recovery for sellers who cannot sign in.

Do not place any of these values in `NEXT_PUBLIC_*` variables or commit them to the repository.
