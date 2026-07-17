// ═══════════════════════════════════════════════════════════
// SHOPNEKT — i18n Core
// ═══════════════════════════════════════════════════════════

import en from '@/locales/en.json'
import sw from '@/locales/sw.json'

export type Lang    = 'en' | 'sw'
export type Locales = typeof en

export const SUPPORTED_LANGS: Lang[] = ['en', 'sw']
export const DEFAULT_LANG: Lang = 'en'

const MESSAGES: Record<Lang, Locales> = { en, sw }

// ── Resolve nested key  e.g. "nav.home" → "Home" ─────────
export function getMsg(lang: Lang, key: string, vars?: Record<string, string | number>): string {
  const parts = key.split('.')
  let obj: any = MESSAGES[lang] ?? MESSAGES[DEFAULT_LANG]
  for (const p of parts) {
    if (obj == null || typeof obj !== 'object') break
    obj = obj[p]
  }
  // Fallback to EN if key missing in SW
  if (obj == null || typeof obj === 'object') {
    obj = MESSAGES['en']
    for (const p of parts) {
      if (obj == null || typeof obj !== 'object') break
      obj = obj[p]
    }
  }
  if (typeof obj !== 'string') return key

  // Replace vars: {count} → "5"
  if (vars) {
    return Object.entries(vars).reduce(
      (s, [k, v]) => s.replaceAll(`{${k}}`, String(v)),
      obj
    )
  }
  return obj
}
