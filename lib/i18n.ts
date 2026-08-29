// ═══════════════════════════════════════════════════════════
// SHOPNEKT — Professional i18n Core (6 Languages)
// ═══════════════════════════════════════════════════════════

import en from '@/locales/en.json'
import sw from '@/locales/sw.json'
import fr from '@/locales/fr.json'
import de from '@/locales/de.json'
import pt from '@/locales/pt.json'
import ar from '@/locales/ar.json'

export type Lang = 'en' | 'sw' | 'fr' | 'de' | 'pt' | 'ar'
export type Locales = typeof en

export const SUPPORTED_LANGS: Lang[] = ['en', 'sw', 'fr', 'de', 'pt', 'ar']
export const DEFAULT_LANG: Lang = 'en'
export const RTL_LANGS: Lang[] = ['ar']

export const LANG_META: Record<Lang, { label: string; flag: string; dir: 'ltr' | 'rtl' }> = {
  en: { label: 'English',    flag: 'EN', dir: 'ltr' },
  sw: { label: 'Kiswahili',  flag: 'SW', dir: 'ltr' },
  fr: { label: 'Français',   flag: 'FR', dir: 'ltr' },
  de: { label: 'Deutsch',    flag: 'DE', dir: 'ltr' },
  pt: { label: 'Português',  flag: 'PT', dir: 'ltr' },
  ar: { label: 'العربية',    flag: 'AR', dir: 'rtl' },
}

export function isRTL(lang: Lang): boolean {
  return RTL_LANGS.includes(lang)
}

const MESSAGES: Record<Lang, Locales> = { en, sw: sw as any, fr: fr as any, de: de as any, pt: pt as any, ar: ar as any }

// ── Resolve nested key  e.g. "nav.home" → "Home" ─────────
export function getMsg(lang: Lang, key: string, vars?: Record<string, string | number>): string {
  const parts = key.split('.')
  let obj: any = MESSAGES[lang] ?? MESSAGES[DEFAULT_LANG]
  for (const p of parts) {
    if (obj == null || typeof obj !== 'object') {break}
    obj = obj[p]
  }
  // Fallback chain: current lang → EN
  if (obj == null || typeof obj === 'object') {
    obj = MESSAGES['en']
    for (const p of parts) {
      if (obj == null || typeof obj !== 'object') {break}
      obj = obj[p]
    }
  }
  if (typeof obj !== 'string') {return key}

  // Variable interpolation: {count}, {name}
  if (vars) {
    return obj.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`))
  }
  return obj
}
