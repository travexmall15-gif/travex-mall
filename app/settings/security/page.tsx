'use client'
import { useTranslation } from "@/hooks/useTranslation"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SiteNav } from '@/components/site-nav'
import { sb } from '@/lib/supabase'
import { ArrowLeft, Lock, Eye, EyeOff, Check, Loader2, Shield } from 'lucide-react'

export default function SecurityPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [currentPw, setCurrentPw] = useState('')
  const [newPw,     setNewPw]     = useState('')
  const [show,      setShow]      = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [msg,       setMsg]       = useState('')
  const [err,       setErr]       = useState('')

  const changePassword = async () => {
    if (!newPw || newPw.length < 6) { setErr('Password must be at least 6 characters.'); return }
    setLoading(true); setErr(''); setMsg('')
    const { error } = await sb.auth.updateUser({ password: newPw })
    setLoading(false)
    if (error) setErr(error.message)
    else { setMsg('Password updated successfully!'); setCurrentPw(''); setNewPw('') }
  }

  const inp: React.CSSProperties = { width: '100%', boxSizing: 'border-box', padding: '0.75rem 1rem 0.75rem 2.75rem', border: '1.5px solid #E2E8F0', borderRadius: 12, fontSize: '0.875rem', fontFamily: "'Inter',sans-serif", outline: 'none', background: '#F8FAFF', transition: 'border-color 0.2s' }

  return (
    <main style={{ minHeight: '100vh', background: '#F8FAFF', paddingTop: '108px', fontFamily: "'Inter',sans-serif" }}>
      <SiteNav />
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '1.5rem 5% 4rem' }}>
        <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', fontSize: '0.82rem', fontWeight: 600, fontFamily: "'Inter',sans-serif", marginBottom: '1.5rem', padding: 0 }}>
          <ArrowLeft size={15} /> Back
        </button>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0D1B3E', marginBottom: '1.75rem', letterSpacing: '-0.025em' }}>{t('security.title')}</h1>

        <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #E2E8F0', padding: '1.25rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem' }}>
            <Shield size={18} color="#8B5CF6" />
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0D1B3E' }}>{t('security.changePassword')}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { val: newPw, set: setNewPw, placeholder: 'New password' },
            ].map((f, i) => (
              <div key={i} style={{ position: 'relative' }}>
                <Lock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input type={show ? 'text' : 'password'} value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.placeholder} style={{ ...inp, paddingRight: '2.5rem' }} onFocus={e => (e.target.style.borderColor = '#0D1B3E')} onBlur={e => (e.target.style.borderColor = '#E2E8F0')} />
                <button onClick={() => setShow(!show)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex' }}>
                  {show ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            ))}
          </div>
          {err && <p style={{ fontSize: '0.75rem', color: '#EF4444', marginTop: 8 }}>{err}</p>}
          {msg && <p style={{ fontSize: '0.75rem', color: '#059669', marginTop: 8 }}>{msg}</p>}
          <button onClick={changePassword} disabled={loading}
            style={{ width: '100%', marginTop: '1rem', padding: '0.8rem', background: '#0D1B3E', color: '#fff', border: 'none', borderRadius: 12, fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {loading ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Updating...</> : 'Update Password'}
          </button>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </main>
  )
}
