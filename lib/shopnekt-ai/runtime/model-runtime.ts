// ═══════════════════════════════════════════════════════════
// MODEL RUNTIME — the provider-agnostic abstraction
// ═══════════════════════════════════════════════════════════
// Nothing above this interface (AI Core, Buyer 360, Seller 360, Data
// Core, UI) may import a specific provider (Anthropic, OpenAI, Qwen,
// Ollama, a local engine) directly. Everything talks to a
// `ModelRuntime`. Swapping the concrete implementation — dev fallback
// today, an external adapter now permitted for Batch 3, a local
// runtime later — never requires touching anything above this file.
//
// CRITICAL SECURITY BOUNDARY: a ModelRuntime can only ever produce
// TEXT (or a structured-generation result validated against a caller-
// supplied schema). It has no access to Supabase, no access to tool
// execution, no access to AIRequestContext. This is enforced by the
// type signatures below, not just by convention — there is no
// parameter through which a database handle or auth context could
// reach an implementation. Tool selection and execution remain
// entirely in core/reasoning and core/tools (Batch 2), never here.

export type ModelRuntimeKind = 'devFallback' | 'anthropic'

export type GenerateOptions = {
  system?: string
  maxTokens?: number
  temperature?: number
  /** Milliseconds before the call is aborted — every adapter must honor this. */
  timeoutMs?: number
}

export type GenerateResult = {
  text: string
  /** Which runtime actually produced this — surfaced so the response layer/UI can honestly label real vs fallback output (spec section 3). */
  runtimeKind: ModelRuntimeKind
  /** True if this came from the clearly-marked development fallback, never a real model. */
  isFallback: boolean
}

export type StreamChunk =
  | { type: 'delta'; text: string }
  | { type: 'done'; result: GenerateResult }
  | { type: 'error'; message: string }

export type HealthCheckResult = {
  available: boolean
  kind: ModelRuntimeKind
  /** Human-readable reason when unavailable — never silently pretend everything is fine (spec section 22). */
  detail?: string
}

export interface ModelRuntime {
  readonly kind: ModelRuntimeKind

  /** Non-streaming generation. */
  generate(prompt: string, options?: GenerateOptions): Promise<GenerateResult>

  /** Streaming generation — real token-by-token output for adapters that support it; a single-chunk stream otherwise. Never simulates streaming with artificial delays. */
  stream(prompt: string, options?: GenerateOptions): AsyncIterable<StreamChunk>

  /** Checks whether this runtime can actually serve requests right now (e.g. API key present + reachable). */
  healthCheck(): Promise<HealthCheckResult>
}
