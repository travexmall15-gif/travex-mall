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
      position: 'fixed', inset: 0,
      background: '#fff',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter',sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        @keyframes logoIn  { from{opacity:0;transform:scale(0.82)} to{opacity:1;transform:scale(1)} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeUp2 { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes btnIn   { from{opacity:0} to{opacity:1} }
        @keyframes dotPulse { 0%,80%,100%{transform:scale(0.6);opacity:0.25} 40%{transform:scale(1);opacity:1} }
        .sp-logo  { animation: logoIn 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.15s both }
        .sp-brand { animation: fadeUp 0.5s ease 0.75s both }
        .sp-sub   { animation: fadeUp2 0.5s ease 1.0s both }
        .sp-btn   { animation: btnIn 0.5s ease 1.3s both }
        .dot { width:8px;height:8px;border-radius:50%;background:#1D4ED8;display:inline-block;margin:0 4px; }
        .dot:nth-child(1){animation:dotPulse 1.2s ease-in-out 0s infinite}
        .dot:nth-child(2){animation:dotPulse 1.2s ease-in-out 0.2s infinite}
        .dot:nth-child(3){animation:dotPulse 1.2s ease-in-out 0.4s infinite}
      `}</style>

      {/* Logo */}
      <div className="sp-logo">
        <Image
          src="/sn-logo.png"
          alt="ShopNekt"
          width={88}
          height={88}
          priority
          style={{ borderRadius: 20, objectFit: 'contain', display: 'block' }}
        />
      </div>

      {/* Brand name */}
      <div className="sp-brand" style={{ marginTop: 20, display: 'flex', alignItems: 'baseline', gap: 1 }}>
        <span style={{ fontSize: '2rem', fontWeight: 900, color: '#111827', letterSpacing: '-0.04em', lineHeight: 1 }}>Shop</span>
        <span style={{ fontSize: '2rem', fontWeight: 900, color: '#1D4ED8', letterSpacing: '-0.04em', lineHeight: 1 }}>Nekt</span>
      </div>

      {/* Tagline */}
      <p className="sp-sub" style={{
        fontSize: '0.62rem',
        color: '#9CA3AF',
        letterSpacing: '0.20em',
        textTransform: 'uppercase',
        marginTop: 10,
        marginBottom: 0,
      }}>
        The Global Digital Marketplace
      </p>

      {/* Bottom — QNEX360 or loading dots */}
      <div className="sp-btn" style={{ position: 'absolute', bottom: 'clamp(24px,5vh,40px)' }}>
        {isReturning ? (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span className="dot"/><span className="dot"/><span className="dot"/>
          </div>
        ) : (
          <span
            onClick={handleEnter}
            style={{
              cursor: 'pointer', userSelect: 'none',
              fontSize: '0.72rem', fontWeight: 700,
              color: '#D1D5DB',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}
          >
            QNEX360
          </span>
        )}
      </div>
    </div>
  )
}
