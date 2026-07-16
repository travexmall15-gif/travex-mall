'use client'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

export function LangSwitcher() {
  const locale = useLocale()
  const t = useTranslations('langSwitcher')
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const switchLocale = (next: string) => {
    // Set cookie
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000; SameSite=Lax`
    // Refresh to apply new locale server-side
    startTransition(() => {
      router.refresh()
    })
  }

  const languages = [
    { code: 'en', flag: '🇬🇧', label: t('en') },
    { code: 'sw', flag: '🇹🇿', label: t('sw') },
  ]

  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: '2px',
        background: 'rgba(255,255,255,0.08)',
        borderRadius: '999px', padding: '3px',
        border: '1px solid rgba(255,255,255,0.12)',
        opacity: isPending ? 0.6 : 1,
        transition: 'opacity 0.2s',
      }}
    >
      {languages.map(lang => (
        <button
          key={lang.code}
          onClick={() => switchLocale(lang.code)}
          disabled={isPending}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            padding: '4px 11px', borderRadius: '999px', border: 'none',
            background: locale === lang.code ? '#C9A84C' : 'transparent',
            color: locale === lang.code ? '#0F172A' : 'rgba(255,255,255,0.65)',
            fontSize: '0.72rem',
            fontWeight: locale === lang.code ? 700 : 500,
            cursor: isPending ? 'wait' : 'pointer',
            transition: 'all 0.2s',
            fontFamily: "'Inter', sans-serif",
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ fontSize: '0.85rem' }}>{lang.flag}</span>
          {lang.label}
        </button>
      ))}
    </div>
  )
}
