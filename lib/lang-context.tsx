'use client'
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import type { Lang } from './translations'

interface LangCtx { lang: Lang; toggle: () => void; setLang: (l: Lang) => void }
const Ctx = createContext<LangCtx>({ lang: 'en', toggle: () => {}, setLang: () => {} })

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    const saved = localStorage.getItem('travex_lang') as Lang | null
    if (saved === 'sw') setLangState('sw')
  }, [])

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    localStorage.setItem('travex_lang', l)
    // Also set cookie so next-intl server side reads it (fallback)
    document.cookie = `NEXT_LOCALE=${l}; path=/; max-age=31536000; SameSite=Lax`
    // Dispatch event for dashboard HTML pages
    window.dispatchEvent(new CustomEvent('travex-lang-change', { detail: l }))
  }, [])

  const toggle = useCallback(() => {
    setLang(lang === 'en' ? 'sw' : 'en')
  }, [lang, setLang])

  return <Ctx.Provider value={{ lang, toggle, setLang }}>{children}</Ctx.Provider>
}

export const useLang = () => useContext(Ctx)
