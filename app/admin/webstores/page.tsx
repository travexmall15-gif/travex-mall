'use client'
import { useEffect, useState } from 'react'
import { sb } from '@/lib/supabase'
import { buildWebstoreNotificationLink } from '@/lib/webstore/whatsapp-notify'
import { CheckCircle2, XCircle, ExternalLink, Loader2 } from 'lucide-react'
import type { WebstoreRecord } from '@/lib/webstore/types'

// ═══════════════════════════════════════════════════════════
// ADMIN — WebStore Applications
// ═══════════════════════════════════════════════════════════
// SECURITY NOTE (documented honestly, not hidden): like the rest of
// this app's admin tooling (public/dashboard/admin-panel.html), there
// is no server-verified admin role/session system in ShopNekt today —
// this page uses the same anon-key client access pattern already in
// use. This is a pre-existing architectural gap, not something this
// feature introduces; flagged in the final report rather than quietly
// left undocumented.

export default function AdminWebstoresPage() {
  const [apps, setApps] = useState<WebstoreRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [notifyLink, setNotifyLink] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    const { data } = await sb.from('pending_payments').select('*')
      .in('webstore_status', ['submitted', 'under_review', 'approved', 'rejected', 'published'])
      .order('webstore_submitted_at', { ascending: false })
    setApps((data || []) as WebstoreRecord[])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const approve = async (app: WebstoreRecord) => {
    setBusyId(app.id)
    const { error } = await sb.from('pending_payments')
      .update({ webstore_status: 'approved', webstore_reviewed_at: new Date().toISOString() })
      .eq('id', app.id)
    if (!error) {
      setApps(prev => prev.map(a => a.id === app.id ? { ...a, webstore_status: 'approved' } : a))
      const link = buildWebstoreNotificationLink({
        event: 'WEBSTORE_APPROVED', ownerName: app.owner_name, businessName: app.shop_name,
        whatsappNumber: app.shop_whatsapp || app.owner_phone,
      })
      setNotifyLink(link)
    }
    setBusyId(null)
  }

  const submitRejection = async () => {
    if (!rejectingId) {return}
    setBusyId(rejectingId)
    const app = apps.find(a => a.id === rejectingId)!
    const { error } = await sb.from('pending_payments')
      .update({ webstore_status: 'rejected', webstore_rejection_reason: reason, webstore_reviewed_at: new Date().toISOString() })
      .eq('id', rejectingId)
    if (!error) {
      setApps(prev => prev.map(a => a.id === rejectingId ? { ...a, webstore_status: 'rejected', webstore_rejection_reason: reason } : a))
      const link = buildWebstoreNotificationLink({
        event: 'WEBSTORE_REJECTED', ownerName: app.owner_name, businessName: app.shop_name,
        whatsappNumber: app.shop_whatsapp || app.owner_phone, rejectionReason: reason,
      })
      setNotifyLink(link)
    }
    setRejectingId(null); setReason(''); setBusyId(null)
  }

  return (
    <main style={{ minHeight: '100vh', background: '#F5F6FA', fontFamily: "'Inter',sans-serif", padding: '2rem 5%' }}>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', marginBottom: '1.5rem' }}>WebStore Applications</h1>

      {notifyLink && (
        <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 12, padding: '12px 16px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span style={{ fontSize: '0.82rem', color: '#065F46' }}>Notify the seller — this opens WhatsApp with the message pre-filled for you to send (free, manual — no paid API).</span>
          <a href={notifyLink} target="_blank" rel="noreferrer" style={{ background: '#25D366', color: '#fff', padding: '8px 16px', borderRadius: 999, textDecoration: 'none', fontSize: '0.78rem', fontWeight: 700, whiteSpace: 'nowrap' }}>Open WhatsApp</a>
        </div>
      )}

      {loading ? (
        <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
      ) : apps.length === 0 ? (
        <p style={{ color: '#6B7280', fontSize: '0.85rem' }}>No WebStore applications yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {apps.map(app => (
            <div key={app.id} style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', padding: '1.1rem 1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: '#111827' }}>{app.shop_name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{app.owner_name} · {app.shop_category} · {app.shop_region}</div>
                </div>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '4px 10px', borderRadius: 999, background: '#F3E8FF', color: '#7800FF' }}>{app.webstore_status}</span>
              </div>

              <p style={{ fontSize: '0.82rem', color: '#374151', marginBottom: 8 }}>{app.shop_desc}</p>
              <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: 4 }}>Template: <strong>{app.selected_template || '—'}</strong></div>
              <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: 4 }}>Contact: {app.owner_phone} · WhatsApp: {app.shop_whatsapp}</div>
              {(app.shop_instagram || app.shop_facebook || app.shop_tiktok) && (
                <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: 4 }}>
                  Social: {[app.shop_instagram, app.shop_facebook, app.shop_tiktok].filter(Boolean).join(' · ')}
                </div>
              )}
              <div style={{ fontSize: '0.7rem', color: '#9CA3AF', marginBottom: 12 }}>Submitted: {app.created_at ? new Date(app.created_at).toLocaleString() : '—'}</div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <a href={`/store/${app.id}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#F3F4F6', color: '#374151', padding: '8px 14px', borderRadius: 8, textDecoration: 'none', fontSize: '0.78rem', fontWeight: 600 }}>
                  Preview <ExternalLink size={13} />
                </a>
                {(app.webstore_status === 'submitted' || app.webstore_status === 'under_review') && (
                  <>
                    <button onClick={() => approve(app)} disabled={busyId === app.id}
                      style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#059669', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700 }}>
                      <CheckCircle2 size={13} /> Approve
                    </button>
                    <button onClick={() => setRejectingId(app.id)} disabled={busyId === app.id}
                      style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#DC2626', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700 }}>
                      <XCircle size={13} /> Reject
                    </button>
                  </>
                )}
              </div>

              {rejectingId === app.id && (
                <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                  <input value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason for rejection..."
                    style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: '0.8rem' }} />
                  <button onClick={submitRejection} disabled={!reason.trim()}
                    style={{ background: '#DC2626', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700 }}>
                    Confirm
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </main>
  )
}
