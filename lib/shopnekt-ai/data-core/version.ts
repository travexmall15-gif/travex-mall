// ═══════════════════════════════════════════════════════════
// SHOPNEKT 360 AI — DATA CORE
// ═══════════════════════════════════════════════════════════
// BATCH 1 of the SHOPNEKT 360 AI Master Architecture.
//
// This package is the structured KNOWLEDGE/INTELLIGENCE layer for
// ShopNekt's own AI system. It is data + typed schemas + validation —
// NOT a language model, NOT an LLM wrapper, and NOT connected to any
// external AI provider (no Ollama/Llama/Qwen/Gemma/Claude/Gemini calls
// happen anywhere in this package).
//
// Layer boundaries (see docs/ARCHITECTURE.md for the full picture):
//   DATA CORE (this package)  — static knowledge: what ShopNekt IS,
//     what a request COULD mean, what tools COULD be called, what
//     rules apply. Pure data + schemas. No I/O, no side effects.
//   AI CORE (Batch 2)         — orchestration/reasoning that CONSUMES
//     this Data Core plus live application data to decide what to do.
//   AI ENGINE (Batch 3)       — the language-computation layer that
//     turns text into understanding, without external AI APIs.
//
// This module never imports Supabase, never calls fetch(), and never
// reaches into the live application database. Anything here is safe
// to import from either the Buyer app or the Seller dashboard, and
// safe to unit test in complete isolation.

export const DATA_CORE_VERSION = '1.0.0' as const

/**
 * Bump this whenever a BREAKING change is made to any exported schema
 * shape (a change that would require consumers in AI Core/Engine to
 * update their code, not just their data). Additive, backward-
 * compatible changes (new optional fields, new enum members) should
 * only bump the patch/minor part of DATA_CORE_VERSION above.
 */
export const DATA_CORE_SCHEMA_VERSION = 1 as const

export const DATA_CORE_CHANGELOG: { version: string; date: string; notes: string }[] = [
  {
    version: '1.0.0',
    date: '2026-08-30',
    notes: 'Initial Data Core: terminology, concepts, intents, entities, conversation/context rules, memory schema, tool/action registry, safety rules, response/fallback rules.',
  },
]
