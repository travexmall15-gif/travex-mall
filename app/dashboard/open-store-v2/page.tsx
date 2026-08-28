'use client'
import { useEffect, useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { SiteFooter } from '@/components/site-footer'
import { SiteNav } from '@/components/site-nav'
import { sb } from '@/lib/supabase'
import Link from 'next/link'
import {
  Search, Loader2, Clock, CheckCircle2, XCircle, Lock, Eye,
  Store, ArrowRight, Store as StoreIcon,
} from 'lucide-react'

type Application = {
  id: string
  shop_name: string
  shop_category: string | null
  shop_region: string | null
  shop_market: string | null
  plan: string | null
  status: 'pending' | 'approved' | 'rejected' | string
  shop_number: string | null
  login_password: string | null
  created_at: string | null
}

const MARKET_LABEL: Record<string, string> = { fashion: 'apply.marketFashion', vehicle: 'apply.marketVehicle', electronics: 'apply.marketElectronics' }

export default function OpenStoreStatusPage() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [checked, setChecked] = useState(false)
  const [app, setApp] = useState<Application | null>(null)
  const [pin, setPin] = useState('')
  const [revealed, setRevealed] = useState(false)
  const [pinErr, setPinErr] = useState('')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('sn_applied_email')
      if (saved) setEmail(saved)
    } catch {}
  }, [])

  const check = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!email.trim()) return
    setLoading(true); setChecked(false); setApp(null); setRevealed(false); setPin(''); setPinErr('')
    const normalized = email.trim().toLowerCase()
    try {
      let { data } = await sb.from('pending_payments')
        .select('id, shop_name, shop_category, shop_region, shop_market, plan, status, shop_number, login_password, created_at')
        .eq('auth_email', normalized)
        .order('created_at', { ascending: false })
        .limit(1)
      if (!data || data.length === 0) {
        const res2 = await sb.from('pending_payments')
          .select('id, shop_name, shop_category, shop_region, shop_market, plan, status, shop_number, login_password, created_at')
          .eq('owner_email', normalized)
          .order('created_at', { ascending: false })
          .limit(1)
        data = res2.data
      }
      setApp((data && data[0]) as Application || null)
    } catch {
      setApp(null)
    } finally {
      setLoading(false); setChecked(true)
    }
  }

  const revealCode = () => {
    if (!app) return
    const stored = (app.login_password || '').toString()
    const match = stored === pin || stored.endsWith('-' + pin) || stored.startsWith(pin + '-') || stored.split('-').pop() === pin
    if (match) { setRevealed(true); setPinErr('') } else { setPinErr(t('status.wrongPin')) }
  }

  const statusMeta = app ? {
    pending:  { icon: Clock,        color: '#D97706', bg: 'rgba(217,119,6,0.10)',  label: t('status.pending'),  desc: t('status.pendingDesc') },
    approved: { icon: CheckCircle2, color: '#059669', bg: 'rgba(5,150,105,0.10)',  label: t('status.approved'), desc: t('status.approvedDesc') },
    rejected: { icon: XCircle,      color: '#DC2626', bg: 'rgba(220,38,38,0.10)',  label: t('status.rejected'), desc: t('status.rejectedDesc') },
  }[app.status as 'pending' | 'approved' | 'rejected'] : null

  return (
    <main style={{ fontFamily: 'var(--sn-font)', background: 'var(--sn-page)', minHeight: '100vh' }}>
      <SiteNav />

      <section style={{ maxWidth: 560, margin: '0 auto', padding: '84px 6% 5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: 'clamp(1.4rem,4vw,1.9rem)', fontWeight: 900, color: 'var(--sn-text)', marginBottom: 6 }}>{t('status.title')}</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--sn-muted)' }}>{t('status.sub')}</p>
        </div>

        {/* Email lookup form */}
        {(!checked || !app) && (
          <form onSubmit={check} style={{ background: 'var(--sn-bg)', border: '1.5px solid var(--sn-border)', borderRadius: 18, padding: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--sn-text)', marginBottom: 6 }}>{t('status.emailLabel')}</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                style={{ flex: 1, padding: '0.65rem 0.9rem', border: '1.5px solid var(--sn-input-border)', borderRadius: 10, fontSize: '0.85rem', fontFamily: 'var(--sn-font)', color: 'var(--sn-text)', background: 'var(--sn-input)', outline: 'none' }} />
              <button type="submit" disabled={loading}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--sn-primary)', color: 'var(--sn-primary-fg)', border: 'none', borderRadius: 10, padding: '0 1.1rem', fontWeight: 700, fontSize: '0.82rem', cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.75 : 1, fontFamily: 'var(--sn-font)' }}>
                {loading ? <Loader2 size={15} className="spin" /> : <Search size={15} />} {loading ? t('status.checking') : t('status.checkBtn')}
              </button>
            </div>

            {checked && !app && !loading && (
              <div style={{ marginTop: '1.1rem', textAlign: 'center' }}>
                <p style={{ fontSize: '0.82rem', color: '#DC2626', marginBottom: 10 }}>{t('status.notFound')}</p>
                <Link href="/open-store" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--sn-primary)', fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none' }}>
                  <StoreIcon size={14} /> {t('status.applyInstead')} <ArrowRight size={13} />
                </Link>
              </div>
            )}
          </form>
        )}

        {/* Application status card */}
        {app && statusMeta && (
          <div>
            <div style={{ background: 'var(--sn-bg)', border: '1.5px solid var(--sn-border)', borderRadius: 20, padding: '1.5rem', marginBottom: '1rem' }}>
              {/* Status pill */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.25rem' }}>
                <div style={{ width: 46, height: 46, borderRadius: 14, background: statusMeta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <statusMeta.icon size={22} color={statusMeta.color} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--sn-text)' }}>{app.shop_name}</div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: statusMeta.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{statusMeta.label}</div>
                </div>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--sn-muted)', lineHeight: 1.6, marginBottom: '1.25rem' }}>{statusMeta.desc}</p>

              {/* Details grid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0, borderTop: '1px solid var(--sn-border)' }}>
                <DetailRow label={t('status.marketplace')} value={app.shop_market ? t(MARKET_LABEL[app.shop_market] || '') || app.shop_market : '-'} />
                <DetailRow label={t('status.shopInfo')} value={[app.shop_category, app.shop_region].filter(Boolean).join(' · ') || '-'} />
                <DetailRow label={t('status.plan')} value={app.plan === 'premium' ? t('apply.premiumPlan') : t('apply.basicPlan')} />
                {app.created_at && <DetailRow label={t('status.appliedOn')} value={new Date(app.created_at).toLocaleDateString()} />}
              </div>
            </div>

            {/* Approved: reveal Shop/App Code */}
            {app.status === 'approved' && (
              <div style={{ background: 'var(--sn-bg)', border: '1.5px solid var(--sn-border)', borderRadius: 20, padding: '1.5rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Lock size={15} color="var(--sn-primary)" />
                  <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--sn-text)' }}>{t('status.shopCode')}</span>
                </div>

                {!revealed ? (
                  <>
                    <p style={{ fontSize: '0.78rem', color: 'var(--sn-muted)', marginBottom: 10 }}>{t('status.revealPin')}</p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input inputMode="numeric" maxLength={4} value={pin} onChange={e => { setPin(e.target.value.replace(/\D/g, '').slice(0, 4)); setPinErr('') }}
                        placeholder="••••" style={{ width: 100, textAlign: 'center', letterSpacing: '0.3em', fontWeight: 800, padding: '0.6rem', border: '1.5px solid var(--sn-input-border)', borderRadius: 10, fontSize: '0.9rem', fontFamily: 'var(--sn-font)', color: 'var(--sn-text)', background: 'var(--sn-input)', outline: 'none' }} />
                      <button onClick={revealCode} disabled={pin.length !== 4}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--sn-primary)', color: 'var(--sn-primary-fg)', border: 'none', borderRadius: 10, padding: '0 1.1rem', fontWeight: 700, fontSize: '0.82rem', cursor: pin.length === 4 ? 'pointer' : 'default', opacity: pin.length === 4 ? 1 : 0.5, fontFamily: 'var(--sn-font)' }}>
                        <Eye size={14} /> {t('status.reveal')}
                      </button>
                    </div>
                    {pinErr && <p style={{ fontSize: '0.76rem', color: '#DC2626', marginTop: 8 }}>{pinErr}</p>}
                  </>
                ) : (
                  <div style={{ background: 'var(--sn-page)', borderRadius: 12, padding: '1rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '0.08em', color: 'var(--sn-primary)', fontFamily: 'var(--sn-font)' }}>
                      {app.shop_number || '—'}
                    </div>
                  </div>
                )}

                <Link href="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: '1.1rem', background: 'var(--sn-text)', color: 'var(--sn-page)', borderRadius: 12, padding: '0.75rem', fontWeight: 800, fontSize: '0.85rem', textDecoration: 'none' }}>
                  <Store size={15} /> {t('status.goToDashboard')} <ArrowRight size={15} />
                </Link>
              </div>
            )}

            <button onClick={() => { setChecked(false); setApp(null) }}
              style={{ display: 'block', margin: '0 auto', background: 'none', border: 'none', color: 'var(--sn-subtle)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sn-font)' }}>
              {t('status.checkAnother')}
            </button>
          </div>
        )}
      </section>

      <SiteFooter />
      <style>{`.spin{animation:snspin 1s linear infinite}@keyframes snspin{to{transform:rotate(360deg)}}`}</style>
    </main>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '0.6rem 0', borderBottom: '1px solid var(--sn-border)', fontSize: '0.8rem' }}>
      <span style={{ color: 'var(--sn-subtle)' }}>{label}</span>
      <span style={{ color: 'var(--sn-text)', fontWeight: 700, textAlign: 'right' }}>{value}</span>
    </div>
  )
}
