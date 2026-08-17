'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, User, ArrowRight, ArrowLeft, ShieldCheck, Eye, EyeOff } from 'lucide-react'

type Screen = 'form' | 'code'

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export default function AuthPage() {
  const router = useRouter()
  const [screen,    setScreen]    = useState<Screen>('form')
  const [name,      setName]      = useState('')
  const [email,     setEmail]     = useState('')
  const [code,      setCode]      = useState('')
  const [entered,   setEntered]   = useState('')
  const [error,     setError]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [showCode,  setShowCode]  = useState(false)
  const [timer,     setTimer]     = useState(60)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Redirect if already logged in
  useEffect(() => {
    const c = localStorage.getItem('sn_customer_session')
    const s = localStorage.getItem('travex_session')
    if (c) { try { if (JSON.parse(c)?.id) { router.replace('/home'); return } } catch {} }
    if (s) { try { if (JSON.parse(s)?.id) { router.replace('/home'); return } } catch {} }
  }, [router])

  // Countdown timer on code screen
  useEffect(() => {
    if (screen === 'code') {
      setTimer(60)
      timerRef.current = setInterval(() => {
        setTimer(t => { if (t <= 1) { clearInterval(timerRef.current!); return 0 } return t - 1 })
      }, 1000)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [screen])

  const handleGetCode = () => {
    setError('')
    if (!name.trim()) { setError('Please enter your full name.'); return }
    if (!email.trim() || !email.includes('@')) { setError('Please enter a valid email address.'); return }
    setLoading(true)
    setTimeout(() => {
      const newCode = generateCode()
      setCode(newCode)
      setEntered('')
      setShowCode(false)
      setScreen('code')
      setLoading(false)
    }, 600)
  }

  const handleVerify = () => {
    setError('')
    if (entered.length < 6) { setError('Please enter the full 6-digit code.'); return }
    if (entered !== code) { setError('Incorrect code. Please check and try again.'); return }
    setLoading(true)
    setTimeout(async () => {
      const id = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString()
      const session = {
        id,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        created_at: new Date().toISOString(),
      }
      // Save to localStorage first (instant)
      localStorage.setItem('sn_customer_session', JSON.stringify(session))

      // Save to Supabase customers table (background — non-blocking)
      try {
        await fetch('https://bscecjbgnjitlfmgwcic.supabase.co/rest/v1/customers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': 'sb_publishable_giz1AS9CcdTiksOrW5U0rQ_yY5kkzos',
            'Authorization': 'Bearer sb_publishable_giz1AS9CcdTiksOrW5U0rQ_yY5kkzos',
            'Prefer': 'resolution=merge-duplicates',
            'on-conflict': 'email',
          },
          body: JSON.stringify({
            id,
            name: name.trim(),
            email: email.trim().toLowerCase(),
            created_at: new Date().toISOString(),
            last_seen: new Date().toISOString(),
          })
        })
      } catch { /* non-critical — session already saved locally */ }

      router.replace('/home')
    }, 500)
  }

  const handleResend = () => {
    const newCode = generateCode()
    setCode(newCode)
    setEntered('')
    setShowCode(false)
    setError('')
    setTimer(60)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimer(t => { if (t <= 1) { clearInterval(timerRef.current!); return 0 } return t - 1 })
    }, 1000)
  }

  const inp: React.CSSProperties = {
    width:'100%', boxSizing:'border-box' as const,
    padding:'0.82rem 1rem 0.82rem 2.75rem',
    background:'var(--sn-bg)',
    border:'1.5px solid #E2E8F0',
    borderRadius:12, color:'#0D1B3E', fontSize:'0.9rem',
    fontFamily:"'Inter',sans-serif", outline:'none',
    transition:'border-color 0.2s, box-shadow 0.2s',
  }

  const iconStyle: React.CSSProperties = {
    position:'absolute', left:13, top:'50%',
    transform:'translateY(-50%)', color:'var(--sn-subtle)', pointerEvents:'none',
  }

  return (
    <div style={{
      minHeight:'100dvh',
      background:'var(--sn-page)',
      display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
      padding:'1.5rem', fontFamily:"'Inter',sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
        @keyframes fadeIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to { transform: rotate(360deg) } }
        .auth-card { animation: fadeIn 0.32s ease both; }
        input:focus { border-color: #0D1B3E !important; box-shadow: 0 0 0 3px rgba(13,27,62,0.08) !important; }
        input::placeholder { color: #CBD5E1 !important; }
        .code-digit { animation: fadeIn 0.2s ease both; }
      `}</style>

      {/* Logo */}
      <div style={{ textAlign:'center', marginBottom:'1.5rem', animation:'fadeIn 0.4s ease 0.05s both' }}>
        <div style={{ display:'flex', alignItems:'baseline', justifyContent:'center', gap:1, marginBottom:4 }}>
          <span style={{ fontSize:'1.4rem', fontWeight:900, color:'#0D1B3E', letterSpacing:'-0.04em' }}>Shop</span>
          <span style={{ fontSize:'1.4rem', fontWeight:900, color:'var(--sn-primary)', letterSpacing:'-0.04em' }}>Nekt</span>
        </div>
        <div style={{ fontSize:'0.62rem', color:'var(--sn-subtle)', letterSpacing:'0.15em', textTransform:'uppercase' }}>QNEX360</div>
      </div>

      {/* Card */}
      <div className="auth-card" key={screen} style={{
        width:'100%', maxWidth:380,
        background:'var(--sn-bg)',
        border:'1.5px solid #E2E8F0',
        borderRadius:22, padding:'1.75rem',
        boxShadow:'0 4px 24px rgba(13,27,62,0.08)',
      }}>

        {/* ── FORM SCREEN ────────────────────────────── */}
        {screen === 'form' && <>
          <h2 style={{ fontSize:'1.2rem', fontWeight:800, color:'#0D1B3E', marginBottom:4, letterSpacing:'-0.02em' }}>
            Welcome to ShopNekt
          </h2>
          <p style={{ fontSize:'0.78rem', color:'var(--sn-subtle)', marginBottom:'1.5rem', lineHeight:1.6 }}>
            Enter your details to get started. We'll generate a code for you instantly.
          </p>

          <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem', marginBottom:'1rem' }}>
            <div style={{ position:'relative' }}>
              <User size={15} style={iconStyle} />
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Full name"
                style={inp}
                onKeyDown={e => e.key === 'Enter' && handleGetCode()}
              />
            </div>
            <div style={{ position:'relative' }}>
              <Mail size={15} style={iconStyle} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email address"
                style={inp}
                onKeyDown={e => e.key === 'Enter' && handleGetCode()}
              />
            </div>
          </div>

          {error && (
            <div style={{ fontSize:'0.76rem', color:'#DC2626', background:'rgba(220,38,38,0.06)', border:'1px solid rgba(220,38,38,0.15)', borderRadius:8, padding:'0.6rem 0.85rem', marginBottom:'0.85rem' }}>
              {error}
            </div>
          )}

          <button
            onClick={handleGetCode}
            disabled={loading}
            style={{
              width:'100%', padding:'0.875rem',
              background: loading ? '#94A3B8' : '#1D4ED8',
              color:'var(--sn-text)', border:'none', borderRadius:12,
              fontFamily:"'Inter',sans-serif", fontWeight:700,
              fontSize:'0.9rem', cursor: loading ? 'not-allowed' : 'pointer',
              display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              transition:'all 0.2s',
            }}
          >
            {loading
              ? <><span style={{ width:16,height:16,border:'2px solid #9CA3AF',borderTopColor:'#fff',borderRadius:'50%',animation:'spin .7s linear infinite',display:'inline-block' }}/> Generating...</>
              : <>Get My Code <ArrowRight size={15}/></>
            }
          </button>

          <p style={{ textAlign:'center', marginTop:'1.25rem', fontSize:'0.73rem', color:'var(--sn-subtle)', lineHeight:1.6 }}>
            Already have a seller account?{' '}
            <a href="/login" style={{ color:'var(--sn-text)', fontWeight:700, textDecoration:'none' }}>Seller Login</a>
          </p>
        </>}

        {/* ── CODE SCREEN ────────────────────────────── */}
        {screen === 'code' && <>
          <button
            onClick={() => { setScreen('form'); setError('') }}
            style={{ background:'none', border:'none', cursor:'pointer', color:'var(--sn-subtle)', display:'flex', alignItems:'center', gap:5, fontSize:'0.78rem', fontFamily:"'Inter',sans-serif", marginBottom:'1.25rem', padding:0 }}
          >
            <ArrowLeft size={14}/> Back
          </button>

          <div style={{ textAlign:'center', marginBottom:'1.5rem' }}>
            <div style={{ width:56,height:56,borderRadius:16,background:'rgba(13,27,62,0.06)',border:'1.5px solid rgba(13,27,62,0.10)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px' }}>
              <ShieldCheck size={26} color="#0D1B3E"/>
            </div>
            <h2 style={{ fontSize:'1.05rem', fontWeight:800, color:'#0D1B3E', letterSpacing:'-0.02em', marginBottom:6 }}>
              Your code is ready
            </h2>
            <p style={{ fontSize:'0.76rem', color:'var(--sn-subtle)', lineHeight:1.6 }}>
              Hi <strong style={{ color:'#0D1B3E' }}>{name.split(' ')[0]}</strong> — here is your one-time login code.
            </p>
          </div>

          {/* Code display box */}
          <div style={{
            background:'var(--sn-bg)',
            borderRadius:14, padding:'1.25rem',
            textAlign:'center', marginBottom:'1.25rem',
            position:'relative',
          }}>
            <div style={{ fontSize:'0.62rem', color:'var(--sn-subtle)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:10 }}>
              Your login code
            </div>
            <div style={{
              fontSize: showCode ? '2.2rem' : '2rem',
              fontWeight:900, letterSpacing:'0.35em',
              color: showCode ? '#1D4ED8' : 'var(--sn-border)',
              fontFamily:"'Inter',sans-serif",
              filter: showCode ? 'none' : 'blur(8px)',
              transition:'all 0.3s', userSelect: showCode ? 'text' : 'none',
              marginBottom:10, lineHeight:1.2,
            }}>
              {showCode ? code : '● ● ● ● ● ●'}
            </div>
            <button
              onClick={() => setShowCode(v => !v)}
              style={{ background:'var(--sn-bg)', border:'1px solid var(--sn-border)', borderRadius:999, padding:'4px 14px', color:'var(--sn-muted)', fontSize:'0.72rem', fontWeight:600, cursor:'pointer', fontFamily:"'Inter',sans-serif", display:'inline-flex', alignItems:'center', gap:5 }}
            >
              {showCode ? <><EyeOff size={12}/> Hide</> : <><Eye size={12}/> Reveal Code</>}
            </button>
          </div>

          {/* Code input */}
          <div style={{ marginBottom:'0.85rem' }}>
            <label style={{ display:'block', fontSize:'0.72rem', fontWeight:600, color:'var(--sn-muted)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.06em' }}>
              Enter the code above
            </label>
            <input
              value={entered}
              onChange={e => setEntered(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              inputMode="numeric"
              autoFocus
              style={{
                ...inp,
                paddingLeft:'1rem', letterSpacing:'0.4em',
                textAlign:'center', fontSize:'1.4rem',
                fontWeight:900,
              }}
              onKeyDown={e => e.key === 'Enter' && handleVerify()}
            />
          </div>

          {error && (
            <div style={{ fontSize:'0.76rem', color:'#DC2626', background:'rgba(220,38,38,0.06)', border:'1px solid rgba(220,38,38,0.15)', borderRadius:8, padding:'0.6rem 0.85rem', marginBottom:'0.85rem' }}>
              {error}
            </div>
          )}

          <button
            onClick={handleVerify}
            disabled={loading || entered.length < 6}
            style={{
              width:'100%', padding:'0.875rem',
              background: entered.length < 6 ? '#94A3B8' : '#1D4ED8',
              color:'var(--sn-text)', border:'none', borderRadius:12,
              fontFamily:"'Inter',sans-serif", fontWeight:700,
              fontSize:'0.9rem',
              cursor: entered.length < 6 ? 'not-allowed' : 'pointer',
              display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              transition:'all 0.2s', marginBottom:'1rem',
            }}
          >
            {loading
              ? <span style={{ width:16,height:16,border:'2px solid #9CA3AF',borderTopColor:'#fff',borderRadius:'50%',animation:'spin .7s linear infinite',display:'inline-block' }}/>
              : <>Verify & Enter <ArrowRight size={15}/></>
            }
          </button>

          <p style={{ textAlign:'center', fontSize:'0.73rem', color:'var(--sn-subtle)' }}>
            {timer > 0
              ? <>Code expires in <strong style={{ color:'#0D1B3E' }}>{timer}s</strong></>
              : <button onClick={handleResend} style={{ background:'none', border:'none', color:'var(--sn-text)', fontWeight:700, cursor:'pointer', fontFamily:"'Inter',sans-serif", fontSize:'0.73rem', padding:0 }}>
                  Get a new code
                </button>
            }
          </p>
        </>}
      </div>
    </div>
  )
}
