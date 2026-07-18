'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { sb } from '@/lib/supabase'
import { Mail, User, ArrowRight, ArrowLeft, Loader2, ShieldCheck } from 'lucide-react'

type Screen = 'main' | 'signup' | 'otp-login' | 'otp-signup' | 'verify'

export default function AuthPage() {
  const router = useRouter()
  const [screen,   setScreen]   = useState<Screen>('main')
  const [email,    setEmail]    = useState('')
  const [username, setUsername] = useState('')
  const [otp,      setOtp]      = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [info,     setInfo]     = useState('')

  const go = (s: Screen) => { setScreen(s); setError(''); setInfo('') }

  // ── Google OAuth ─────────────────────────────────────────
  const handleGoogle = async () => {
    setLoading(true)
    const { error } = await sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/home` },
    })
    if (error) { setError(error.message); setLoading(false) }
  }

  // ── Send OTP (login — email only) ────────────────────────
  const sendOtpLogin = async () => {
    if (!email) { setError('Enter your email.'); return }
    setLoading(true); setError('')
    const { error } = await sb.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    })
    setLoading(false)
    if (error) {
      if (error.message.includes('not found') || error.message.includes('User'))
        setError("No account found. Please sign up first.")
      else setError(error.message)
    } else {
      setInfo(`Code sent to ${email}`)
      setScreen('verify')
    }
  }

  // ── Send OTP (signup — email + username) ─────────────────
  const sendOtpSignup = async () => {
    if (!email || !username) { setError('Fill in all fields.'); return }
    setLoading(true); setError('')
    const { error } = await sb.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        data: { username, display_name: username },
      },
    })
    setLoading(false)
    if (error) setError(error.message)
    else {
      setInfo(`Code sent to ${email}`)
      setScreen('verify')
    }
  }

  // ── Verify OTP ───────────────────────────────────────────
  const verifyOtp = async () => {
    if (otp.length < 6) { setError('Enter the 6-digit code.'); return }
    setLoading(true); setError('')
    const { error } = await sb.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    })
    setLoading(false)
    if (error) setError('Wrong code. Please try again.')
    else router.replace('/home')
  }

  // ── Styles ───────────────────────────────────────────────
  const inp: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    padding: '0.82rem 1rem 0.82rem 2.75rem',
    background: 'rgba(255,255,255,0.06)',
    border: '1.5px solid rgba(255,255,255,0.10)',
    borderRadius: 14, color: '#fff', fontSize: '0.9rem',
    fontFamily: "'Inter',sans-serif", outline: 'none',
    transition: 'border-color 0.2s',
  }

  const btn = (orange = true): React.CSSProperties => ({
    width: '100%', padding: '0.875rem',
    background: orange ? '#F97316' : 'rgba(255,255,255,0.06)',
    color: '#fff', border: orange ? 'none' : '1.5px solid rgba(255,255,255,0.12)',
    borderRadius: 14, fontFamily: "'Inter',sans-serif",
    fontWeight: 700, fontSize: '0.9rem',
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.6 : 1,
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: 8,
    transition: 'all 0.2s',
  })

  const backBtn = (
    <button onClick={() => go('main')}
      style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.4)', display:'flex', alignItems:'center', gap:5, fontSize:'0.78rem', fontFamily:"'Inter',sans-serif", marginBottom:'1.25rem', padding:0 }}>
      <ArrowLeft size={14} /> Back
    </button>
  )

  return (
    <div style={{ minHeight:'100vh', background:'#080F37', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'1.5rem', fontFamily:"'Inter',sans-serif" }}>
      <style>{`
        @keyframes spin   { to { transform: rotate(360deg) } }
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .a-card { animation: fadeIn 0.3s ease; }
        input:focus { border-color: #F97316 !important; }
        .otp-input { letter-spacing: 0.35em; text-align: center; font-size: 1.4rem !important; font-weight: 800 !important; }
      `}</style>

      {/* Logo */}
      <div style={{ textAlign:'center', marginBottom:'1.75rem' }}>
        <img src="/icon-192.png" alt="ShopNekt" style={{ width:60, height:60, borderRadius:15, objectFit:'cover', marginBottom:12 }} />
        <div>
          <span style={{ fontSize:'1.4rem', fontWeight:900, color:'#fff', letterSpacing:'-0.03em' }}>shop</span>
          <span style={{ fontSize:'1.4rem', fontWeight:900, color:'#F97316', letterSpacing:'-0.03em' }}>nekt</span>
        </div>
        <p style={{ fontSize:'0.62rem', color:'rgba(255,255,255,0.22)', marginTop:3, letterSpacing:'0.15em', textTransform:'uppercase' }}>from qnex360</p>
      </div>

      {/* Card */}
      <div className="a-card" key={screen} style={{ width:'100%', maxWidth:380, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:22, padding:'1.75rem', backdropFilter:'blur(12px)' }}>

        {/* ── MAIN ─────────────────────────────────────────── */}
        {screen === 'main' && <>
          <h2 style={{ fontSize:'1.15rem', fontWeight:800, color:'#fff', textAlign:'center', marginBottom:'0.4rem', letterSpacing:'-0.02em' }}>Welcome to ShopNekt</h2>
          <p style={{ fontSize:'0.78rem', color:'rgba(255,255,255,0.35)', textAlign:'center', marginBottom:'1.75rem' }}>Sign in to continue shopping</p>

          {/* Google */}
          <button onClick={handleGoogle} disabled={loading}
            style={{ ...btn(false), background:'#fff', color:'#1a1a1a', border:'none', marginBottom:'0.75rem' }}>
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-9 20-20 0-1.3-.1-2.7-.4-4z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
              <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.8 13.5-4.8L31 33.7C29 35.1 26.6 36 24 36c-5.2 0-9.6-3-11.3-7.4l-6.5 5C9.7 39.7 16.3 44 24 44z"/>
              <path fill="#1565C0" d="M43.6 20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.5l6.5 5.1C41.3 35.3 44 30 44 24c0-1.3-.1-2.7-.4-4z"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div style={{ display:'flex', alignItems:'center', gap:10, margin:'0.5rem 0 0.75rem' }}>
            <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.08)' }} />
            <span style={{ fontSize:'0.7rem', color:'rgba(255,255,255,0.25)', fontWeight:600 }}>OR</span>
            <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.08)' }} />
          </div>

          {/* Email login */}
          <button onClick={() => go('otp-login')} style={{ ...btn(), marginBottom:'0.65rem' }}>
            <Mail size={16} /> Sign In with Email
          </button>

          {error && <p style={{ fontSize:'0.75rem', color:'#FCA5A5', marginTop:'0.85rem', textAlign:'center' }}>{error}</p>}

          <p style={{ textAlign:'center', marginTop:'1.5rem', fontSize:'0.75rem', color:'rgba(255,255,255,0.3)' }}>
            Don&apos;t have an account?{' '}
            <button onClick={() => go('signup')}
              style={{ background:'none', border:'none', color:'#F97316', fontWeight:700, cursor:'pointer', fontFamily:"'Inter',sans-serif", fontSize:'0.75rem' }}>
              Sign Up Free
            </button>
          </p>
        </>}

        {/* ── OTP LOGIN ─────────────────────────────────────── */}
        {screen === 'otp-login' && <>
          {backBtn}
          <h2 style={{ fontSize:'1.1rem', fontWeight:800, color:'#fff', marginBottom:'0.4rem', letterSpacing:'-0.02em' }}>Sign In</h2>
          <p style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.35)', marginBottom:'1.5rem' }}>We&apos;ll send a 6-digit code to your email.</p>

          <div style={{ position:'relative', marginBottom:'0.75rem' }}>
            <Mail size={15} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'rgba(255,255,255,0.3)' }} />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Email address" style={inp}
              onKeyDown={e => e.key === 'Enter' && sendOtpLogin()} />
          </div>

          {error && <p style={{ fontSize:'0.75rem', color:'#FCA5A5', marginBottom:'0.75rem', textAlign:'center' }}>{error}</p>}

          <button onClick={sendOtpLogin} disabled={loading} style={btn()}>
            {loading ? <><Loader2 size={15} style={{ animation:'spin 1s linear infinite' }} /> Sending...</> : <>Send Code <ArrowRight size={14} /></>}
          </button>

          <p style={{ textAlign:'center', marginTop:'1.25rem', fontSize:'0.75rem', color:'rgba(255,255,255,0.3)' }}>
            No account?{' '}
            <button onClick={() => go('signup')} style={{ background:'none', border:'none', color:'#F97316', fontWeight:700, cursor:'pointer', fontFamily:"'Inter',sans-serif", fontSize:'0.75rem' }}>
              Sign Up
            </button>
          </p>
        </>}

        {/* ── SIGN UP ───────────────────────────────────────── */}
        {screen === 'signup' && <>
          {backBtn}
          <h2 style={{ fontSize:'1.1rem', fontWeight:800, color:'#fff', marginBottom:'0.4rem', letterSpacing:'-0.02em' }}>Create Account</h2>
          <p style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.35)', marginBottom:'1.5rem' }}>Enter your email and choose a username.</p>

          <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem', marginBottom:'0.75rem' }}>
            <div style={{ position:'relative' }}>
              <Mail size={15} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'rgba(255,255,255,0.3)' }} />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" style={inp} />
            </div>
            <div style={{ position:'relative' }}>
              <User size={15} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'rgba(255,255,255,0.3)' }} />
              <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" style={inp}
                onKeyDown={e => e.key === 'Enter' && sendOtpSignup()} />
            </div>
          </div>

          {error && <p style={{ fontSize:'0.75rem', color:'#FCA5A5', marginBottom:'0.75rem', textAlign:'center' }}>{error}</p>}

          <button onClick={sendOtpSignup} disabled={loading} style={btn()}>
            {loading ? <><Loader2 size={15} style={{ animation:'spin 1s linear infinite' }} /> Sending...</> : <>Get Code <ArrowRight size={14} /></>}
          </button>

          <p style={{ textAlign:'center', marginTop:'1.25rem', fontSize:'0.75rem', color:'rgba(255,255,255,0.3)' }}>
            Already have an account?{' '}
            <button onClick={() => go('otp-login')} style={{ background:'none', border:'none', color:'#F97316', fontWeight:700, cursor:'pointer', fontFamily:"'Inter',sans-serif", fontSize:'0.75rem' }}>
              Sign In
            </button>
          </p>
        </>}

        {/* ── VERIFY OTP ────────────────────────────────────── */}
        {screen === 'verify' && <>
          {backBtn}
          <div style={{ textAlign:'center', marginBottom:'1.5rem' }}>
            <div style={{ width:56, height:56, borderRadius:16, background:'rgba(249,115,22,0.12)', border:'1.5px solid rgba(249,115,22,0.2)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px' }}>
              <ShieldCheck size={26} color="#F97316" />
            </div>
            <h2 style={{ fontSize:'1.1rem', fontWeight:800, color:'#fff', letterSpacing:'-0.02em', marginBottom:6 }}>Check Your Email</h2>
            <p style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.35)', lineHeight:1.6 }}>
              We sent a 6-digit code to<br />
              <span style={{ color:'#F97316', fontWeight:700 }}>{email}</span>
            </p>
          </div>

          {/* OTP input */}
          <div style={{ position:'relative', marginBottom:'0.75rem' }}>
            <input
              className="otp-input"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g,'').slice(0,6))}
              placeholder="000000"
              maxLength={6}
              inputMode="numeric"
              style={{ ...inp, paddingLeft:'1rem', letterSpacing:'0.35em', textAlign:'center', fontSize:'1.4rem', fontWeight:800 }}
              onKeyDown={e => e.key === 'Enter' && verifyOtp()}
            />
          </div>

          {error && <p style={{ fontSize:'0.75rem', color:'#FCA5A5', marginBottom:'0.75rem', textAlign:'center' }}>{error}</p>}
          {info  && <p style={{ fontSize:'0.75rem', color:'#86EFAC', marginBottom:'0.75rem', textAlign:'center' }}>{info}</p>}

          <button onClick={verifyOtp} disabled={loading || otp.length < 6} style={{ ...btn(), opacity: otp.length < 6 ? 0.5 : 1 }}>
            {loading ? <><Loader2 size={15} style={{ animation:'spin 1s linear infinite' }} /> Verifying...</> : <>Verify & Sign In <ArrowRight size={14} /></>}
          </button>

          <p style={{ textAlign:'center', marginTop:'1.25rem', fontSize:'0.75rem', color:'rgba(255,255,255,0.3)' }}>
            Didn&apos;t receive it?{' '}
            <button onClick={() => go(screen === 'verify' ? 'otp-login' : 'otp-login')}
              style={{ background:'none', border:'none', color:'#F97316', fontWeight:700, cursor:'pointer', fontFamily:"'Inter',sans-serif", fontSize:'0.75rem' }}>
              Resend Code
            </button>
          </p>
        </>}

      </div>
    </div>
  )
}
