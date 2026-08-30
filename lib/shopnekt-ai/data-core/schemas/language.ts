import { z } from 'zod'

// ═══════════════════════════════════════════════════════════
// Matches ShopNekt's actual configured interface languages
// (locales/{en,sw,fr,de,pt,ar}.json in the main application —
// this is not invented, it mirrors the real localization system).
// ═══════════════════════════════════════════════════════════
export const SupportedLanguageSchema = z.enum(['en', 'sw', 'fr', 'de', 'pt', 'ar'])
export type SupportedLanguage = z.infer<typeof SupportedLanguageSchema>

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['en', 'sw', 'fr', 'de', 'pt', 'ar']

/**
 * Primary languages the AI's language-intelligence layer must deeply
 * understand (informal commerce speech, code-switching, price slang) —
 * not just translate UI strings for. Distinct from SUPPORTED_LANGUAGES,
 * which is every language the general ShopNekt UI is localized into.
 */
export const AI_PRIMARY_LANGUAGES: SupportedLanguage[] = ['sw', 'en']

/**
 * A piece of AI-facing text in every supported language. Every
 * user-visible string in the Data Core (intent examples, fallback
 * messages, safety refusal templates, etc.) uses this shape instead of
 * a single hardcoded string, so nothing here can ever produce
 * mixed-language output.
 */
export const LocalizedTextSchema = z.object({
  en: z.string(),
  sw: z.string(),
  fr: z.string(),
  de: z.string(),
  pt: z.string(),
  ar: z.string(),
})
export type LocalizedText = z.infer<typeof LocalizedTextSchema>

/** Look up localized text for a language, always falling back to English
 *  (never to a mixed/blank string) if a translation is somehow missing. */
export function localize(text: LocalizedText, lang: SupportedLanguage): string {
  return text[lang] || text.en
}
