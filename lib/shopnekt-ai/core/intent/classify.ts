import { INTENTS, getIntentsForRole, type IntentDefinition, type AssistantRole, type ExtractedEntities } from '../../data-core'

// ═══════════════════════════════════════════════════════════
// INTENT ENGINE
// ═══════════════════════════════════════════════════════════
// HONESTY NOTE: this is a deterministic keyword/pattern scorer against
// Data Core's example utterances — not a trained classifier and not a
// language model. It works reasonably well for a closed, well-defined
// intent set like ShopNekt's (21 intents, each with concrete bilingual
// examples), which is exactly the kind of routing task deterministic
// rules are legitimately suited for (per the Batch 2 brief: "deterministic
// rules may be used for domain understanding... routing"). It will not
// generalize to phrasing wildly different from the examples — that
// gap is real and is exactly what a future model runtime (Batch 3)
// improves, not something this module pretends to solve today.

function tokenize(text: string): Set<string> {
  return new Set(
    text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter(Boolean)
  )
}

export type IntentClassificationResult = {
  intentId: string | null
  confidence: number
  /** Every candidate considered, for debugging/observability — not shown to the user. */
  candidates: { intentId: string; score: number }[]
}

const MIN_CONFIDENCE = 0.15

/**
 * Scores a message against every intent available to the given role,
 * using token-overlap against that intent's example utterances (both
 * languages, since the input may be Kiswahili, English, or mixed) plus
 * a boost when entities this intent expects were actually extracted.
 */
export function classifyIntent(
  text: string,
  role: AssistantRole,
  extractedEntities: ExtractedEntities
): IntentClassificationResult {
  const messageTokens = tokenize(text)
  const candidateIntents = getIntentsForRole(role)

  const extractedTypes = new Set<string>(
    Object.keys(extractedEntities).filter(k => (extractedEntities as any)[k] !== undefined)
  )

  const scored = candidateIntents.map(intent => ({
    intentId: intent.id,
    score: scoreIntent(intent, messageTokens, extractedTypes),
  }))

  scored.sort((a, b) => b.score - a.score)
  const best = scored[0]

  if (!best || best.score < MIN_CONFIDENCE) {
    return { intentId: null, confidence: best?.score ?? 0, candidates: scored.slice(0, 5) }
  }

  return { intentId: best.intentId, confidence: best.score, candidates: scored.slice(0, 5) }
}

function scoreIntent(intent: IntentDefinition, messageTokens: Set<string>, extractedTypes: Set<string>): number {
  const exampleTokenSets = [...intent.examples.sw, ...intent.examples.en].map(tokenize)
  if (exampleTokenSets.length === 0) {return 0}

  let bestOverlap = 0
  for (const exampleTokens of exampleTokenSets) {
    let overlap = 0
    for (const t of exampleTokens) {if (messageTokens.has(t)) {overlap++}}
    const ratio = overlap / exampleTokens.size
    if (ratio > bestOverlap) {bestOverlap = ratio}
  }

  // Boost when entities this intent typically expects were actually
  // found in the message — e.g. a message with both a category AND a
  // price entity strongly suggests PRODUCT_SEARCH even if the exact
  // wording doesn't closely match an example.
  let entityBoost = 0
  if (intent.expectedEntities.length > 0) {
    const matched = intent.expectedEntities.filter(e => extractedTypes.has(e)).length
    entityBoost = 0.15 * (matched / intent.expectedEntities.length)
  }

  return Math.min(1, bestOverlap + entityBoost)
}
