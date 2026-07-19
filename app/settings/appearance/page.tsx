'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SiteNav } from '@/components/site-nav'
import { useLang } from '@/lib/lang-context'
import { ArrowLeft, Sun, Moon, Monitor, Check } from 'lucide-react'

export default function AppearancePage() {
  const router = useRouter()
  const { lang, setLang } = useLang()
  const [fontSize, setFontSize] = useState<'small'|'medium'|'large'>('medium')
  const [theme,    setTheme]    = useState<'light'|'dark'|'system'>('light')
  const [saved,    setSaved]    = useState(false)

  useEffect(() => {
    try {
      const p = JSON.parse(localStorage.getItem('sn_appearance') || '{}')
      if (p.fontSize) setFontSize(p.fontSize)
      if (p.theme)    setTheme(p.theme)
    } catch {}
  }, [])

  const save = () => {
    localStorage.setItem('sn_appearance', JSON.stringify({ fontSize, theme }))
    // Apply font size
    const sizes = { small: '14px', medium: '16px', large: '18px' }
    document.documentElement.style.fontSize = sizes[fontSize]
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <main style={{ minHeight:'100vh', background:'#F8FAFF', paddingTop:108, fontFamily:"'Inter',sans-serif" }}>
      <SiteNav />
      <div style={{ maxWidth:480, margin:'0 auto', padding:'1.5rem 5% 4rem' }}>
        <button onClick={() => router.back()} style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', cursor:'pointer', color:'#64748B', fontSize:'0.82rem', fontWeight:600, fontFamily:"'Inter',sans-serif", marginBottom:'1.5rem', padding:0 }}>
          <ArrowLeft size={15} /> Back
        </button>
        <h1 style={{ fontSize:'1.25rem', fontWeight:800, color:'#0D1B3E', marginBottom:'1.5rem', letterSpacing:'-0.025em' }}>Appearance</h1>

        {/* Language */}
        <div style={{ marginBottom:'1.25rem' }}>
          <p style={{ fontSize:'0.65rem', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:8 }}>Language</p>
          <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #E2E8F0', overflow:'hidden' }}>
            {[{code:'en',flag:'🇬🇧',label:'English'},{code:'sw',flag:'🇹🇿',label:'Kiswahili'}].map((l,i) => (
              <button key={l.code} onClick={() => setLang(l.code as 'en'|'sw')}
                style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', background:'none', border:'none', borderBottom: i===0 ? '1px solid #F1F5F9' : 'none', cursor:'pointer', fontFamily:"'Inter',sans-serif" }}>
                <span style={{ fontSize:'0.9rem', fontWeight:600, color:'#0F172A' }}>{l.flag} {l.label}</span>
                {lang === l.code && <Check size={16} color="#0D1B3E" strokeWidth={2.5} />}
              </button>
            ))}
          </div>
        </div>

        {/* Theme */}
        <div style={{ marginBottom:'1.25rem' }}>
          <p style={{ fontSize:'0.65rem', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:8 }}>Theme</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
            {[{v:'light',icon:Sun,label:'Light'},{v:'dark',icon:Moon,label:'Dark'},{v:'system',icon:Monitor,label:'System'}].map(t => (
              <button key={t.v} onClick={() => setTheme(t.v as any)}
                style={{ padding:'16px 8px', background: theme===t.v ? '#0D1B3E' : '#fff', border:`1.5px solid ${theme===t.v?'#0D1B3E':'#E2E8F0'}`, borderRadius:14, cursor:'pointer', fontFamily:"'Inter',sans-serif", display:'flex', flexDirection:'column', alignItems:'center', gap:8, transition:'all .2s' }}>
                <t.icon size={20} color={theme===t.v?'#C9A84C':'#64748B'} />
                <span style={{ fontSize:'0.78rem', fontWeight:700, color: theme===t.v?'#fff':'#64748B' }}>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Font size */}
        <div style={{ marginBottom:'1.5rem' }}>
          <p style={{ fontSize:'0.65rem', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:8 }}>Font Size</p>
          <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #E2E8F0', overflow:'hidden' }}>
            {[{v:'small',label:'Small',size:'0.82rem'},{v:'medium',label:'Medium',size:'0.9rem'},{v:'large',label:'Large',size:'1rem'}].map((f,i) => (
              <button key={f.v} onClick={() => setFontSize(f.v as any)}
                style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 16px', background:'none', border:'none', borderBottom: i<2 ? '1px solid #F1F5F9' : 'none', cursor:'pointer', fontFamily:"'Inter',sans-serif" }}>
                <span style={{ fontSize: f.size, fontWeight:600, color:'#0F172A' }}>{f.label}</span>
                {fontSize === f.v && <Check size={16} color="#0D1B3E" strokeWidth={2.5} />}
              </button>
            ))}
          </div>
        </div>

        <button onClick={save}
          style={{ width:'100%', padding:'0.875rem', background: saved ? '#059669' : '#0D1B3E', color:'#fff', border:'none', borderRadius:14, fontFamily:"'Inter',sans-serif", fontWeight:700, fontSize:'0.9rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'all .2s' }}>
          {saved ? <><Check size={16} /> Saved!</> : 'Save Preferences'}
        </button>
      </div>
    </main>
  )
}
