import type { SupportedLanguage } from '../data-core'
import type { ModelRuntime, StreamChunk } from './model-runtime'
import { getActiveRuntimeChecked } from './config'

// ═══════════════════════════════════════════════════════════
// GROUNDED RESPONSE GENERATION
// ═══════════════════════════════════════════════════════════
// This is the ONLY module in the entire AI system where model output
// becomes user-facing text. It receives ALREADY-FETCHED, ALREADY-
// AUTHORIZED tool data (never a database handle, never raw Supabase
// access, never AIRequestContext) and asks the model to phrase it
// naturally — nothing more. The system prompt is deliberately strict
// about this boundary, and the data is embedded as a machine-readable
// block the model is instructed never to go beyond.
//
// Section 12's requirement ("do not return raw JSON... respond
// naturally") and section 3's requirement ("never invent database
// facts") are in tension unless the grounding is enforced structurally
// — which is what the ###DATA###...###ENDDATA### convention plus the
// explicit system-prompt rule below does. The DevFallbackRuntime
// parses the exact same block when no real model is configured, so
// prompt-building logic here is identical regardless of which runtime
// ends up serving the request.

const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  en: 'English', sw: 'Kiswahili', fr: 'French', de: 'German', pt: 'Portuguese', ar: 'Arabic',
}

function buildSystemPrompt(language: SupportedLanguage): string {
  return [
    `You are ShopNekt 360 AI, a shopping/business assistant for the ShopNekt marketplace in Tanzania.`,
    `Respond ONLY in ${LANGUAGE_NAMES[language]}. Never mix languages.`,
    `Never translate or alter these exact brand terms: ShopNekt, QNEX360, Social Vybe, Flash Deals, Group Buy.`,
    `You will be given a block of REAL data between ###DATA### and ###ENDDATA###. This is the complete and only information you are allowed to reference.`,
    `You MUST NOT mention, imply, or invent any product, shop, price, stock level, order, or seller detail that is not explicitly present in that data block.`,
    `If the data block is an empty list, say clearly that nothing matching was found — do not suggest alternatives that aren't in the data.`,
    `Keep the response concise, warm, and conversational — 1-3 sentences. Do not output JSON or code.`,
  ].join(' ')
}

function buildPrompt(toolName: string, data: unknown): string {
  return `Tool called: ${toolName}\n\n###DATA###${JSON.stringify(data)}###ENDDATA###\n\nPhrase this naturally for the user.`
}

export type GroundedResponse = { text: string; isFallback: boolean; runtimeKind: string }

/**
 * Generates the final user-facing sentence for a tool result. Always
 * succeeds — if the preferred runtime is unavailable or errors, falls
 * back to a plain, still-honest deterministic line (never crashes the
 * conversation over a model outage, per section 18/28's failure rules).
 */
export async function generateGroundedResponse(
  toolName: string,
  data: unknown,
  language: SupportedLanguage
): Promise<GroundedResponse> {
  try {
    const { runtime, usedFallback } = await getActiveRuntimeChecked()
    const result = await runtime.generate(buildPrompt(toolName, data), { system: buildSystemPrompt(language) })
    return { text: result.text, isFallback: usedFallback || result.isFallback, runtimeKind: result.runtimeKind }
  } catch {
    // Even the fallback runtime should never throw, but this is the
    // absolute last line of defense — never let a model/runtime error
    // surface as a broken conversation.
    return { text: '', isFallback: true, runtimeKind: 'devFallback' }
  }
}

/** Streaming variant, used by the /aiv UI for real progressive rendering. */
export async function* streamGroundedResponse(
  toolName: string,
  data: unknown,
  language: SupportedLanguage
): AsyncIterable<StreamChunk> {
  const { runtime } = await getActiveRuntimeChecked()
  yield* runtime.stream(buildPrompt(toolName, data), { system: buildSystemPrompt(language) })
}

export type { ModelRuntime }
