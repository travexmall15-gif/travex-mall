'use client'
import { useLanguage } from '@/lib/useLanguage'

export function LangToggle() {
  const { lang, toggle } = useLanguage()
  return (
    <button
      onClick={toggle}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        background: 'var(--sn-bg)', border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '999px', padding: '4px 12px',
        fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
        color: 'var(--sn-text)', fontFamily: 'var(--sn-font)', transition: 'all 0.2s',
        letterSpacing: '0.04em',
      }}
      onMouseOver={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.14)'}
      onMouseOut={e => (e.currentTarget as HTMLElement).style.background = 'var(--sn-border)'}
      title={lang === 'en' ? 'Switch to Kiswahili' : 'Switch to English'}
    >
      <span style={{ fontSize: '0.85rem' }}>{lang === 'en' ? '🇹🇿' : '🇬🇧'}</span>
      {lang === 'en' ? 'SW' : 'EN'}
    </button>
  )
}
