'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { sb } from '@/lib/supabase'
import Image from 'next/image'

export default function SplashPage() {
  const router = useRouter()

  const handleEnter = async () => {
    const { data: { session } } = await sb.auth.getSession()
    if (session) {
      // Returning user → home directly
      router.replace('/home')
      return
    }
    const welcomed = localStorage.getItem('sn_welcomed')
    if (!welcomed) {
      router.push('/welcome')
    } else {
      router.push('/auth')
    }
  }

  // Auto-trigger after 3s if user doesn't tap
  useEffect(() => {
    const t = setTimeout(handleEnter, 3200)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{
      position:'fixed', inset:0,
      background:'linear-gradient(160deg,#06091F 0%,#080F37 55%,#0A1545 100%)',
      display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
      fontFamily:"'Inter',sans-serif", overflow:'hidden',
    }}>
      <style>{`
        @keyframes logoIn  {from{opacity:0;transform:scale(0.78)} to{opacity:1;transform:scale(1)}}
        @keyframes fadeUp  {from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)}}
        @keyframes fadeUp2 {from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)}}
        @keyframes btnIn   {from{opacity:0;transform:translateY(28px) scale(0.95)} to{opacity:1;transform:translateY(0) scale(1)}}
        .sp-logo { animation: logoIn 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.2s both }
        .sp-brand{ animation: fadeUp 0.6s ease 0.85s both }
        .sp-sub  { animation: fadeUp2 0.5s ease 1.1s both }
        .sp-btn  { animation: btnIn 0.6s cubic-bezier(0.34,1.56,0.64,1) 1.3s both }
        .sp-btn:active { transform: scale(0.97) !important }
      `}</style>

      {/* ── Logo ── */}
      <div className="sp-logo">
        <Image
          src="/sn-logo.png"
          alt="ShopNekt"
          width={96}
          height={96}
          priority
          style={{ borderRadius:22, objectFit:'contain', display:'block' }}
        />
      </div>

      {/* ── Brand wordmark — Instagram-style ── */}
      <div className="sp-brand" style={{ marginTop:22, display:'flex', alignItems:'baseline', gap:1 }}>
        <span style={{ fontSize:'2.1rem', fontWeight:900, color:'#fff', letterSpacing:'-0.04em', lineHeight:1 }}>
          Shop
        </span>
        <span style={{ fontSize:'2.1rem', fontWeight:900, color:'#F97316', letterSpacing:'-0.04em', lineHeight:1 }}>
          Nekt
        </span>
      </div>

      {/* ── Tagline ── */}
      <p className="sp-sub" style={{
        fontSize:'0.64rem', color:'rgba(255,255,255,0.28)',
        letterSpacing:'0.22em', textTransform:'uppercase',
        marginTop:10, marginBottom:0,
      }}>
        The Global Digital Marketplace
      </p>

      {/* ── QNEX360 — plain white text at very bottom ── */}
      <div
        className="sp-btn"
        onClick={handleEnter}
        style={{
          position:'absolute', bottom:'clamp(24px,5vh,40px)',
          cursor:'pointer',
          userSelect:'none',
        }}
      >
        <span style={{
          fontFamily:"'Inter',sans-serif",
          fontSize:'0.85rem',
          fontWeight:700,
          color:'rgba(255,255,255,0.85)',
          letterSpacing:'0.20em',
        }}>
          QNEX360
        </span>
      </div>
    </div>
  )
}
