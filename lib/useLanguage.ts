'use client'
import { useState, useEffect, createContext, useContext } from 'react'
import type { Lang } from './i18n'

export const LanguageContext = createContext<{
  lang: Lang
  setLang: (l: Lang) => void
  toggle: () => void
}>({ lang: 'en', setLang: () => {}, toggle: () => {} })

export function useLanguage() {
  return useContext(LanguageContext)
}

export function useLanguageState(): { lang: Lang; setLang: (l: Lang) => void; toggle: () => void } {
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    const saved = (localStorage.getItem('travex_lang') || 'en') as Lang
    setLangState(saved)
  }, [])

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem('travex_lang', l)
  }

  const toggle = () => setLang(lang === 'en' ? 'sw' : 'en')

  return { lang, setLang, toggle }
}
