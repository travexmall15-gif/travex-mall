'use client'
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { Lang } from './i18n'
import { isRTL, LANG_META } from './i18n'

const LS_KEY   = 'travex_lang'
const COOKIE   = 'NEXT_LOCALE'

interface Ctx {
  lang:    Lang
  setLang: (l: Lang) => void
  dir:     'ltr' | 'rtl'
  meta:    typeof LANG_META
}

const LangCtx = createContext<Ctx>({
  lang: 'en', setLang: () => {}, dir: 'ltr', meta: LANG_META,
})

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY) as Lang | null
    const valid: Lang[] = ['en','sw','fr','de','pt','ar']
    if (saved && valid.includes(saved)) setLangState(saved)
  }, [])

  useEffect(() => {
    // Apply RTL/LTR to document
    const dir = isRTL(lang) ? 'rtl' : 'ltr'
    document.documentElement.setAttribute('dir', dir)
    document.documentElement.setAttribute('lang', lang)
    // Add Arabic font if needed
    if (lang === 'ar') {
      document.documentElement.style.setProperty('--font-body', "'Cairo', 'Noto Sans Arabic', sans-serif")
    } else {
      document.documentElement.style.setProperty('--font-body', "'Inter', sans-serif")
    }
  }, [lang])

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    localStorage.setItem(LS_KEY, l)
    document.cookie = `${COOKIE}=${l}; path=/; max-age=31536000; SameSite=Lax`
    window.dispatchEvent(new CustomEvent('shopnekt-lang', { detail: l }))
  }, [])

  const dir = isRTL(lang) ? 'rtl' : 'ltr'

  return (
    <LangCtx.Provider value={{ lang, setLang, dir, meta: LANG_META }}>
      {children}
    </LangCtx.Provider>
  )
}

export function useLang() { return useContext(LangCtx) }
