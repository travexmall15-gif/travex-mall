# SHOPNEKT 360 AI — Architecture

**Status: Batch 1 of 3 (Data Core) — implemented, tested, type-safe.**
**Batch 2 (Buyer 360 AI / Seller 360 AI orchestration) and Batch 3
(model runtime + integration) are NOT started.**

## The three layers, and why they're separate

```
ShopNekt Application (Buyer App, Seller Dashboard)
              │
     ┌────────┴────────┐
     │                 │
BUYER 360 AI      SELLER 360 AI          ← Batch 2 (not built yet)
     │                 │
     └────────┬────────┘
              │
      SHOPNEKT AI CORE                    ← Batch 2 (not built yet)
   (orchestration/reasoning that
    consumes the Data Core + live
    ShopNekt data to decide what to do)
              │
      SHOPNEKT AI DATA CORE               ← Batch 1 (THIS package, done)
   (structured knowledge: terminology,
    concepts, intents, entities, rules,
    memory schema, tool contracts,
    safety policy — pure data + zod
    schemas + deterministic parsing.
    No I/O. No AI provider calls.)
              │
      AI ENGINE / MODEL RUNTIME           ← Batch 3 (not built yet)
   (the actual language-computation
    layer — tokenizer, inference,
    whatever runtime is chosen)
```

**This separation is load-bearing, not decorative.** The Data Core
(this package, `lib/shopnekt-ai/data-core/`) has zero dependency on
any model, any AI provider, or any network call. Every exported value
is either static data, a Zod schema, or a pure deterministic function
(e.g. `parsePriceExpression`). This is intentional and enforced:

- Nothing in this package imports `@supabase/supabase-js`.
- Nothing in this package calls `fetch`.
- Nothing in this package references Claude, Gemini, Qwen, Ollama, or
  any other model/provider.

If a future PR adds any of the above inside `data-core/`, that PR is
violating the architecture and should be redirected into AI Core
(Batch 2) or the AI Engine (Batch 3) instead.

## What's actually implemented vs. what's a contract for later

| Module | What it really does today |
|---|---|
| `terminology/price-expressions.ts` | **Real, working** deterministic parser for Tanzanian price expressions ("laki tano" → 500000). Fully unit tested. |
| `terminology/categories.ts` | **Real, working** bilingual category/market/region matcher, built from ShopNekt's actual `MARKET_CATS` and region list (not invented). |
| `concepts/index.ts` | **Real schemas** mirroring the live Supabase tables (`pending_payments`, `products`, `orders`, `flash_deals`, `group_orders`, `feed_posts`, `shop_likes`) confirmed by direct repository inspection across prior engineering work on this app. |
| `intents/index.ts`, `tools/index.ts` | **Contracts/taxonomy only.** These declare *what* intents and tools exist and their shape — they do not classify text or call any database. Batch 2 implements the actual classifier and tool execution against these contracts. |
| `rules/context-rules.ts` | **Real, working** pure logic for merging entities into conversation slots (unit tested against the exact "Natafuta simu → Samsung" scenario from the spec). Storage of context itself is Batch 2's job. |
| `memory/index.ts`, `safety/rules.ts` | **Policy as data.** These are the rules a real implementation must follow, structured so Batch 2 can check against them programmatically — not an implementation of memory storage or a safety filter itself. |

## Directory map

```
lib/shopnekt-ai/data-core/
├── index.ts                 # public API — import from here
├── version.ts                # DATA_CORE_VERSION + changelog
├── schemas/language.ts       # SupportedLanguage, LocalizedText
├── concepts/
│   ├── index.ts               # Shop/Product/Order/FlashDeal/GroupBuy/VybePost/PreferredShop schemas
│   └── workflows.ts           # how concepts relate in real user journeys
├── terminology/
│   ├── price-expressions.ts   # "laki tano" -> 500000 (real parser)
│   └── categories.ts          # bilingual category/market/region matching (real)
├── intents/index.ts          # buyer + seller intent taxonomy
├── entities/index.ts         # entity types + deterministic extraction
├── rules/
│   ├── context-rules.ts       # conversation/slot-filling schema + merge logic
│   └── response-rules.ts      # localized fallback/status messages (6 languages)
├── memory/index.ts           # memory scopes, retention policy, privacy rules
├── tools/index.ts            # tool/action contracts (buyer + seller)
├── safety/rules.ts           # hallucination control, auth boundaries, prompt-injection rule
└── __tests__/                 # vitest — run with `npm test`
```

## Why Batch 3 (own computation engine) needs a clear-eyed plan

The long-term goal stated in the master spec is a fully self-contained
language-computation layer with **no dependency on Ollama, Llama, Qwen,
Gemma, or any external AI API**. Worth being explicit about now, before
Batch 3 planning starts: building a neural language model (or an
equivalent from-scratch NLU system) that genuinely understands
Kiswahili/English code-switched commerce language, entirely in-house
and with zero external inference dependency, is normally a
specialized, months-long systems/ML engineering effort (comparable to
projects like llama.cpp or a from-scratch transformer training
pipeline) requiring GPU training infrastructure and curated datasets
neither of which exist in this development environment today.

This Data Core is deliberately architected so that concern is
contained to exactly one place: the AI Engine / Model Runtime layer.
Everything above it (Data Core, and Batch 2's AI Core /
Buyer-360/Seller-360) is provider-agnostic by construction — swapping
the eventual runtime should require zero changes to this package or
to Batch 2's orchestration logic, only a new implementation of the
Batch 3 runtime interface.

## Running the tests

```
npm test          # run once
npm run test:watch  # watch mode
```
