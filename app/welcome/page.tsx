'use client'
import { useRouter } from 'next/navigation'
import { useLang } from '@/lib/lang-context'
import type { Lang } from '@/lib/i18n'

const LANGS: { code: Lang; flag: string; native: string; sub: string }[] = [
  { code:'en', flag:'🇬🇧', native:'English',    sub:'English' },
  { code:'sw', flag:'🇹🇿', native:'Kiswahili',  sub:'Swahili' },
  { code:'fr', flag:'🇫🇷', native:'Français',   sub:'French' },
  { code:'de', flag:'🇩🇪', native:'Deutsch',    sub:'German' },
  { code:'pt', flag:'🇵🇹', native:'Português',  sub:'Portuguese' },
  { code:'ar', flag:'🇸🇦', native:'العربية',    sub:'Arabic' },
]

export default function WelcomePage() {
  const router   = useRouter()
  const { lang, setLang } = useLang()

  const choose = (code: Lang) => {
    setLang(code)
    localStorage.setItem('sn_welcomed', 'true')
    router.replace('/auth')
  }

  return (
    <div style={{
      minHeight:'100dvh',
      background:'linear-gradient(160deg,#06091F 0%,#080F37 55%,#0A1545 100%)',
      display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
      fontFamily:"'Inter',sans-serif",
      padding:'2rem 1.25rem',
    }}>
      <style>{`
        @keyframes fadeUp {from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)}}
        .wl-card { animation: fadeUp 0.4s ease both }
        .wl-card:hover { transform:translateY(-3px) scale(1.02) !important; box-shadow:0 12px 32px rgba(201,168,76,0.22) !important; }
        .wl-card:active { transform:scale(0.97) !important }
      `}</style>

      {/* Header */}
      <div style={{ textAlign:'center', marginBottom:'2.5rem', animation:'fadeUp 0.5s ease 0.1s both' }}>
        <div style={{ fontSize:'0.64rem', color:'rgba(255,255,255,0.30)', letterSpacing:'0.20em', textTransform:'uppercase', marginBottom:12 }}>
          ShopNekt · QNEX360
        </div>
        <h1 style={{ fontSize:'1.5rem', fontWeight:900, color:'#fff', letterSpacing:'-0.02em', margin:'0 0 8px' }}>
          Select Language
        </h1>
        <p style={{ fontSize:'0.8rem', color:'rgba(255,255,255,0.38)', margin:0 }}>
          Chagua lugha yako / Choose your language
        </p>
      </div>

      {/* Language grid */}
      <div style={{
        display:'grid',
        gridTemplateColumns:'1fr 1fr',
        gap:'0.75rem',
        width:'100%', maxWidth:360,
      }}>
        {LANGS.map((l, i) => (
          <button
            key={l.code}
            className="wl-card"
            onClick={() => choose(l.code)}
            style={{
              animationDelay:`${i * 0.07 + 0.2}s`,
              background: lang === l.code
                ? 'rgba(201,168,76,0.15)'
                : 'rgba(255,255,255,0.05)',
              border: lang === l.code
                ? '2px solid rgba(201,168,76,0.70)'
                : '1.5px solid rgba(255,255,255,0.10)',
              borderRadius:18,
              padding:'1.1rem 0.75rem',
              cursor:'pointer',
              fontFamily:"'Inter',sans-serif",
              transition:'all 0.22s',
              display:'flex', flexDirection:'column',
              alignItems:'center', gap:8,
            }}
          >
            <span style={{ fontSize:'2rem', lineHeight:1 }}>{l.flag}</span>
            <div>
              <div style={{ fontSize:'0.9rem', fontWeight:800, color:'#fff', lineHeight:1.2 }}>{l.native}</div>
              <div style={{ fontSize:'0.62rem', color:'rgba(255,255,255,0.38)', marginTop:2 }}>{l.sub}</div>
            </div>
            {lang === l.code && (
              <div style={{ width:6, height:6, borderRadius:'50%', background:'#C9A84C', marginTop:2 }} />
            )}
          </button>
        ))}
      </div>

      {/* Continue button */}
      <button
        onClick={() => choose(lang)}
        style={{
          marginTop:'2rem',
          background:'linear-gradient(135deg,#C9A84C,#E8BF6A)',
          color:'#05091E',
          border:'none',
          borderRadius:999,
          padding:'0 52px',
          height:50,
          fontSize:'0.95rem',
          fontWeight:900,
          fontFamily:"'Inter',sans-serif",
          letterSpacing:'0.06em',
          cursor:'pointer',
          boxShadow:'0 8px 28px rgba(201,168,76,0.40)',
          animation:'fadeUp 0.5s ease 0.75s both',
          transition:'box-shadow 0.2s, transform 0.15s',
        }}
        onMouseOver={e=>(e.currentTarget as HTMLElement).style.boxShadow='0 12px 36px rgba(201,168,76,0.60)'}
        onMouseOut={e=>(e.currentTarget as HTMLElement).style.boxShadow='0 8px 28px rgba(201,168,76,0.40)'}
      >
        Continue →
      </button>
    </div>
  )
}
