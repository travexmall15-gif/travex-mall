'use client'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
  const { t } = useTranslation()
  const router = useRouter()

  const sections = [
    { title: t('privacy.s1Title'), body: t('privacy.s1Body') },
    { title: t('privacy.s2Title'), body: t('privacy.s2Body') },
    { title: t('privacy.s3Title'), body: t('privacy.s3Body') },
    { title: t('privacy.s4Title'), body: t('privacy.s4Body') },
    { title: t('privacy.s5Title'), body: t('privacy.s5Body') },
    { title: t('privacy.s6Title'), body: t('privacy.s6Body') },
  ]

  return (
    <main style={{ minHeight:'100vh', background:'var(--sn-page)', paddingTop:'108px', fontFamily:"'Inter',sans-serif" }}>
      <div style={{ maxWidth:560, margin:'0 auto', padding:'1.5rem 5% 4rem' }}>

        <button onClick={() => router.back()} style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', cursor:'pointer', color:'var(--sn-muted)', fontSize:'0.82rem', fontWeight:600, fontFamily:"'Inter',sans-serif", marginBottom:'1.5rem', padding:0 }}>
          <ArrowLeft size={15} /> {t('privacy.back')}
        </button>

        <h1 style={{ fontSize:'1.25rem', fontWeight:800, color:'#0D1B3E', marginBottom:6, letterSpacing:'-0.025em' }}>{t('privacy.title')}</h1>
        <p style={{ fontSize:'0.72rem', color:'var(--sn-subtle)', marginBottom:'1.75rem' }}>
          {t('privacy.lastUpdated')}: {t('privacy.lastUpdatedDate')}
        </p>

        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          {sections.map((s, i) => (
            <div key={i} style={{ background:'var(--sn-bg)', borderRadius:14, border:'1.5px solid #E2E8F0', padding:'1.1rem 1.25rem' }}>
              <h3 style={{ fontSize:'0.875rem', fontWeight:700, color:'#0D1B3E', marginBottom:8, letterSpacing:'-0.01em' }}>{s.title}</h3>
              <p style={{ fontSize:'0.82rem', color:'var(--sn-muted)', lineHeight:1.65, margin:0 }}>{s.body}</p>
            </div>
          ))}
        </div>

        <p style={{ textAlign:'center', fontSize:'0.65rem', color:'#CBD5E1', marginTop:'2rem' }}>
          {t('privacy.copyright')}
        </p>
      </div>
    </main>
  )
}
