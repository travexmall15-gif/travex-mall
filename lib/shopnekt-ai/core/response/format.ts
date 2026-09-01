import {
  localize, REFUSAL_MESSAGES, STATUS_MESSAGES,
  type SupportedLanguage, type HallucinationClass, type RefusalReason, type ExtractedEntities,
} from '../../data-core'

// ═══════════════════════════════════════════════════════════
// RESPONSE ENGINE
// ═══════════════════════════════════════════════════════════
// Builds the structured internal response shape (Part 19) and exposes
// it through a streaming-ready interface (Part 20) — WITHOUT
// pretending real token streaming exists yet. There is no model
// producing tokens in Batch 2, so `streamResponse` below yields the
// complete, already-known text split into a few chunks, synchronously
// (no artificial setTimeout delays — that would be exactly the "fake
// progress" anti-pattern this project has explicitly rejected
// elsewhere). This exists so the UI layer can be built against the
// SAME async-iterable contract a real streaming model runtime will
// use in Batch 3, and won't need to change when that arrives.

export type AIResponseStatus = 'ok' | 'clarificationNeeded' | 'refused' | 'unknown' | 'error'

export type AIResponse = {
  text: string
  language: SupportedLanguage
  intentId: string | null
  entities: ExtractedEntities
  status: AIResponseStatus
  refusalReason?: RefusalReason
  /** What kind of provenance backs `text`'s factual content — Part 18's hallucination control, made structural rather than aspirational. */
  hallucinationClass: HallucinationClass
  /** Structured result data for the UI to render as cards (products/shops/deals/etc) — the model/text never controls raw UI rendering (Part 19). */
  data?: unknown
  confirmationRequired: boolean
  toolCalled?: string
}

export function buildRefusalResponse(reason: RefusalReason, language: SupportedLanguage, intentId: string | null): AIResponse {
  return {
    text: localize(REFUSAL_MESSAGES[reason], language),
    language, intentId, entities: {},
    status: 'refused', refusalReason: reason,
    hallucinationClass: 'KNOWN', // the refusal message itself is static Data Core knowledge, not a database claim
    confirmationRequired: false,
  }
}

export function buildUnknownResponse(language: SupportedLanguage, entities: ExtractedEntities): AIResponse {
  return {
    text: localize(REFUSAL_MESSAGES.noData, language),
    language, intentId: null, entities,
    status: 'unknown',
    hallucinationClass: 'UNKNOWN',
    confirmationRequired: false,
  }
}

export function buildClarificationResponse(
  language: SupportedLanguage, intentId: string, missingEntityType: string, entities: ExtractedEntities
): AIResponse {
  // A generic, honest "need more info" message — not a fabricated
  // guess about what to ask. A future model runtime can phrase this
  // more naturally (Batch 3); the underlying missingEntityType is
  // exposed on the response so the UI can render a targeted prompt if desired.
  const generic: Record<SupportedLanguage, string> = {
    en: 'Could you tell me a bit more?', sw: 'Unaweza kunieleza zaidi?',
    fr: 'Pouvez-vous m\'en dire un peu plus ?', de: 'Kannst du mir mehr dazu sagen?',
    pt: 'Você pode me dizer um pouco mais?', ar: 'هل يمكنك إخباري بمزيد من التفاصيل؟',
  }
  return {
    text: generic[language], language, intentId, entities,
    status: 'clarificationNeeded',
    hallucinationClass: 'MODEL_GENERATED', // wording only — no factual claim is made here
    confirmationRequired: false,
  }
}

export function buildToolResultResponse(
  language: SupportedLanguage, intentId: string, toolName: string, data: unknown, entities: ExtractedEntities
): AIResponse {
  // Text summary is intentionally minimal/generic — the UI renders the
  // real structured `data` as cards (Part 19: "the model should not
  // control raw UI rendering"). A future model runtime can generate
  // richer natural-language framing around this same real data.
  const isEmpty = Array.isArray(data) ? data.length === 0 : data === null || data === undefined
  const summary: Record<SupportedLanguage, string> = isEmpty
    ? { en: 'No results found.', sw: 'Hakuna matokeo yaliyopatikana.', fr: 'Aucun résultat trouvé.', de: 'Keine Ergebnisse gefunden.', pt: 'Nenhum resultado encontrado.', ar: 'لم يتم العثور على نتائج.' }
    : { en: 'Here\'s what I found.', sw: 'Haya ndiyo niliyoyapata.', fr: 'Voici ce que j\'ai trouvé.', de: 'Das habe ich gefunden.', pt: 'Aqui está o que encontrei.', ar: 'هذا ما وجدته.' }

  return {
    text: summary[language], language, intentId, entities,
    status: 'ok',
    hallucinationClass: 'DATABASE_RESULT',
    data, confirmationRequired: false, toolCalled: toolName,
  }
}

export function buildConfirmationRequiredResponse(
  language: SupportedLanguage, intentId: string, toolName: string, entities: ExtractedEntities
): AIResponse {
  return {
    text: localize(REFUSAL_MESSAGES.consequentialUnconfirmed, language),
    language, intentId, entities,
    status: 'refused', refusalReason: 'consequentialUnconfirmed',
    hallucinationClass: 'KNOWN',
    confirmationRequired: true, toolCalled: toolName,
  }
}

export function getStatusMessage(key: keyof typeof STATUS_MESSAGES, language: SupportedLanguage): string {
  return localize(STATUS_MESSAGES[key], language)
}

// ── Streaming-ready adapter (see module header note) ──
export type ResponseChunk =
  | { type: 'status'; text: string }
  | { type: 'textDelta'; text: string }
  | { type: 'data'; payload: unknown }
  | { type: 'done'; response: AIResponse }

/**
 * Wraps a complete AIResponse in the same async-iterable shape a real
 * streaming model runtime will use. Splits `text` into word-group
 * chunks and yields them with no artificial delay — this exists for
 * UI/interface compatibility, not to simulate the feel of live
 * generation (which would misrepresent this as more than it is).
 */
export async function* streamResponse(response: AIResponse): AsyncIterable<ResponseChunk> {
  const words = response.text.split(' ')
  const chunkSize = 4
  for (let i = 0; i < words.length; i += chunkSize) {
    yield { type: 'textDelta', text: words.slice(i, i + chunkSize).join(' ') + (i + chunkSize < words.length ? ' ' : '') }
  }
  if (response.data !== undefined) {
    yield { type: 'data', payload: response.data }
  }
  yield { type: 'done', response }
}
