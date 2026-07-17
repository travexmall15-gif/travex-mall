'use client'
import { useTranslations } from 'next-intl'

const LANGS = [
  { code: 'en', flag: '🇬🇧', label: 'English' },
  { code: 'sw', flag: '🇹🇿', label: 'Kiswahili' },
]

export function LangSwitcher() {
  // Read current locale from cookie (client-side)
  const current = typeof document !== 'undefined'
    ? (document.cookie.split('; ').find(r => r.startsWith('NEXT_LOCALE='))?.split('=')[1] || 'en')
    : 'en'

  const switchTo = (code: string) => {
    document.cookie = `NEXT_LOCALE=${code}; path=/; max-age=31536000; SameSite=Lax`
    window.location.reload()
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '2px',
      background: 'rgba(255,255,255,0.08)', borderRadius: '999px',
      padding: '3px', border: '1px solid rgba(255,255,255,0.14)',
    }}>
      {LANGS.map(l => (
        <button
          key={l.code}
          onClick={() => switchTo(l.code)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            padding: '4px 11px', borderRadius: '999px', border: 'none',
            background: current === l.code ? '#C9A84C' : 'transparent',
            color: current === l.code ? '#0F172A' : 'rgba(255,255,255,0.65)',
            fontSize: '0.72rem', fontWeight: current === l.code ? 700 : 500,
            cursor: 'pointer', transition: 'all 0.2s',
            fontFamily: "'Inter', sans-serif", whiteSpace: 'nowrap',
          }}
        >
          <span style={{ fontSize: '0.82rem' }}>{l.flag}</span>
          {l.label}
        </button>
      ))}
    </div>
  )
}
