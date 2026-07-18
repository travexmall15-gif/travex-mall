'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SiteNav } from '@/components/site-nav'
import { useLang } from '@/lib/lang-context'
import { ArrowLeft, Sun, Moon, Monitor, Type } from 'lucide-react'

export default function AppearancePage() {
  const router = useRouter()
  const { lang, setLang } = useLang()
  const [theme,    setTheme]    = useState<'light'|'dark'|'system'>('light')
  const [fontSize, setFontSize] = useState<'small'|'medium'|'large'>('medium')

  return (
    <main style={{ minHeight: '100vh', background: '#F8FAFF', paddingTop: '108px', fontFamily: "'Inter',sans-serif" }}>
      <SiteNav />
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '1.5rem 5% 4rem' }}>
        <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', fontSize: '0.82rem', fontWeight: 600, fontFamily: "'Inter',sans-serif", marginBottom: '1.5rem', padding: 0 }}>
          <ArrowLeft size={15} /> Back
        </button>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0D1B3E', marginBottom: '1.75rem', letterSpacing: '-0.025em' }}>Appearance & Language</h1>

        {/* Language */}
        <div style={{ marginBottom: '1.25rem' }}>
          <p style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 8 }}>Language</p>
          <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E2E8F0', overflow: 'hidden' }}>
            {[{code:'en',label:'🇬🇧 English'},{code:'sw',label:'🇹🇿 Kiswahili'}].map((l,i) => (
              <button key={l.code} onClick={() => setLang(l.code as 'en'|'sw')}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', background: 'none', border: 'none', borderBottom: i === 0 ? '1px solid #F1F5F9' : 'none', cursor: 'pointer', fontFamily: "'Inter',sans-serif" }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0F172A' }}>{l.label}</span>
                {lang === l.code && <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#0D1B3E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#C9A84C' }} />
                </div>}
              </button>
            ))}
          </div>
        </div>

        {/* Theme */}
        <div style={{ marginBottom: '1.25rem' }}>
          <p style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 8 }}>Theme</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
            {[{val:'light',icon:Sun,label:'Light'},{val:'dark',icon:Moon,label:'Dark'},{val:'system',icon:Monitor,label:'System'}].map(t => (
              <button key={t.val} onClick={() => setTheme(t.val as any)}
                style={{ padding: '14px 8px', background: theme === t.val ? '#0D1B3E' : '#fff', border: `1.5px solid ${theme===t.val?'#0D1B3E':'#E2E8F0'}`, borderRadius: 12, cursor: 'pointer', fontFamily: "'Inter',sans-serif", display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, transition: 'all 0.2s' }}>
                <t.icon size={18} color={theme===t.val?'#C9A84C':'#64748B'} />
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: theme===t.val?'#fff':'#64748B' }}>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Font size */}
        <div>
          <p style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 8 }}>Font Size</p>
          <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E2E8F0', overflow: 'hidden' }}>
            {[{val:'small',label:'Small'},{val:'medium',label:'Medium'},{val:'large',label:'Large'}].map((f,i) => (
              <button key={f.val} onClick={() => setFontSize(f.val as any)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'none', border: 'none', borderBottom: i < 2 ? '1px solid #F1F5F9' : 'none', cursor: 'pointer', fontFamily: "'Inter',sans-serif" }}>
                <span style={{ fontSize: f.val==='small'?'0.8rem':f.val==='large'?'1rem':'0.875rem', fontWeight: 600, color: '#0F172A' }}>{f.label}</span>
                {fontSize === f.val && <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#0D1B3E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#C9A84C' }} />
                </div>}
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
