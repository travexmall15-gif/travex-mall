'use client'
import { useLang } from '@/lib/lang-context'
import { getMsg } from '@/lib/i18n'

export function useTranslation() {
  const { lang } = useLang()
  const t = (key: string, vars?: Record<string, string | number>): string =>
    getMsg(lang, key, vars)
  return { t, lang }
}
