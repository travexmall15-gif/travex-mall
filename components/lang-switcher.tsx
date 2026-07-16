'use client'
import { useLocale } from '@/lib/useLocale'
import type { Locale } from '@/i18n'

const LANGUAGES: { code: Locale; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'sw', label: 'Kiswahili', flag: '🇹🇿' },
]

export function LangSwitcher() {
  const { locale, setLocale } = useLocale()

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', padding: '3px', border: '1px solid rgba(255,255,255,0.12)' }}>
      {LANGUAGES.map(lang => (
        <button
          key={lang.code}
          onClick={() => setLocale(lang.code)}
          title={lang.label}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            padding: '4px 10px', borderRadius: '999px', border: 'none',
            background: locale === lang.code ? '#C9A84C' : 'transparent',
            color: locale === lang.code ? '#0F172A' : 'rgba(255,255,255,0.65)',
            fontSize: '0.72rem', fontWeight: locale === lang.code ? 700 : 500,
            cursor: 'pointer', transition: 'all 0.2s',
            fontFamily: "'Inter', sans-serif", letterSpacing: '0.02em',
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
