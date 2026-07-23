'use client'
import { useTranslation } from "@/hooks/useTranslation"
import { useRouter } from 'next/navigation'
import { SiteNav } from '@/components/site-nav'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const sections = [
    { title: 'Information We Collect', body: 'We collect information you provide directly, such as your name, email address, and username when you create an account. We also collect usage data to improve your experience.' },
    { title: 'How We Use Your Data', body: 'Your data is used to provide and improve ShopNekt services, process transactions, send notifications, and maintain account security. We never sell your personal data.' },
    { title: 'Data Sharing', body: 'We share your data with sellers only when necessary to complete a purchase. We do not share personal information with third parties for advertising purposes.' },
    { title: 'Data Security', body: 'We use industry-standard encryption and security measures to protect your data. All payments are processed securely through verified payment providers.' },
    { title: 'Your Rights', body: 'You can access, update, or delete your account data at any time through Settings. You can also request a full export of your data by contacting our support team.' },
    { title: 'Contact Us', body: 'For privacy concerns, contact us at support@shopnekt.com or via WhatsApp at +255 651 919 915.' },
  ]

  return (
    <main style={{ minHeight: '100vh', background: '#F8FAFF', paddingTop: '108px', fontFamily: "'Inter',sans-serif" }}>
      <SiteNav />
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '1.5rem 5% 4rem' }}>
        <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', fontSize: '0.82rem', fontWeight: 600, fontFamily: "'Inter',sans-serif", marginBottom: '1.5rem', padding: 0 }}>
          <ArrowLeft size={15} /> Back
        </button>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0D1B3E', marginBottom: 6, letterSpacing: '-0.025em' }}>{t('privacy.title')}</h1>
        <p style={{ fontSize: '0.72rem', color: '#94A3B8', marginBottom: '1.75rem' }}>Last updated: July 2026</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {sections.map((s, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E2E8F0', padding: '1.1rem 1.25rem' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0D1B3E', marginBottom: 8, letterSpacing: '-0.01em' }}>{s.title}</h3>
              <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.65, margin: 0 }}>{s.body}</p>
            </div>
          ))}
        </div>
        <p style={{ textAlign: 'center', fontSize: '0.65rem', color: '#CBD5E1', marginTop: '2rem' }}>© 2026 QNEX360 · ShopNekt</p>
      </div>
    </main>
  )
}
