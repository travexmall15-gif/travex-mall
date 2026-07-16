'use server'
import { cookies } from 'next/headers'
import type { Locale } from '@/i18n'

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  return (cookieStore.get('NEXT_LOCALE')?.value || 'en') as Locale
}
