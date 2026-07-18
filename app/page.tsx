'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SplashPage() {
  const router = useRouter()
  const [fade, setFade] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setFade(true), 1800)
    const t2 = setTimeout(() => router.replace('/home'), 2400)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [router])

  return (
    <div style={{ position:'fixed',inset:0,background:'#080F37',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',transition:'opacity 0.6s ease',opacity:fade?0:1 }}>
      <style>{`
        @keyframes logoIn  { from{opacity:0;transform:scale(0.75)} to{opacity:1;transform:scale(1)} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes lineGrow{ from{width:0;opacity:0} to{width:clamp(80px,12vw,120px);opacity:1} }
        .sp-logo { width:clamp(72px,10vw,110px);height:clamp(72px,10vw,110px);border-radius:22px;object-fit:cover;animation:logoIn 0.65s cubic-bezier(0.34,1.56,0.64,1) forwards;margin-bottom:clamp(16px,2.5vw,28px) }
        .sp-line { height:2px;background:linear-gradient(90deg,transparent,#F97316,transparent);animation:lineGrow 0.5s ease 1.1s both;margin:10px 0 }
      `}</style>

      {/* App Icon */}
      <img src="/icon-192.png" alt="ShopNekt" className="sp-logo" />

      {/* shopNekt wordmark — small letters */}
      <div style={{ animation:'fadeUp 0.5s ease 0.5s both' }}>
        <span style={{
          fontFamily:"'Inter',sans-serif",
          fontSize:'clamp(1.6rem,5vw,3rem)',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          color: '#fff',
        }}>
          shop
        </span>
        <span style={{
          fontFamily:"'Inter',sans-serif",
          fontSize:'clamp(1.6rem,5vw,3rem)',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          color: '#F97316',
        }}>
          nekt
        </span>
      </div>

      {/* Line */}
      <div className="sp-line" />

      {/* Tagline */}
      <p style={{
        fontFamily:"'Inter',sans-serif",
        fontSize:'clamp(0.48rem,1.1vw,0.65rem)',
        color:'rgba(255,255,255,0.32)',
        letterSpacing:'0.22em',
        textTransform:'uppercase',
        margin: '0',
        animation:'fadeUp 0.5s ease 1.25s both',
      }}>
        shop more. save more. live better.
      </p>

      {/* from QNEX360 */}
      <p style={{
        fontFamily:"'Inter',sans-serif",
        fontSize:'clamp(0.45rem,0.9vw,0.58rem)',
        color:'rgba(255,255,255,0.18)',
        letterSpacing:'0.20em',
        textTransform:'uppercase',
        marginTop:'8px',
        animation:'fadeUp 0.5s ease 1.45s both',
      }}>
        from qnex360
      </p>
    </div>
  )
}
