# shopnekt repository audit and data boundary

Audit date: 2026-10-24

## Stack and commands

- Next.js 16 App Router, React 19, TypeScript 5.7, Tailwind CSS 4, and Supabase JS.
- Web routes live under `app/`; route handlers live under `app/api/`.
- Shared web chrome is `components/app-shell.tsx`, `components/site-nav.tsx`, and `components/site-footer.tsx`. The root route is a splash/onboarding redirect; `/home` is the buyer home.
- Shared CSS variables and global styles live in `app/globals.css`; many older pages still use inline styles.
- The repository has `package-lock.json`; scripts are `dev`, `build`, `start`, `lint`, and `test` in `package.json`.

## Route and feature inventory

| Area | Current routes and implementation | State found during inspection |
| --- | --- | --- |
| Entry and navigation | `/`, `/home`, `/menu`; persistent shell in `AppShell` | Root handles splash and stored sessions; `/home` is the actual discovery page. Header search already routes to `/search`. |
| Buyer discovery | `/market`, `/market/[market]`, `/search`, `/store/[slug]` | Market data comes from `/api/public/market`; search previously covered approved stores and available products only. Store detail is live and still has some direct browser Supabase reads. |
| Social and promotions | `/vybe`, `/flash-deals`, `/group-buy`, `/group-buy/[id]` | Existing pages read `feed_posts`, `flash_deals`, and `group_orders`; they are not yet behind a common repository boundary. |
| Buyer account features | `/orders`, `/messages`, `/settings/*`, `/privacy` | Present; several account pages still call the browser Supabase client directly. |
| Seller and WebStore | `/dashboard/*`, `/open-store`, `/open-store-b2b`, `/open-store-b2c`, `/admin/webstores` | React WebStore builder and legacy static dashboard both exist. The builder currently offers fashion, vehicle, and electronics markets. |
| AI | `/ai`, `/aiv`, `/api/ai-*`, `/api/shopnekt-ai` | Present, with server routes and a structured AI library. |
| Other | `/subscription`, `/welcome`, `/auth`, `/login`; `mobile/` and `mobile-seller/` | Separate web, mobile, and legacy static surfaces. |

The repository's `lib/data.ts` contains sample university shops and products. The inspected buyer discovery pages do not use those sample records; Batch 01 continues to use the real public marketplace API rather than presenting that seed data as live inventory.

## Existing data access and integration boundary

- `lib/supabase.ts` creates the browser Supabase client. Several buyer and seller pages import it directly.
- `lib/security/server-supabase.ts` isolates the service-role Supabase client to server code.
- `app/api/public/market/route.ts` is the public server-side adapter for approved shops and available products. It uses an allowlisted field set and filters out non-approved stores.
- `lib/search.ts` is the buyer-side HTTP data access module. It calls API routes and does not need a Supabase client in the UI.
- The existing featured/sponsored data comes from approved `pending_payments` rows marked `is_sponsored`. Public products have an arbitrary text `category`, so HomeLiving category searches can use existing product records without a schema change.
- Vybe posts, Flash Deals, and Group Buy are backed by `feed_posts`, `flash_deals`, and `group_orders` respectively. No independent service-listing table or service submission route was found. Service discovery can therefore only return real approved businesses whose current category is Services; individual service listings remain a later feature.
- Supabase integration is intentionally unchanged in this batch: no credentials, project connection, schema, migrations, RLS, or production auth changes.

For buyer discovery, the UI calls a typed repository interface in `lib/search.ts`; its current HTTP implementation calls `/api/public/market`. That Next.js route owns query validation, public-field selection, approved-store visibility, category mapping, and future backend-record mapping. A future Supabase adapter can replace the route implementation while keeping the UI's domain result contract stable. Search failures throw to the page so it can show an error state; empty results remain a normal empty state.

## Shared UI foundation

- Brand tokens for color, typography, inputs, and button gradients already exist in `app/globals.css`; shared reusable button/card/form components also exist under `components/ui/`.
- `AppShell` provides the shared header/footer, with exclusions for auth, splash, and standalone pages.
- Header/footer brand identity is being aligned to lowercase `shopnekt` and `shopnekt — from QNEX360`.
- There is no notifications item in the global header navigation. Existing notification settings use a bell icon; unrelated navigation icons remain unchanged.

## Batch 01 scope and dependencies

The smallest safe Batch 01 change set is to refine shared tokens, make Home use live featured brands and live products in the requested order, expand the existing search API/data contract to the available public entity types, add category links for supported HomeLiving product categories, and improve the existing market store cards. The separate seller, messaging, payment, social redesign, and full service-submission work remains outside this batch.

## Baseline check notes

- `npx` and `npm` are not on this workstation's PATH. The bundled Node.js runtime can run the checked-in package scripts directly.
- Baseline TypeScript check passed.
- The unfiltered lint command scanned generated `.next` output and reported a large set of generated-file errors; it also reported a parse error in the existing `public/lang.js`. A focused source lint is used for the files changed in Batch 01.
- The first Vitest run failed before executing tests because workers could not rename temporary files under the sandbox OS temp directory (`EPERM`). Retest with a repo-local temporary directory is required.
- The repository already had numerous uncommitted changes and a local, unapplied Batch 2 migration before Batch 00 began. They have been preserved; the migration is not part of Batch 01.

## Batch 01 implementation and verification

- The shared marketplace API now supports typed mixed search for approved stores, available products, Vybe posts, active Flash Deals, service businesses, and open Group Buy campaigns. Each result includes an existing detail route; the UI validates the response shape through `lib/search.ts` before rendering it.
- Home uses live approved featured-brand data and live in-stock products. Its seller and service cards route into existing setup/search paths. No standalone service-submission flow or mock business data was added.
- Market browsing includes the requested Home & Living categories. Store cards show up to three real product previews only for approved, published WebStores, and the grid is two columns on desktop and one on narrow mobile screens.
- Shared navigation keeps its existing structure and unrelated icons. Header/footer identity and route metadata use lowercase `shopnekt`. The React application and shared components contain no emoji glyphs; replaced visible glyphs with existing Lucide icon components or plain text.
- `lib/search.ts` is a typed UI-facing repository boundary. Pages call its HTTP adapter; the public API route owns query validation, record selection, public-field shaping, visibility rules, and links. Other, out-of-scope screens still use the existing browser Supabase client and can be migrated in a later batch.
- No credentials, project connection, database schema, migration, RLS, authentication, or payment changes were made for Batch 01. The pre-existing local Batch 2 migration remains untouched.

Verification after implementation:

- TypeScript: passed (`tsc --noEmit --incremental false`).
- Public marketplace route tests: 3 passed. Full Vitest suite: 159 passed; one pre-existing orchestrator suite cannot load the missing `server-only` package.
- Focused ESLint over the modified React/API files: 0 errors and 77 warnings. Most warnings are pre-existing unused-variable, `any`, or hook-dependency warnings in older screens.
- `git diff --check`: passed. A Unicode emoji scan found no emoji glyphs in `app/` or `components/`; legacy static pages under `public/` were left outside this batch.
- Production build could not complete in this environment. Turbopack failed to start its CSS worker; the Webpack retry failed with `EPERM` while creating a `.next/server/app/api/group-buy/[id]` directory. The local dev server started, but the in-app browser could not connect to its localhost address, so a rendered desktop/mobile visual check remains unverified. Responsive breakpoints and layouts were inspected in source.
