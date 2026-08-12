'use client'
import { useRouter } from 'next/navigation'
import { useLang } from '@/lib/lang-context'
import type { Lang } from '@/lib/i18n'

const LANGS: { code: Lang; label: string; sub: string }[] = [
  { code:'en', label:'English',   sub:'EN' },
  { code:'sw', label:'Kiswahili', sub:'SW' },
  { code:'fr', label:'Français',  sub:'FR' },
  { code:'de', label:'Deutsch',   sub:'DE' },
  { code:'pt', label:'Português', sub:'PT' },
  { code:'ar', label:'العربية',   sub:'AR' },
]

export default function WelcomePage() {
  const router = useRouter()
  const { lang, setLang } = useLang()

  const choose = (code: Lang) => {
    setLang(code)
    localStorage.setItem('sn_welcomed', 'true')
    router.replace('/auth')
  }

  return (
    <div style={{
      minHeight:'100dvh',
      background:'#F8FAFF',
      display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
      fontFamily:"'Inter',sans-serif",
      padding:'2rem 1.5rem',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .lang-card { animation: fadeUp 0.35s ease both; transition: all 0.2s; }
        .lang-card:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(13,27,62,0.10) !important; }
        .lang-card:active { transform: scale(0.97); }
      `}</style>

      {/* Logo + heading */}
      <div style={{ textAlign:'center', marginBottom:'2.5rem', animation:'fadeUp 0.4s ease 0.1s both' }}>
        <div style={{ display:'flex', alignItems:'baseline', justifyContent:'center', gap:1, marginBottom:10 }}>
          <span style={{ fontSize:'1.6rem', fontWeight:900, color:'#0D1B3E', letterSpacing:'-0.04em' }}>Shop</span>
          <span style={{ fontSize:'1.6rem', fontWeight:900, color:'#F97316', letterSpacing:'-0.04em' }}>Nekt</span>
        </div>
        <h1 style={{ fontSize:'1.35rem', fontWeight:800, color:'#0D1B3E', margin:'0 0 6px', letterSpacing:'-0.02em' }}>
          Choose your language
        </h1>
        <p style={{ fontSize:'0.8rem', color:'#9CA3AF', margin:0 }}>
          Select to continue
        </p>
      </div>

      {/* Language grid */}
      <div style={{
        display:'grid',
        gridTemplateColumns:'1fr 1fr',
        gap:'0.75rem',
        width:'100%', maxWidth:360,
        marginBottom:'1.5rem',
      }}>
        {LANGS.map((l, i) => (
          <button
            key={l.code}
            className="lang-card"
            onClick={() => choose(l.code)}
            style={{
              animationDelay:`${i * 0.06 + 0.15}s`,
              background: lang === l.code ? '#0D1B3E' : '#fff',
              border: lang === l.code
                ? '2px solid #0D1B3E'
                : '2px solid #E2E8F0',
              borderRadius:16,
              padding:'1.1rem 0.75rem',
              cursor:'pointer',
              fontFamily:"'Inter',sans-serif",
              boxShadow:'0 2px 8px rgba(13,27,62,0.06)',
              display:'flex', flexDirection:'column',
              alignItems:'center', gap:6,
            }}
          >
            <div style={{
              width:36, height:36, borderRadius:10,
              background: lang === l.code ? 'rgba(255,255,255,0.12)' : '#F3F4F6',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <span style={{
                fontSize:'0.72rem', fontWeight:800,
                color: lang === l.code ? '#1D4ED8' : '#64748B',
                letterSpacing:'0.08em',
              }}>{l.sub}</span>
            </div>
            <div style={{
              fontSize:'0.88rem', fontWeight:700,
              color: lang === l.code ? '#fff' : '#0D1B3E',
              lineHeight:1.2,
            }}>{l.label}</div>
            {lang === l.code && (
              <div style={{ width:5, height:5, borderRadius:'50%', background:'#1D4ED8' }} />
            )}
          </button>
        ))}
      </div>

      {/* Continue button */}
      <button
        onClick={() => choose(lang)}
        style={{
          width:'100%', maxWidth:360,
          background:'#fff',
          color:'#111827',
          border:'none',
          borderRadius:999,
          padding:'0.875rem',
          fontSize:'0.92rem',
          fontWeight:700,
          fontFamily:"'Inter',sans-serif",
          cursor:'pointer',
          letterSpacing:'0.02em',
          boxShadow:'0 6px 20px rgba(13,27,62,0.22)',
          animation:'fadeUp 0.4s ease 0.55s both',
          transition:'all 0.2s',
        }}
        onMouseOver={e => (e.currentTarget as HTMLElement).style.background='#1B3A8A'}
        onMouseOut={e  => (e.currentTarget as HTMLElement).style.background='#0D1B3E'}
      >
        Continue →
      </button>
    </div>
  )
}
