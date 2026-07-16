'use client'
import { useState, useEffect } from 'react'

type Props = { en: string; sw: string }

export function T({ en, sw }: Props) {
  const [lang, setLang] = useState<'en'|'sw'>('en')

  useEffect(() => {
    const saved = (localStorage.getItem('travex_lang') || 'en') as 'en'|'sw'
    setLang(saved)
    const handler = (e: Event) => setLang((e as CustomEvent).detail)
    window.addEventListener('travex-lang-change', handler)
    return () => window.removeEventListener('travex-lang-change', handler)
  }, [])

  return <>{lang === 'sw' ? sw : en}</>
}
