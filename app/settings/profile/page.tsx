'use client'
import { useTranslation } from "@/hooks/useTranslation"
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { SiteNav } from '@/components/site-nav'
import { sb } from '@/lib/supabase'
import { ArrowLeft, User, Mail, Camera, Check, Loader2 } from 'lucide-react'

export default function ProfilePage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [name,    setName]    = useState('')
  const [email,   setEmail]   = useState('')
  const [saved,   setSaved]   = useState(false)
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    sb.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const m = session.user.user_metadata
        setName(m?.display_name || m?.username || '')
        setEmail(session.user.email || '')
      }
    }).catch(console.error)
  }, [])

  const save = async () => {
    setLoading(true)
    await sb.auth.updateUser({ data: { display_name: name } })
    setLoading(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const inp: React.CSSProperties = { width: '100%', boxSizing: 'border-box', padding: '0.75rem 1rem 0.75rem 2.75rem', border: '1.5px solid #E2E8F0', borderRadius: 12, fontSize: '0.875rem', fontFamily: "'Inter',sans-serif", outline: 'none', background: '#F8FAFF', transition: 'border-color 0.2s' }

  return (
    <main style={{ minHeight: '100vh', background: '#F8FAFF', paddingTop: '108px', fontFamily: "'Inter',sans-serif" }}>
      <SiteNav />
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '1.5rem 5% 4rem' }}>
        <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', fontSize: '0.82rem', fontWeight: 600, fontFamily: "'Inter',sans-serif", marginBottom: '1.5rem', padding: 0 }}>
          <ArrowLeft size={15} /> {t('common.back')}
        </button>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0D1B3E', marginBottom: '1.75rem', letterSpacing: '-0.025em' }}>{t('profile.title')}</h1>

        {/* Avatar */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,#F97316,#EF4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', fontSize: '1.75rem', fontWeight: 900, color: '#fff', position: 'relative' }}>
            {name ? name.slice(0,2).toUpperCase() : '?'}
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, background: '#0D1B3E', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff', cursor: 'pointer' }}>
              <Camera size={12} color="#fff" />
            </div>
          </div>
          <p style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{t('profile.tapToChange')}</p>
        </div>

        <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #E2E8F0', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>{t('profile.displayName')}</label>
            <div style={{ position: 'relative' }}>
              <User size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" style={inp} onFocus={e => (e.target.style.borderColor = '#0D1B3E')} onBlur={e => (e.target.style.borderColor = '#E2E8F0')} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>{t('profile.email')}</label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input value={email} disabled placeholder="Email" style={{ ...inp, opacity: 0.6, cursor: 'not-allowed' }} />
            </div>
            <p style={{ fontSize: '0.65rem', color: '#94A3B8', marginTop: 4 }}>{t('profile.emailNote')}</p>
          </div>
        </div>

        <button onClick={save} disabled={loading}
          style={{ width: '100%', marginTop: '1.25rem', padding: '0.875rem', background: saved ? '#059669' : '#0D1B3E', color: '#fff', border: 'none', borderRadius: 14, fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }}>
          {loading ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</>
           : saved   ? <><Check size={15} /> {t('profile.saved')}</>
           : 'Save Changes'}
        </button>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </main>
  )
}
