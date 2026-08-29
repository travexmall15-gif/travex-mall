'use client'
import { useState, useEffect, useCallback } from 'react'
import type { Locale } from '@/i18n'

export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>('en')

  useEffect(() => {
    const stored = document.cookie
      .split('; ')
      .find(r => r.startsWith('NEXT_LOCALE='))
      ?.split('=')[1] as Locale | undefined
    if (stored) {setLocaleState(stored)}
  }, [])

  const setLocale = useCallback((newLocale: Locale) => {
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`
    setLocaleState(newLocale)
    window.location.reload()
  }, [])

  return { locale, setLocale }
}
