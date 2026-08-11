'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function SplashPage() {
  const router = useRouter()
  const [isReturning, setIsReturning] = useState(false)

  useEffect(() => {
    const sellerRaw = localStorage.getItem('travex_session')
    if (sellerRaw) {
      try {
        const sess = JSON.parse(sellerRaw)
        if (sess?.id) { router.replace('/home'); return }
      } catch {}
    }

    const customerRaw = localStorage.getItem('sn_customer_session')
    if (customerRaw) {
      try {
        const sess = JSON.parse(customerRaw)
        if (sess?.id) {
          setIsReturning(true)
          setTimeout(() => router.replace('/home'), 1800)
          return
        }
      } catch {}
    }

    const t = setTimeout(() => {
      const welcomed = localStorage.getItem('sn_welcomed')
      if (!welcomed) router.push('/welcome')
      else router.push('/auth')
    }, 2000)
    return () => clearTimeout(t)
  }, [router])

  const handleEnter = () => {
    const sellerRaw = localStorage.getItem('travex_session')
    if (sellerRaw) {
      try { if (JSON.parse(sellerRaw)?.id) { router.replace('/home'); return } } catch {}
    }
    const customerRaw = localStorage.getItem('sn_customer_session')
    if (customerRaw) {
      try { if (JSON.parse(customerRaw)?.id) { router.replace('/home'); return } } catch {}
    }
    const welcomed = localStorage.getItem('sn_welcomed')
    if (!welcomed) router.push('/welcome')
    else router.push('/auth')
  }

  return (
    <div style={{
      position:'fixed', inset:0,
      background:'linear-gradient(160deg,#06091F 0%,#080F37 55%,#0A1545 100%)',
      display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
      fontFamily:"'Inter',sans-serif", overflow:'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        @keyframes logoIn  {from{opacity:0;transform:scale(0.78)} to{opacity:1;transform:scale(1)}}
        @keyframes fadeUp  {from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)}}
        @keyframes fadeUp2 {from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)}}
        @keyframes btnIn   {from{opacity:0;transform:translateY(28px) scale(0.95)} to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes dotPulse {0%,80%,100%{transform:scale(0.6);opacity:0.3} 40%{transform:scale(1);opacity:1}}
        .sp-logo { animation: logoIn 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.2s both }
        .sp-brand{ animation: fadeUp 0.6s ease 0.85s both }
        .sp-sub  { animation: fadeUp2 0.5s ease 1.1s both }
        .sp-btn  { animation: btnIn 0.6s cubic-bezier(0.34,1.56,0.64,1) 1.3s both }
        .sp-btn:active { transform: scale(0.97) !important }
        .dot { width:10px;height:10px;border-radius:50%;background:#1D4ED8;display:inline-block;margin:0 5px; }
        .dot:nth-child(1){animation:dotPulse 1.2s ease-in-out 0s infinite}
        .dot:nth-child(2){animation:dotPulse 1.2s ease-in-out 0.2s infinite}
        .dot:nth-child(3){animation:dotPulse 1.2s ease-in-out 0.4s infinite}
      `}</style>

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

      <div className="sp-brand" style={{ marginTop:22, display:'flex', alignItems:'baseline', gap:1 }}>
        <span style={{ fontSize:'2.1rem', fontWeight:900, color:'#fff', letterSpacing:'-0.04em', lineHeight:1 }}>Shop</span>
        <span style={{ fontSize:'2.1rem', fontWeight:900, color:'#F97316', letterSpacing:'-0.04em', lineHeight:1 }}>Nekt</span>
      </div>

      <p className="sp-sub" style={{
        fontSize:'0.64rem', color:'rgba(255,255,255,0.28)',
        letterSpacing:'0.22em', textTransform:'uppercase',
        marginTop:10, marginBottom:0,
      }}>
        The Global Digital Marketplace
      </p>

      <div className="sp-btn" style={{ position:'absolute', bottom:'clamp(24px,5vh,40px)' }}>
        {isReturning ? (
          <div style={{ display:'flex', alignItems:'center', gap:0 }}>
            <span className="dot"/>
            <span className="dot"/>
            <span className="dot"/>
          </div>
        ) : (
          <span
            onClick={handleEnter}
            style={{
              cursor:'pointer', userSelect:'none',
              fontFamily:"'Inter',sans-serif",
              fontSize:'0.85rem', fontWeight:700,
              color:'rgba(255,255,255,0.85)',
              letterSpacing:'0.20em',
            }}
          >
            QNEX360
          </span>
        )}
      </div>
    </div>
  )
}
