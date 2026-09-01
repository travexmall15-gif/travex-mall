// ═══════════════════════════════════════════════════════════
// PRICE EXPRESSION NORMALIZATION (Kiswahili commerce numerals)
// ═══════════════════════════════════════════════════════════
// This is deterministic parsing logic, not a neural model. It exists
// because Tanzanian buyers overwhelmingly describe prices using
// "laki"/"elfu"/"milioni" units and shorthand like "100k"/"1m" rather
// than literal digit strings, and the AI must normalize these into
// real TZS amounts before it can query product prices.
//
// Every mapping here is a real, well-known Tanzanian numeral
// convention (laki = 100,000; elfu = 1,000; milioni = 1,000,000) —
// nothing here is invented or guessed.

/** Base Kiswahili number words -> numeric multiplier for that word alone. */
const SW_NUMBER_WORDS: Record<string, number> = {
  moja: 1, mbili: 2, tatu: 3, nne: 4, tano: 5,
  sita: 6, saba: 7, nane: 8, tisa: 9, kumi: 10,
  ishirini: 20, thelathini: 30, arobaini: 40, hamsini: 50,
  sitini: 60, sabini: 70, themanini: 80, tisini: 90,
}

/** Kiswahili unit words -> their value in TZS. */
const SW_UNIT_WORDS: Record<string, number> = {
  elfu: 1_000,       // thousand
  laki: 100_000,      // hundred-thousand (a very common TZ colloquial unit)
  milioni: 1_000_000, // million
}

/** Comparator words -> canonical comparator, both languages. */
export type PriceComparator = 'lt' | 'lte' | 'gt' | 'gte' | 'eq' | 'between'

const COMPARATOR_WORDS: { pattern: RegExp; comparator: PriceComparator }[] = [
  { pattern: /\b(chini ya|chini|under|below|less than)\b/i, comparator: 'lt' },
  { pattern: /\b(zaidi ya|zaidi|above|over|more than)\b/i, comparator: 'gt' },
  { pattern: /\b(kati ya|between)\b/i, comparator: 'between' },
  { pattern: /\b(karibu|around|about|approximately)\b/i, comparator: 'eq' },
]

export type ParsedPriceExpression = {
  /** The raw substring that was matched, for debugging/telemetry. */
  raw: string
  /** The normalized amount in TZS. */
  amount: number
  /** How the amount relates to the target (e.g. "under 500k"). */
  comparator: PriceComparator | null
}

/**
 * Parses a single "<number word/digits> <unit word/suffix>" price
 * expression, e.g. "laki tano" -> 500000, "elfu hamsini" -> 50000,
 * "milioni moja" -> 1000000, "100k" -> 100000, "1.5m" -> 1500000.
 * Returns null if no recognizable price expression is found.
 */
function parseAmount(segment: string): number | null {
  const s = segment.trim().toLowerCase()

  // "100k", "1.5m" style shorthand
  const shorthand = s.match(/^(\d+(?:\.\d+)?)\s*(k|elfu)$/i) || s.match(/^(\d+(?:\.\d+)?)\s*(m|milioni)$/i)
  if (shorthand) {
    const n = parseFloat(shorthand[1])
    const unit = shorthand[2].toLowerCase()
    if (unit === 'k' || unit === 'elfu') {return Math.round(n * 1_000)}
    return Math.round(n * 1_000_000)
  }

  // Plain digit price, e.g. "500000" or "500,000"
  const digits = s.replace(/,/g, '')
  if (/^\d{4,}$/.test(digits)) {return parseInt(digits, 10)}

  // Kiswahili "<unit> <number-word>" e.g. "laki tano", "elfu hamsini",
  // "milioni moja". Also tolerates the number word coming from the
  // multi-word set (e.g. "laki tano na nusu" is intentionally NOT
  // supported — half units are rare enough in practice to skip safely
  // rather than guess).
  for (const [unitWord, unitValue] of Object.entries(SW_UNIT_WORDS)) {
    const re = new RegExp(`\\b${unitWord}\\s+([a-z]+)\\b`, 'i')
    const m = s.match(re)
    if (m) {
      const numberWord = m[1].toLowerCase()
      if (numberWord in SW_NUMBER_WORDS) {
        return SW_NUMBER_WORDS[numberWord] * unitValue
      }
      // "laki 5" (digit right after the unit word) is also valid
      const digitAfter = s.match(new RegExp(`\\b${unitWord}\\s+(\\d+)\\b`, 'i'))
      if (digitAfter) {return parseInt(digitAfter[1], 10) * unitValue}
    }
    // Bare unit word with no following number defaults to 1x
    // ("laki" alone rarely appears without a number in practice, so
    // this branch intentionally does NOT fire on a bare unit word —
    // avoiding a guess where the user's intent is genuinely ambiguous).
  }

  return null
}

/**
 * Extracts a structured price constraint from free-form Kiswahili/
 * English/mixed text. Returns null if no price expression is found —
 * the caller (Entity Engine, Batch 2) must not assume a price was
 * mentioned just because this function ran.
 *
 * Examples:
 *   "nionyeshe simu chini ya laki tano" -> { amount: 500000, comparator: 'lt' }
 *   "bidhaa zaidi ya 100k"              -> { amount: 100000, comparator: 'gt' }
 *   "iphone milioni moja"                -> { amount: 1000000, comparator: 'eq' }
 */
export function parsePriceExpression(text: string): ParsedPriceExpression | null {
  const lower = text.toLowerCase()

  let comparator: PriceComparator | null = null
  for (const { pattern, comparator: c } of COMPARATOR_WORDS) {
    if (pattern.test(lower)) { comparator = c; break }
  }

  // Try each unit word combination and the k/m shorthand, scanning the
  // whole string for the first plausible match.
  const candidates: RegExp[] = [
    /\b(?:laki|elfu|milioni)\s+[a-z]+\b/i,
    /\b(?:laki|elfu|milioni)\s+\d+\b/i,
    /\b\d+(?:\.\d+)?\s*(?:k|m)\b/i,
    /\b\d{1,3}(?:,\d{3})+\b/,   // comma-separated thousands, e.g. "150,000"
    /\b\d{4,}\b/,
  ]

  for (const re of candidates) {
    const m = lower.match(re)
    if (m) {
      const amount = parseAmount(m[0])
      if (amount !== null && amount > 0) {
        return { raw: m[0], amount, comparator: comparator ?? 'eq' }
      }
    }
  }

  return null
}

/** Formats a TZS amount the way ShopNekt displays prices elsewhere in the app. */
export function formatTZS(amount: number): string {
  return 'TZS ' + Math.round(amount).toLocaleString('en-US')
}
