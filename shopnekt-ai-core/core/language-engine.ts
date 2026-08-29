/**
 * SHOPNEKT AI CORE - Language Engine Implementation
 * 
 * Handles language detection, normalization, and tokenization.
 * Supports all ShopNekt languages: en, sw, fr, de, pt, ar
 */

import type { SupportedLanguage, LanguageEngine, LanguageMeta } from './ai-types.js'

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['en', 'sw', 'fr', 'de', 'pt', 'ar']

export const LANGUAGE_META: Record<SupportedLanguage, LanguageMeta> = {
  en: { code: 'en', name: 'English', flag: 'EN', dir: 'ltr' },
  sw: { code: 'sw', name: 'Kiswahili', flag: 'SW', dir: 'ltr' },
  fr: { code: 'fr', name: 'Français', flag: 'FR', dir: 'ltr' },
  de: { code: 'de', name: 'Deutsch', flag: 'DE', dir: 'ltr' },
  pt: { code: 'pt', name: 'Português', flag: 'PT', dir: 'ltr' },
  ar: { code: 'ar', name: 'العربية', flag: 'AR', dir: 'rtl' },
}

// Common Swahili abbreviations and informal forms
const SW_ABBREVIATIONS: Record<string, string> = {
  'nz': 'nzuri',
  'bora': 'bora',
  'bei': 'bei',
  'mpaka': 'mpaka',
  'kwa': 'kwa',
  'ya': 'ya',
  'la': 'la',
  'cha': 'cha',
  'vya': 'vya',
  'na': 'na',
  'au': 'au',
  'lakini': 'lakini',
  'pia': 'pia',
  'tu': 'tu',
  'je': 'je',
  'nipe': 'nipe',
  'nataka': 'nataka',
  'ninatafuta': 'ninatafuta',
  'tafuta': 'tafuta',
  'nipatie': 'nipatie',
  'ona': 'ona',
  'angalia': 'angalia',
  'check': 'angalia',
  'bro': 'ndugu',
  'dude': 'ndugu',
}

// Common English abbreviations
const EN_ABBREVIATIONS: Record<string, string> = {
  'pls': 'please',
  'thx': 'thanks',
  'u': 'you',
  'r': 'are',
  'wanna': 'want to',
  'gonna': 'going to',
  'kinda': 'kind of',
  'sorta': 'sort of',
  'lotsa': 'lots of',
  'gimme': 'give me',
  'lemme': 'let me',
}

// Price pattern normalizations for Swahili
const SW_PRICE_PATTERNS: Record<string, number> = {
  'laki': 100000,
  'laki moja': 100000,
  'laki mbili': 200000,
  'laki tatu': 300000,
  'laki nne': 400000,
  'laki tano': 500000,
  'laki sita': 600000,
  'laki saba': 700000,
  'laki nane': 800000,
  'laki tisa': 900000,
  'laki kumi': 1000000,
  'milioni': 1000000,
  'milioni moja': 1000000,
  'elfu': 1000,
}

export class LanguageEngineImpl implements LanguageEngine {
  private loadedLanguages = new Set<SupportedLanguage>()

  constructor() {
    // Pre-load all supported languages
    SUPPORTED_LANGUAGES.forEach(lang => this.loadedLanguages.add(lang))
  }

  /**
   * Detect the language of input text
   * Uses heuristic analysis based on common words and patterns
   */
  detectLanguage(text: string): SupportedLanguage {
    const lowerText = text.toLowerCase()

    // Check for Arabic script
    if (/[\u0600-\u06FF]/.test(text)) {
      return 'ar'
    }

    // Swahili indicators
    const swIndicators = [
      'nina', 'tuna', 'wana', 'ana', 'una',
      'nafuta', 'tafuta', 'kutafuta',
      'duka', 'maduka', 'bidhaa',
      'bei', 'ghali', 'rahisi',
      'asante', 'samahani', 'karibu',
      'nzuri', 'bora', 'safi',
      'hakuna', 'kuna', 'pana',
      'mimi', 'wewe', 'yeye', 'sisi', 'nyinyi',
      'hapa', 'pale', 'mbali', 'karibu',
      'leo', 'kesho', 'jana',
    ]

    // Count Swahili matches
    let swScore = 0
    for (const indicator of swIndicators) {
      if (lowerText.includes(indicator)) {
        swScore++
      }
    }

    // French indicators
    const frIndicators = ['je', 'tu', 'nous', 'vous', 'le', 'la', 'les', 'un', 'une', 'des', 'de', 'du']
    let frScore = 0
    for (const indicator of frIndicators) {
      if (new RegExp(`\\b${indicator}\\b`, 'i').test(text)) {
        frScore++
      }
    }

    // German indicators
    const deIndicators = ['ich', 'du', 'wir', 'ihr', 'der', 'die', 'das', 'ein', 'eine']
    let deScore = 0
    for (const indicator of deIndicators) {
      if (new RegExp(`\\b${indicator}\\b`, 'i').test(text)) {
        deScore++
      }
    }

    // Portuguese indicators
    const ptIndicators = ['eu', 'tu', 'nós', 'você', 'o', 'a', 'os', 'as', 'um', 'uma']
    let ptScore = 0
    for (const indicator of ptIndicators) {
      if (new RegExp(`\\b${indicator}\\b`, 'i').test(text)) {
        ptScore++
      }
    }

    // Determine language based on scores
    const scores: Record<SupportedLanguage, number> = {
      sw: swScore,
      en: 0, // Default baseline
      fr: frScore,
      de: deScore,
      pt: ptScore,
      ar: 0,
    }

    // Arabic already detected above
    if (/[\u0600-\u06FF]/.test(text)) {
      return 'ar'
    }

    // Find highest score
    let maxScore = 0
    let detectedLang: SupportedLanguage = 'en'

    for (const lang of SUPPORTED_LANGUAGES) {
      if (scores[lang] > maxScore) {
        maxScore = scores[lang]
        detectedLang = lang
      }
    }

    // If Swahili score is significant, use it
    if (swScore >= 2) {
      return 'sw'
    }

    // If another language has strong signal, use it
    if (frScore >= 3) return 'fr'
    if (deScore >= 3) return 'de'
    if (ptScore >= 3) return 'pt'

    // Default to English or detected Swahili
    return swScore >= 1 ? 'sw' : 'en'
  }

  /**
   * Normalize text for processing
   * - Convert to lowercase (except for proper nouns in some languages)
   * - Expand abbreviations
   * - Normalize whitespace
   * - Handle mixed language input
   */
  normalize(text: string, language: SupportedLanguage): string {
    let normalized = text.trim()

    // Normalize whitespace
    normalized = normalized.replace(/\s+/g, ' ')

    // Expand abbreviations based on language
    if (language === 'sw') {
      normalized = this.expandSwahiliAbbreviations(normalized)
      normalized = this.normalizeSwahiliPriceExpressions(normalized)
    } else if (language === 'en') {
      normalized = this.expandEnglishAbbreviations(normalized)
    }

    // Remove extra punctuation at word boundaries (keep sentence structure)
    normalized = normalized.replace(/\s+([.,!?;:])/, '$1')

    return normalized
  }

  /**
   * Tokenize text into words/tokens
   */
  tokenize(text: string): string[] {
    // Split on whitespace and punctuation, keeping words
    const tokens = text
      .toLowerCase()
      .replace(/[.,!?;:()"'`]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 0)

    return tokens
  }

  /**
   * Check if a language is supported
   */
  supportsLanguage(language: SupportedLanguage): boolean {
    return this.loadedLanguages.has(language)
  }

  // ───────────────────────────────────────────────────────────
  // Private helper methods
  // ───────────────────────────────────────────────────────────

  private expandSwahiliAbbreviations(text: string): string {
    let result = text
    for (const [abbrev, expansion] of Object.entries(SW_ABBREVIATIONS)) {
      const regex = new RegExp(`\\b${abbrev}\\b`, 'gi')
      result = result.replace(regex, expansion)
    }
    return result
  }

  private expandEnglishAbbreviations(text: string): string {
    let result = text
    for (const [abbrev, expansion] of Object.entries(EN_ABBREVIATIONS)) {
      const regex = new RegExp(`\\b${abbrev}\\b`, 'gi')
      result = result.replace(regex, expansion)
    }
    return result
  }

  private normalizeSwahiliPriceExpressions(text: string): string {
    let result = text

    // Handle "laki" expressions - e.g., "laki tano" -> "500000"
    for (const [expr, value] of Object.entries(SW_PRICE_PATTERNS)) {
      const regex = new RegExp(`\\b${expr}\\b`, 'gi')
      // Only replace if not already followed by numbers
      if (!/\d/.test(result)) {
        result = result.replace(regex, `${value}`)
      }
    }

    // Handle "500k" style expressions
    result = result.replace(/(\d+)\s*k\b/gi, (_, num) => {
      return `${parseInt(num) * 1000}`
    })

    return result
  }

  /**
   * Detect mixed language input (e.g., Swahili-English code-switching)
   */
  detectMixedLanguage(text: string): SupportedLanguage[] {
    const languages = new Set<SupportedLanguage>()
    const lowerText = text.toLowerCase()

    // Check for Swahili
    if (/(nina|tuna|wana|tafuta|duka|bidhaa|bei)/.test(lowerText)) {
      languages.add('sw')
    }

    // Check for English-specific patterns
    if (/(looking for|I want|show me|find|shop|product|price)/.test(lowerText)) {
      languages.add('en')
    }

    // If only one or none detected, assume primary language
    if (languages.size <= 1) {
      languages.add(this.detectLanguage(text))
    }

    return Array.from(languages)
  }

  /**
   * Get language metadata
   */
  getLanguageMeta(language: SupportedLanguage): LanguageMeta {
    return LANGUAGE_META[language]
  }
}
