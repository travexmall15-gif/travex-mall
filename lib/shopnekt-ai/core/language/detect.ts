import { type SupportedLanguage } from '../../data-core'

// ═══════════════════════════════════════════════════════════
// LANGUAGE UNDERSTANDING — detection layer
// ═══════════════════════════════════════════════════════════
// HONESTY NOTE: this is a deterministic, heuristic word-list detector —
// NOT a neural language model. It is good enough to distinguish
// Kiswahili / English / code-switched input for ROUTING purposes (which
// fallback messages to use, whether to note code-switching), but it
// does not "understand" the message the way a real language model
// would. Deeper natural-language understanding is Batch 3's job (a
// real model runtime) or the deterministic entity/intent layers below,
// which are explicit about their own limits too.

// A compact, high-frequency Kiswahili function/commerce-word list.
// Deliberately common connective/question words rather than an
// exhaustive dictionary — these are the words that reliably appear in
// Kiswahili sentences regardless of topic, which is what makes them
// useful signal for language detection specifically (as opposed to
// entity/category words, which are handled by the Data Core's
// terminology layer instead).
const SW_SIGNAL_WORDS = new Set([
  'habari', 'hujambo', 'mambo', 'niaje', 'sawa', 'asante', 'tafadhali',
  'nataka', 'ninataka', 'niambie', 'nini', 'gani', 'vipi', 'jinsi',
  'zaidi', 'bidhaa', 'duka', 'maduka', 'nunua', 'lipa', 'peleka',
  'nilete', 'nipe', 'pia', 'lakini', 'kwamba', 'kwa', 'na', 'ya',
  'wa', 'za', 'la', 'ni', 'au', 'je', 'si', 'ha', 'ta', 'ka',
  'natafuta', 'nionyeshe', 'chini', 'karibu', 'wapi', 'lini', 'kiasi',
  'bei', 'kununua', 'kuagiza', 'oda', 'yangu', 'wangu', 'sina', 'sio',
  'kuna', 'bro', 'rafiki', 'ndugu', 'unayo', 'unaweza', 'naomba',
])

const EN_SIGNAL_WORDS = new Set([
  'the', 'is', 'are', 'want', 'need', 'show', 'me', 'my', 'find',
  'looking', 'for', 'under', 'over', 'about', 'how', 'much', 'where',
  'when', 'what', 'please', 'can', 'you', 'do', 'have', 'buy', 'order',
  'price', 'shop', 'shops', 'product', 'products',
  'around', 'phone', 'phones', 'shoes', 'laptop', 'laptops',
])

export type LanguageDetectionResult = {
  /** Best-guess primary language of the input text. */
  detected: SupportedLanguage
  /** True if the message shows meaningful code-switching between Kiswahili and English (Part 7's explicit requirement to handle this, not reject it). */
  isCodeSwitched: boolean
  /** Rough confidence 0-1, based on signal-word density — not a probability from a real model. */
  confidence: number
}

/**
 * Detects whether input text is primarily Kiswahili, English, or a
 * mix of both. This is the INPUT language — never confused with the
 * application's configured UI/response language (see
 * response/format.ts, which always uses the latter for output).
 */
export function detectInputLanguage(text: string): LanguageDetectionResult {
  const words = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean)

  if (words.length === 0) {
    return { detected: 'en', isCodeSwitched: false, confidence: 0 }
  }

  let swHits = 0
  let enHits = 0
  for (const w of words) {
    if (SW_SIGNAL_WORDS.has(w)) {swHits++}
    if (EN_SIGNAL_WORDS.has(w)) {enHits++}
  }

  const total = swHits + enHits
  if (total === 0) {
    // No recognizable signal words at all (e.g. a bare product name or
    // digits-only message) — default to English rather than guess, and
    // report zero confidence so callers know not to over-trust this.
    return { detected: 'en', isCodeSwitched: false, confidence: 0 }
  }

  const swRatio = swHits / total
  const isCodeSwitched = swHits > 0 && enHits > 0

  const detected: SupportedLanguage = swRatio >= 0.5 ? 'sw' : 'en'
  const confidence = Math.min(1, total / words.length)

  return { detected, isCodeSwitched, confidence }
}
