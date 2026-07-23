'use client'
import { useTranslation } from '@/hooks/useTranslation'

export default function NotFound() {
  const { t } = useTranslation()
  return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '32px' }}>
      <div style={{ fontSize: '4rem' }}>🔍</div>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F172A' }}>{t('notFound.title')}</h1>
      <p style={{ color: '#64748B' }}>{t('notFound.desc')}</p>
      <a href="/home" style={{ background: '#0D1B3E', color: '#C9A84C', padding: '12px 28px', borderRadius: '12px', textDecoration: 'none', fontWeight: 700 }}>{t('notFound.goHome')}</a>
    </div>
  )
}
