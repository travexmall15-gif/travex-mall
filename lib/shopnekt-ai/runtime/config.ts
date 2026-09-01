import type { ModelRuntime } from './model-runtime'
import { DevFallbackRuntime } from './adapters/dev-fallback'
import { AnthropicModelRuntime } from './adapters/anthropic'

// ═══════════════════════════════════════════════════════════
// RUNTIME SELECTION
// ═══════════════════════════════════════════════════════════
// The ONLY place in the codebase that decides WHICH ModelRuntime
// implementation is active, driven entirely by the MODEL_RUNTIME
// environment variable (spec section 22) — never hardcoded.
//
//   MODEL_RUNTIME=anthropic   -> AnthropicModelRuntime (real, if ANTHROPIC_API_KEY is set)
//   MODEL_RUNTIME=devFallback -> DevFallbackRuntime (always, explicitly)
//   unset / anything else     -> auto: tries Anthropic if a key is present, else DevFallback
//
// This function is deliberately synchronous and cheap — it does NOT
// perform a network health check itself (see getActiveRuntimeChecked
// below for the version that does, and honestly reports availability).

export function getConfiguredRuntimeKind(): 'anthropic' | 'devFallback' {
  const configured = process.env.MODEL_RUNTIME
  if (configured === 'anthropic' || configured === 'devFallback') {return configured}
  // Auto-detect: prefer a real runtime when it's genuinely configured, never silently prefer fallback when a real option is available.
  return process.env.ANTHROPIC_API_KEY ? 'anthropic' : 'devFallback'
}

export function buildRuntime(kind: 'anthropic' | 'devFallback' = getConfiguredRuntimeKind()): ModelRuntime {
  switch (kind) {
    case 'anthropic': return new AnthropicModelRuntime()
    case 'devFallback': return new DevFallbackRuntime()
  }
}

/**
 * Builds the configured runtime AND verifies it's actually usable
 * right now, falling back to DevFallbackRuntime (with an honest
 * `usedFallback: true` flag) if the preferred runtime reports itself
 * unavailable — this is the function callers (respond.ts) should
 * actually use, rather than trusting buildRuntime() blindly.
 */
export async function getActiveRuntimeChecked(): Promise<{ runtime: ModelRuntime; usedFallback: boolean; detail?: string }> {
  const preferred = buildRuntime()
  if (preferred.kind === 'devFallback') {
    return { runtime: preferred, usedFallback: false }
  }
  const health = await preferred.healthCheck()
  if (health.available) {
    return { runtime: preferred, usedFallback: false }
  }
  return { runtime: new DevFallbackRuntime(), usedFallback: true, detail: health.detail }
}
