'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { sb } from '@/lib/supabase'
import { useTranslation } from '@/hooks/useTranslation'
import { Eye, EyeOff, Mail, User, Lock, ArrowRight, Loader2 } from 'lucide-react'

export default function AuthPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [mode, setMode]         = useState<'login' | 'signup'>('login')
  const [email, setEmail]       = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')

  const handleSubmit = async () => {
    setError(''); setSuccess('')
    if (!email || !password) { setError('Please fill in all fields.'); return }
    if (mode === 'signup' && !username) { setError('Username is required.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }

    setLoading(true)
    try {
      if (mode === 'signup') {
        const { error: err } = await sb.auth.signUp({
          email, password,
          options: { data: { username, display_name: username } }
        })
        if (err) throw err
        setSuccess('Account created! Signing you in...')
        // Auto login after signup
        await sb.auth.signInWithPassword({ email, password })
        router.replace('/home')
      } else {
        const { error: err } = await sb.auth.signInWithPassword({ email, password })
        if (err) throw err
        router.replace('/home')
      }
    } catch (err: any) {
      const msg = err?.message || 'Something went wrong.'
      if (msg.includes('already registered')) setError('Email already registered. Please login.')
      else if (msg.includes('Invalid login')) setError('Incorrect email or password.')
      else if (msg.includes('Email not confirmed')) setError('Please check your email to confirm your account.')
      else setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#080F37',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '1.5rem', fontFamily: "'Inter',sans-serif",
    }}>

      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <img src="/icon-192.png" alt="ShopNekt"
          style={{ width: 64, height: 64, borderRadius: 16, objectFit: 'cover', marginBottom: 14 }} />
        <div>
          <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em' }}>shop</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#F97316', letterSpacing: '-0.03em' }}>nekt</span>
        </div>
        <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginTop: 4, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          from qnex360
        </p>
      </div>

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 380,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 20, padding: '1.75rem',
        backdropFilter: 'blur(12px)',
      }}>

        {/* Toggle */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 4, marginBottom: '1.5rem' }}>
          {(['login','signup'] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); setSuccess('') }}
              style={{
                flex: 1, padding: '0.6rem', borderRadius: 9, border: 'none', cursor: 'pointer',
                fontFamily: "'Inter',sans-serif", fontSize: '0.82rem', fontWeight: 700,
                transition: 'all 0.2s',
                background: mode === m ? '#fff' : 'transparent',
                color: mode === m ? '#0D1B3E' : 'rgba(255,255,255,0.45)',
                boxShadow: mode === m ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
              }}>
              {m === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>

          {mode === 'signup' && (
            <div style={{ position: 'relative' }}>
              <User size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
              <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Username"
                style={inputStyle}
              />
            </div>
          )}

          <div style={{ position: 'relative' }}>
            <Mail size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email address"
              style={inputStyle}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
            <input
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              style={{ ...inputStyle, paddingRight: '2.75rem' }}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
            <button onClick={() => setShowPass(!showPass)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', padding: 2, display: 'flex' }}>
              {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        {/* Error / Success */}
        {error   && <p style={{ fontSize: '0.75rem', color: '#FCA5A5', marginTop: '0.85rem', textAlign: 'center', lineHeight: 1.5 }}>{error}</p>}
        {success && <p style={{ fontSize: '0.75rem', color: '#86EFAC', marginTop: '0.85rem', textAlign: 'center', lineHeight: 1.5 }}>{success}</p>}

        {/* Submit */}
        <button onClick={handleSubmit} disabled={loading}
          style={{
            width: '100%', marginTop: '1.25rem',
            padding: '0.85rem',
            background: loading ? 'rgba(249,115,22,0.5)' : '#F97316',
            color: '#fff', border: 'none', borderRadius: 14,
            fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: '0.9rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'all 0.2s',
          }}>
          {loading
            ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Processing...</>
            : <>{mode === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight size={15} /></>
          }
        </button>

        {/* Switch mode */}
        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>
          {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}
            style={{ background: 'none', border: 'none', color: '#F97316', fontWeight: 700, cursor: 'pointer', fontFamily: "'Inter',sans-serif", fontSize: '0.75rem' }}>
            {mode === 'login' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box' as const,
  padding: '0.75rem 1rem 0.75rem 2.75rem',
  background: 'rgba(255,255,255,0.06)',
  border: '1.5px solid rgba(255,255,255,0.10)',
  borderRadius: 12, color: '#fff', fontSize: '0.875rem',
  fontFamily: "'Inter',sans-serif", outline: 'none',
  transition: 'border-color 0.2s',
}
