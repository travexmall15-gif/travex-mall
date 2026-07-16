'use client'
import { LanguageContext, useLanguageState } from '@/lib/useLanguage'

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const lang = useLanguageState()
  return <LanguageContext.Provider value={lang}>{children}</LanguageContext.Provider>
}
