'use client'
import { useTranslation } from '@/hooks/useTranslation'
import Link from 'next/link'
import { ArrowRight, GraduationCap, Store } from 'lucide-react'

export function OpenStoreContent() {
  const { t } = useTranslation()
  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
      <Link href="/open-store/b2b" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fff', color: '#111827', padding: '10px 20px', borderRadius: '999px', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>
        <Store size={15} /> {t('openStore.businessTitle')}
      </Link>
      <Link href="/open-store/b2c" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#111827', color: '#fff', padding: '10px 20px', borderRadius: '999px', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>
        <GraduationCap size={15} /> {t('openStore.campusTitle')}
      </Link>
    </div>
  )
}
