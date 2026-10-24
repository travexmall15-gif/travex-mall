'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Search, Loader2, Clock, CheckCircle2, XCircle, Rocket, ExternalLink } from 'lucide-react'
import type { WebstoreStatus } from '@/lib/webstore/types'

type App = {
  id: string
  shop_name: string
  shop_category: string | null
  webstore_status: WebstoreStatus
  webstore_rejection_reason: string | null
  owner_name: string
  shop_whatsapp: string | null
}

const STATUS_META: Record<WebstoreStatus, { label: string; color: string; icon: typeof Clock }> = {
  draft:         { label: 'Draft',         color: '#6B7280', icon: Clock },
  submitted:     { label: 'Submitted',     color: '#7800FF', icon: Clock },
  under_review:  { label: 'Under Review',  color: '#7800FF', icon: Clock },
  approved:      { label: 'Approved',      color: '#059669', icon: CheckCircle2 },
  rejected:      { label: 'Changes Needed', color: '#DC2626', icon: XCircle },
  published:     { label: 'Published',     color: '#059669', icon: Rocket },
}

export default function WebstoreDashboardPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [checked, setChecked] = useState(false)
  const [app, setApp] = useState<App | null>(null)
  const [publishing, setPublishing] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  const checkStatus = async () => {
    if (!email.trim()) {return}
    setLoading(true)
    setStatusMessage('')
    try {
      const response = await fetch(`/api/webstore/application?email=${encodeURIComponent(email.trim())}`, { cache: 'no-store' })
      const result = await response.json()
      setApp(response.ok ? result.application as App : null)
      if (!response.ok) {setStatusMessage(result.error || 'Unable to check application status.')}
    } catch {
      setApp(null)
      setStatusMessage('Unable to check application status. Please try again.')
    } finally {
      setChecked(true)
      setLoading(false)
    }
  }

  const publish = async () => {
    if (!app) {return}
    setPublishing(true)
    try {
      const response = await fetch('/api/webstore/application', { method: 'PATCH' })
      const result = await response.json()
      if (response.ok) {setApp({ ...app, webstore_status: 'published' })}
      else {setStatusMessage(result.error || 'Unable to publish this WebStore.')}
    } catch {
      setStatusMessage('Unable to publish this WebStore. Please try again.')
    } finally {
      setPublishing(false)
    }
  }

  const meta = app ? STATUS_META[app.webstore_status] : null

  return (
    <main style={{ minHeight: '100vh', background: 'var(--sn-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 5%', fontFamily: 'var(--sn-font)' }}>
      <div style={{ maxWidth: 420, width: '100%' }}>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--sn-text)', marginBottom: 6, textAlign: 'center' }}>WebStore Status</h1>
        <p style={{ fontSize: '0.82rem', color: 'var(--sn-muted)', textAlign: 'center', marginBottom: '1.5rem' }}>Check your WebStore application status</p>

        {!checked ? (
          <div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email used at submission" type="email"
                onKeyDown={e => e.key === 'Enter' && checkStatus()}
                style={{ flex: 1, padding: '11px 14px', borderRadius: 12, border: '1.5px solid var(--sn-input-border)', background: 'var(--sn-input)', color: 'var(--sn-text)', fontSize: '0.85rem', outline: 'none' }} />
              <button onClick={checkStatus} disabled={loading}
                style={{ background: 'linear-gradient(135deg,#FF0080,#7800FF)', border: 'none', borderRadius: 12, padding: '0 18px', color: '#fff', cursor: 'pointer' }}>
                {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Search size={16} />}
              </button>
            </div>
          </div>
        ) : !app ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--sn-muted)' }}>{statusMessage || 'No WebStore application found for that email.'}</p>
            <Link href="/open-store" style={{ display: 'inline-block', marginTop: 14, color: '#7800FF', fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none' }}>Start a new WebStore →</Link>
            <button onClick={() => { setChecked(false); setEmail('') }} style={{ display: 'block', margin: '10px auto 0', background: 'none', border: 'none', color: 'var(--sn-subtle)', fontSize: '0.78rem', cursor: 'pointer' }}>Try another email</button>
          </div>
        ) : (
          <div style={{ background: 'var(--sn-bg)', border: '1.5px solid var(--sn-border)', borderRadius: 16, padding: '1.25rem' }}>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--sn-text)', marginBottom: 4 }}>{app.shop_name}</div>
            {app.shop_category && <div style={{ fontSize: '0.78rem', color: 'var(--sn-subtle)', marginBottom: 14 }}>{app.shop_category}</div>}

            {meta && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `${meta.color}15`, color: meta.color, padding: '6px 14px', borderRadius: 999, fontSize: '0.78rem', fontWeight: 700, marginBottom: 16 }}>
                <meta.icon size={14} /> {meta.label}
              </div>
            )}

            {app.webstore_status === 'under_review' || app.webstore_status === 'submitted' ? (
              <p style={{ fontSize: '0.82rem', color: 'var(--sn-muted)', lineHeight: 1.6 }}>
                Your WebStore has been submitted and is awaiting admin review. You&apos;ll be notified once it&apos;s reviewed.
              </p>
            ) : app.webstore_status === 'rejected' ? (
              <div>
                {app.webstore_rejection_reason && (
                  <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 12px', marginBottom: 14 }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#991B1B', marginBottom: 3 }}>Reason from ShopNekt</div>
                    <div style={{ fontSize: '0.8rem', color: '#7F1D1D' }}>{app.webstore_rejection_reason}</div>
                  </div>
                )}
                <Link href="/open-store" style={{ display: 'block', textAlign: 'center', background: 'linear-gradient(135deg,#FF0080,#7800FF)', color: '#fff', padding: '11px', borderRadius: 999, textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem' }}>
                  Edit & Resubmit
                </Link>
              </div>
            ) : app.webstore_status === 'approved' ? (
              <div>
                <p style={{ fontSize: '0.82rem', color: 'var(--sn-muted)', lineHeight: 1.6, marginBottom: 14 }}>
                  Your WebStore has been approved! Publish it to make it live in the marketplace.
                </p>
                <button onClick={publish} disabled={publishing}
                  style={{ width: '100%', background: 'linear-gradient(135deg,#FF0080,#7800FF)', color: '#fff', border: 'none', padding: '12px', borderRadius: 999, fontWeight: 700, fontSize: '0.85rem', cursor: publishing ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  {publishing ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Rocket size={15} />} Publish WebStore
                </button>
              </div>
            ) : app.webstore_status === 'published' ? (
              <Link href={`/store/${app.id}`} target="_blank" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'linear-gradient(135deg,#FF0080,#7800FF)', color: '#fff', padding: '11px', borderRadius: 999, textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem' }}>
                Visit WebStore <ExternalLink size={14} />
              </Link>
            ) : null}
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </main>
  )
}
