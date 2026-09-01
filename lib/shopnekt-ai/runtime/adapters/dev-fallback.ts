import type { ModelRuntime, GenerateOptions, GenerateResult, StreamChunk, HealthCheckResult } from '../model-runtime'

// ═══════════════════════════════════════════════════════════
// DEV FALLBACK RUNTIME
// ═══════════════════════════════════════════════════════════
// HONESTY NOTE (this is the whole point of this file): this is NOT a
// language model. It does not "understand" the prompt. It exists so
// the system has a always-available, zero-dependency, fully offline-
// testable ModelRuntime implementation for when no real model is
// configured — per spec section 3: "If a real model runtime is
// unavailable, provide a clearly marked development fallback only.
// Never present the fallback as real AI." Every GenerateResult this
// produces sets isFallback: true, and callers (response/format.ts,
// the UI) are required to surface that honestly rather than hide it.
//
// It works by extracting the structured data block that was embedded
// in the prompt (see runtime/respond.ts, which is the only caller
// that builds prompts) and rendering it through a fixed, localized
// template — the exact same kind of deterministic text Batch 2's
// buildToolResultResponse already produced, just reachable through
// the same ModelRuntime interface a real adapter uses, so nothing
// above this layer needs to know which one is active.

export class DevFallbackRuntime implements ModelRuntime {
  readonly kind = 'devFallback' as const

  async generate(prompt: string, _options?: GenerateOptions): Promise<GenerateResult> {
    return { text: renderDeterministicText(prompt), runtimeKind: 'devFallback', isFallback: true }
  }

  async *stream(prompt: string, options?: GenerateOptions): AsyncIterable<StreamChunk> {
    const result = await this.generate(prompt, options)
    // Chunk by word groups, synchronously — no artificial delay
    // pretending this is live token generation (same discipline as
    // Batch 2's streamResponse).
    const words = result.text.split(' ')
    for (let i = 0; i < words.length; i += 4) {
      yield { type: 'delta', text: words.slice(i, i + 4).join(' ') + (i + 4 < words.length ? ' ' : '') }
    }
    yield { type: 'done', result }
  }

  async healthCheck(): Promise<HealthCheckResult> {
    return { available: true, kind: 'devFallback', detail: 'Development fallback — deterministic templates, not a real model.' }
  }
}

/**
 * Extracts a `###DATA###...###ENDDATA###` block from the prompt (the
 * convention runtime/respond.ts uses to embed real tool results) and
 * renders a fixed sentence from it. If no data block is present, it
 * honestly returns a "cannot help with that" line rather than
 * guessing — the fallback must never fabricate content either.
 */
function renderDeterministicText(prompt: string): string {
  const match = prompt.match(/###DATA###([\s\S]*?)###ENDDATA###/)
  if (!match) {return 'Development fallback active — no model-generated response available for this request.'}

  try {
    const data = JSON.parse(match[1])
    if (Array.isArray(data) && data.length > 0) {
      return `Found ${data.length} result${data.length === 1 ? '' : 's'}. (Dev fallback — plain template, not model-generated phrasing.)`
    }
    if (Array.isArray(data) && data.length === 0) {
      return 'No results found. (Dev fallback — plain template, not model-generated phrasing.)'
    }
    return 'Here is the requested information. (Dev fallback — plain template, not model-generated phrasing.)'
  } catch {
    return 'Development fallback active — could not parse the provided data.'
  }
}
