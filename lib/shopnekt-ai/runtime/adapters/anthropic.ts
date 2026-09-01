import type { ModelRuntime, GenerateOptions, GenerateResult, StreamChunk, HealthCheckResult } from '../model-runtime'

// ═══════════════════════════════════════════════════════════
// ANTHROPIC MODEL RUNTIME ADAPTER
// ═══════════════════════════════════════════════════════════
// A REAL, working external-model adapter — genuinely calls the
// Anthropic API over the network, not a simulation. Batch 3's spec
// explicitly permits "External model adapter if temporarily required"
// as one of several valid ModelRuntime implementations (distinct from
// Batch 2, which prohibited any provider connection outright).
//
// This reuses the exact same request shape already proven working
// elsewhere in this codebase (app/api/ai-chat/route.ts's Anthropic
// call) rather than inventing a new integration pattern — same
// endpoint, same header shape, same env var name for the key.
//
// Everything is configuration-driven (spec section 22) — no
// credentials are hardcoded anywhere in this file:
//   ANTHROPIC_API_KEY   — required; if absent, healthCheck() reports unavailable
//   MODEL_NAME           — defaults to 'claude-haiku-4-5'
//   MODEL_MAX_TOKENS      — defaults to 512
//   MODEL_TEMPERATURE     — defaults to 0.3 (low — this runtime phrases
//                            REAL tool data, it should not get creative
//                            with facts)
//   MODEL_TIMEOUT         — defaults to 15000ms

const ANTHROPIC_ENDPOINT = 'https://api.anthropic.com/v1/messages'
const ANTHROPIC_VERSION = '2023-06-01'

function getConfig() {
  return {
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: process.env.MODEL_NAME || 'claude-haiku-4-5',
    maxTokens: Number(process.env.MODEL_MAX_TOKENS) || 512,
    temperature: process.env.MODEL_TEMPERATURE !== undefined ? Number(process.env.MODEL_TEMPERATURE) : 0.3,
    timeoutMs: Number(process.env.MODEL_TIMEOUT) || 15_000,
  }
}

export class AnthropicModelRuntime implements ModelRuntime {
  readonly kind = 'anthropic' as const

  async generate(prompt: string, options?: GenerateOptions): Promise<GenerateResult> {
    const config = getConfig()
    if (!config.apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not configured — this runtime is unavailable. Call healthCheck() first.')
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), options?.timeoutMs ?? config.timeoutMs)

    try {
      const res = await fetch(ANTHROPIC_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': config.apiKey, 'anthropic-version': ANTHROPIC_VERSION },
        body: JSON.stringify({
          model: config.model,
          max_tokens: options?.maxTokens ?? config.maxTokens,
          temperature: options?.temperature ?? config.temperature,
          system: options?.system,
          messages: [{ role: 'user', content: prompt }],
        }),
        signal: controller.signal,
      })

      if (!res.ok) {
        throw new Error(`Anthropic API returned ${res.status}`)
      }

      const data = await res.json()
      const text = data.content?.[0]?.text || ''
      return { text, runtimeKind: 'anthropic', isFallback: false }
    } finally {
      clearTimeout(timeout)
    }
  }

  async *stream(prompt: string, options?: GenerateOptions): AsyncIterable<StreamChunk> {
    const config = getConfig()
    if (!config.apiKey) {
      yield { type: 'error', message: 'ANTHROPIC_API_KEY is not configured.' }
      return
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), options?.timeoutMs ?? config.timeoutMs)
    let fullText = ''

    try {
      const res = await fetch(ANTHROPIC_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': config.apiKey, 'anthropic-version': ANTHROPIC_VERSION },
        body: JSON.stringify({
          model: config.model,
          max_tokens: options?.maxTokens ?? config.maxTokens,
          temperature: options?.temperature ?? config.temperature,
          system: options?.system,
          messages: [{ role: 'user', content: prompt }],
          stream: true,
        }),
        signal: controller.signal,
      })

      if (!res.ok || !res.body) {
        yield { type: 'error', message: `Anthropic API returned ${res.status}` }
        return
      }

      // Real SSE parsing — reads Anthropic's actual streaming protocol
      // (content_block_delta events), not a simulated chunker.
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) {break}
        buffer += decoder.decode(value, { stream: true })

        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) {continue}
          const jsonStr = line.slice(6).trim()
          if (!jsonStr) {continue}
          try {
            const event = JSON.parse(jsonStr)
            if (event.type === 'content_block_delta' && event.delta?.text) {
              fullText += event.delta.text
              yield { type: 'delta', text: event.delta.text }
            }
          } catch {
            // Malformed/partial SSE line — skip rather than crash the stream.
          }
        }
      }

      yield { type: 'done', result: { text: fullText, runtimeKind: 'anthropic', isFallback: false } }
    } catch (err) {
      yield { type: 'error', message: err instanceof Error ? err.message : 'Stream failed.' }
    } finally {
      clearTimeout(timeout)
    }
  }

  async healthCheck(): Promise<HealthCheckResult> {
    const config = getConfig()
    if (!config.apiKey) {
      return { available: false, kind: 'anthropic', detail: 'ANTHROPIC_API_KEY is not configured.' }
    }
    // Presence of a key is checked here, not network reachability (to
    // avoid spending a real API call on every health check) — an
    // actual generate()/stream() call can still fail at request time,
    // and callers must handle that gracefully rather than assume
    // healthCheck() guarantees success.
    return { available: true, kind: 'anthropic' }
  }
}
