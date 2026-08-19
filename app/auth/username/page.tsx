'use client'
import { useTranslation } from "@/hooks/useTranslation"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { sb } from '@/lib/supabase'
import { User, ArrowRight, Loader2 } from 'lucide-react'

export default function UsernamePage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [name,     setName]     = useState('')

  useEffect(() => {
    sb.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) { router.replace('/auth'); return }

      const meta = session.user.user_metadata
      // Already has username → skip this page
      if (meta?.username || meta?.display_name) {
        router.replace('/home')
        return
      }
      // Pre-fill name from Google
      setName(meta?.full_name || meta?.name || '')
    })
  }, [router])

  const save = async () => {
    if (!username || username.length < 3) { setError('Username must be at least 3 characters.'); return }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) { setError('Only letters, numbers and underscores.'); return }

    setLoading(true); setError('')
    const { error } = await sb.auth.updateUser({
      data: { username, display_name: username },
    })
    setLoading(false)
    if (error) setError(error.message)
    else router.replace('/home')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--sn-page)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', fontFamily: 'var(--sn-font)' }}>
      <style>{`
        @keyframes spin   { to { transform: rotate(360deg) } }
        @keyframes fadeIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        input:focus { border-color: #F97316 !important; }
      `}</style>

      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <img src="/icon-192.png" alt="ShopNekt" style={{ width: 56, height: 56, borderRadius: 14, objectFit: 'cover', marginBottom: 10 }}  loading="lazy" />
        <div>
          <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--sn-text)', letterSpacing: '-0.03em' }}>shop</span>
          <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--sn-primary)', letterSpacing: '-0.03em' }}>nekt</span>
        </div>
      </div>

      {/* Card */}
      <div style={{ width: '100%', maxWidth: 380, background: 'var(--sn-bg)', border: '1px solid #F1F5F9', borderRadius: 22, padding: '1.75rem', backdropFilter: 'blur(12px)', }}>

        {/* Google icon */}
        <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--sn-bg)', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
          <svg width="24" height="24" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-9 20-20 0-1.3-.1-2.7-.4-4z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.8 13.5-4.8L31 33.7C29 35.1 26.6 36 24 36c-5.2 0-9.6-3-11.3-7.4l-6.5 5C9.7 39.7 16.3 44 24 44z"/>
            <path fill="#1565C0" d="M43.6 20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.5l6.5 5.1C41.3 35.3 44 30 44 24c0-1.3-.1-2.7-.4-4z"/>
          </svg>
        </div>

        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--sn-text)', marginBottom: '0.4rem', letterSpacing: '-0.02em' }}>
          {name ? `Hi, ${name.split(' ')[0]}!` : 'One Last Step'}
        </h2>
        <p style={{ fontSize: '0.78rem', color: 'var(--sn-subtle)', marginBottom: '1.5rem', lineHeight: 1.55 }}>
          Choose a username for your ShopNekt profile.
        </p>

        <div style={{ position: 'relative', marginBottom: '0.85rem' }}>
          <User size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--sn-subtle)' }} />
          <input
            value={username}
            onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            placeholder="e.g. jumanne_m"
            maxLength={20}
            style={{ width: '100%', boxSizing: 'border-box', padding: '0.82rem 1rem 0.82rem 2.75rem', background: 'var(--sn-bg)', border: '1.5px solid #E2E8F0', borderRadius: 14, color: 'var(--sn-text)', fontSize: '0.9rem', fontFamily: 'var(--sn-font)', outline: 'none', transition: 'border-color 0.2s' }}
            onKeyDown={e => e.key === 'Enter' && save()}
          />
        </div>
        <p style={{ fontSize: '0.65rem', color: '#D1D5DB', marginBottom: '1.25rem', paddingLeft: 2 }}>
          Letters, numbers, underscores only · Max 20 chars
        </p>

        {error && <p style={{ fontSize: '0.75rem', color: '#FCA5A5', marginBottom: '0.85rem', textAlign: 'center' }}>{error}</p>}

        <button onClick={save} disabled={loading || username.length < 3}
          style={{ width: '100%', padding: '0.875rem', background: 'var(--sn-primary)', color: '#fff', border: 'none', borderRadius: 14, fontFamily: 'var(--sn-font)', fontWeight: 700, fontSize: '0.9rem', cursor: username.length < 3 ? 'not-allowed' : 'pointer', opacity: username.length < 3 ? 0.45 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }}>
          {loading
            ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</>
            : <>{t('authPage.continueUsername')} <ArrowRight size={14} /></>}
        </button>
      </div>
    </div>
  )
}
