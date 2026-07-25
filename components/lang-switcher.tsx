'use client'
import { useState, useRef, useEffect } from 'react'
import { useLang } from '@/lib/lang-context'
import { LANG_META, type Lang } from '@/lib/i18n'

const LANGS = Object.entries(LANG_META) as [Lang, typeof LANG_META[Lang]][]

export function LangSwitcher({ compact = false }: { compact?: boolean }) {
  const { lang, setLang, meta } = useLang()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const current = meta[lang]

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Change language"
        style={{
          display: 'flex', alignItems: 'center', gap: '5px',
          padding: compact ? '0' : '7px 14px',
          width: compact ? '38px' : 'auto',
          height: compact ? '38px' : 'auto',
          justifyContent: 'center',
          background: compact ? '#F1F5F9' : 'rgba(255,255,255,0.08)',
          border: compact ? 'none' : '1.5px solid rgba(255,255,255,0.15)',
          borderRadius: compact ? '50%' : '999px',
          cursor: 'pointer',
          color: compact ? '#475569' : '#fff',
          fontSize: compact ? '1rem' : '0.78rem',
          fontWeight: 600,
          fontFamily: 'Inter, sans-serif',
          transition: 'all .2s',
          flexShrink: 0,
        }}
        onMouseOver={e => (e.currentTarget as HTMLElement).style.background = compact ? '#E2E8F0' : 'rgba(255,255,255,0.14)'}
        onMouseOut={e => (e.currentTarget as HTMLElement).style.background = compact ? '#F1F5F9' : 'rgba(255,255,255,0.08)'}
      >
        <span style={{ fontSize: compact ? '0.7rem' : '0.72rem', fontWeight: 800, lineHeight: 1, letterSpacing: '0.04em' }}>{current.flag}</span>
        {!compact && <span>{current.label}</span>}
        {!compact && <span style={{ fontSize: '0.6rem', opacity: 0.6 }}>▾</span>}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)',
          right: 0, zIndex: 999,
          background: '#fff', border: '1.5px solid #E2E8F0',
          borderRadius: '16px', padding: '6px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          minWidth: '170px',
        }}>
          {LANGS.map(([code, m]) => (
            <button
              key={code}
              onClick={() => { setLang(code); setOpen(false) }}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                width: '100%', padding: '9px 12px', border: 'none',
                borderRadius: '10px', cursor: 'pointer',
                background: lang === code ? '#F1F5F9' : 'transparent',
                color: lang === code ? '#0D1B3E' : '#475569',
                fontSize: '0.83rem', fontWeight: lang === code ? 700 : 500,
                fontFamily: 'Inter, sans-serif', textAlign: 'left',
                transition: 'background .15s',
              }}
              onMouseOver={e => { if (lang !== code) (e.currentTarget as HTMLElement).style.background = '#F8FAFC' }}
              onMouseOut={e => { if (lang !== code) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              <span style={{ fontSize: '0.7rem', fontWeight: 800, background: '#F1F5F9', color: '#0D1B3E', padding: '2px 7px', borderRadius: 5, letterSpacing: '0.04em', flexShrink: 0 }}>{m.flag}</span>
              <span>{m.label}</span>
              {lang === code && <span style={{ marginLeft: 'auto', color: '#C9A84C', fontSize: '0.7rem' }}>✓</span>}
              {m.dir === 'rtl' && <span style={{ fontSize: '0.6rem', color: '#94A3B8', marginLeft: 'auto' }}>RTL</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Light version for white backgrounds
export function LangSwitcherLight() {
  const { lang, setLang, meta } = useLang()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '6px 12px',
          background: '#F8FAFC', border: '1.5px solid #E2E8F0',
          borderRadius: '999px', cursor: 'pointer',
          color: '#374151', fontSize: '0.78rem', fontWeight: 600,
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <span style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.04em' }}>{meta[lang].flag}</span>
        <span>{meta[lang].label}</span>
        <span style={{ fontSize: '0.6rem', opacity: 0.5 }}>▾</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)',
          right: 0, zIndex: 999,
          background: '#fff', border: '1.5px solid #E2E8F0',
          borderRadius: '14px', padding: '6px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          minWidth: '160px',
        }}>
          {(Object.entries(LANG_META) as [Lang, typeof LANG_META[Lang]][]).map(([code, m]) => (
            <button key={code} onClick={() => { setLang(code); setOpen(false) }}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                width: '100%', padding: '8px 10px', border: 'none',
                borderRadius: '8px', cursor: 'pointer', textAlign: 'left',
                background: lang === code ? '#F1F5F9' : 'transparent',
                color: '#374151', fontSize: '0.82rem',
                fontWeight: lang === code ? 700 : 400,
                fontFamily: 'Inter, sans-serif',
              }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, background: '#F1F5F9', color: '#0D1B3E', padding: '2px 6px', borderRadius: 4, letterSpacing: '0.04em', flexShrink: 0 }}>{m.flag}</span>
              <span>{m.label}</span>
              {lang === code && <span style={{ marginLeft: 'auto', color: '#C9A84C' }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
