'use client'
import { useLang } from '@/lib/lang-context'
import { TX } from '@/lib/translations'

interface Props { en: string; sw: string }

export function T({ en, sw }: Props) {
  const { lang } = useLang()
  return <>{lang === 'sw' ? sw : en}</>
}

// Quick helper for non-JSX contexts (placeholder, title, etc.)
export function useT() {
  const { lang } = useLang()
  return (en: string): string => {
    if (lang === 'en') return en
    return TX[en]?.[lang] ?? en
  }
}
