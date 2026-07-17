'use client'
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { Lang } from './i18n'

const LS_KEY = 'travex_lang'
const COOKIE  = 'NEXT_LOCALE'

interface Ctx { lang: Lang; setLang: (l: Lang) => void; toggle: () => void }
const LangCtx = createContext<Ctx>({ lang: 'en', setLang: () => {}, toggle: () => {} })

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY) as Lang | null
    if (saved === 'sw') setLangState('sw')
  }, [])

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    localStorage.setItem(LS_KEY, l)
    document.cookie = `${COOKIE}=${l}; path=/; max-age=31536000; SameSite=Lax`
    window.dispatchEvent(new CustomEvent('travex-lang', { detail: l }))
  }, [])

  const toggle = useCallback(() => {
    setLang(lang === 'en' ? 'sw' : 'en')
  }, [lang, setLang])

  return <LangCtx.Provider value={{ lang, setLang, toggle }}>{children}</LangCtx.Provider>
}

export const useLang = () => useContext(LangCtx)
