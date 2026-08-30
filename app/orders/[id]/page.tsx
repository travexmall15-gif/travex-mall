'use client'
import { useTranslation } from "@/hooks/useTranslation"

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { sb } from '@/lib/supabase'
import { ArrowLeft, Package, Store, Loader2, AlertCircle } from 'lucide-react'

export default function OrderDetailPage({params }: { params: Promise<{ id: string }> }) {
  const { t } = useTranslation()
  const { id } = use(params)
  const router  = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const STATUS_META: Record<string, { bg:string; color:string; label:string; desc:string }> = {
    pending:          { bg:'#FEF3C7', color:'#92400E', label:t('orders.pending'),         desc:t('orders.statusPendingDesc') },
    confirmed:        { bg:'#059669', color:'#fff',    label:t('orders.confirmed'),       desc:t('orders.statusConfirmedDesc') },
    rejected:         { bg:'#DC2626', color:'#fff',    label:t('orders.rejected'),        desc:t('orders.statusRejectedDesc') },
    payment_pending:  { bg:'#1D4ED8', color:'#fff',    label:t('orders.paymentPending'),  desc:t('orders.statusPaymentPendingDesc') },
    delivered:        { bg:'#059669', color:'#fff',    label:t('orders.delivered'),       desc:t('orders.statusDeliveredDesc') },
  }

  useEffect(() => {
    sb.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) { router.replace('/auth'); return }
      const { data } = await sb.from('orders').select('*').eq('id', id).single()
      setOrder(data)
      setLoading(false)
    })
  }, [id, router])

  if (loading) {return (
    <main style={{ minHeight:'100vh', background:'var(--sn-page)', paddingTop:118, fontFamily:'var(--sn-font)' }}>
      <div style={{ textAlign:'center', padding:'5rem 0' }}>
        <Loader2 size={30} color="var(--sn-text)" style={{ animation:'spin 1s linear infinite', margin:'0 auto', display:'block' }} />
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </main>
  )}

  const st = STATUS_META[order?.status] || STATUS_META.pending

  return (
    <main style={{ minHeight:'100vh', background:'var(--sn-page)', paddingTop:118, fontFamily:'var(--sn-font)' }}>
      <div style={{ maxWidth:520, margin:'0 auto', padding:'1.5rem 5% 5rem' }}>
        <button onClick={() => router.back()}
          style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', cursor:'pointer', color:'var(--sn-muted)', fontSize:'0.82rem', fontWeight:600, fontFamily:'var(--sn-font)', marginBottom:'1.25rem', padding:0 }}>
          <ArrowLeft size={15}/> {t('common.back')}
        </button>

        <h1 style={{ fontSize:'1.1rem', fontWeight:800, color:'var(--sn-text)', marginBottom:'1.25rem' }}>{t('orders.orderDetails')}</h1>

        {/* Status banner */}
        <div style={{ background: st.bg, border:`1.5px solid ${st.color}30`, borderRadius:14, padding:'14px 16px', marginBottom:'1.25rem', display:'flex', gap:12, alignItems:'flex-start' }}>
          <div style={{ width:10, height:10, borderRadius:'50%', background:st.color, marginTop:4, flexShrink:0 }} />
          <div>
            <div style={{ fontSize:'0.9rem', fontWeight:800, color:st.color }}>{st.label}</div>
            <div style={{ fontSize:'0.75rem', color:st.color, opacity:0.8, marginTop:2 }}>{st.desc}</div>
          </div>
        </div>

        {/* Order info */}
        <div style={{ background:'var(--sn-bg)', borderRadius:16, border:'1.5px solid var(--sn-border)', overflow:'hidden', marginBottom:'1.1rem' }}>
          <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--sn-border)', display:'flex', gap:12 }}>
            <div style={{ width:56, height:56, borderRadius:12, background:'var(--sn-page)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, overflow:'hidden' }}>
              {order?.image_url ? <img src={order.image_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}  loading="lazy" /> : <Package size={24} color="var(--sn-subtle)" />}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:'0.95rem', fontWeight:700, color:'var(--sn-text)' }}>{order?.product_name}</div>
              <div style={{ fontSize:'0.75rem', color:'var(--sn-muted)', marginTop:3, display:'flex', alignItems:'center', gap:5 }}>
                <Store size={12}/> {order?.store_name}
              </div>
            </div>
          </div>

          {[
            { label:t('orders.orderId'),  value:`#${order?.id?.slice(-8).toUpperCase()}` },
            { label:t('orders.amount'),   value:`TZS ${order?.total_amount?.toLocaleString() || '—'}` },
            { label:t('orders.quantity'), value: order?.quantity || 1 },
            { label:t('orders.date'),     value: new Date(order?.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}) },
          ].map((row, i) => (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'11px 16px', borderBottom: i<3?'1px solid var(--sn-border)':'none' }}>
              <span style={{ fontSize:'0.78rem', color:'var(--sn-subtle)', fontWeight:600 }}>{row.label}</span>
              <span style={{ fontSize:'0.82rem', color:'var(--sn-text)', fontWeight:700 }}>{row.value}</span>
            </div>
          ))}
        </div>

        {/* Payment & Delivery button for rejected */}
        {order?.status === 'rejected' && (
          <div style={{ background:'#FFF1F2', border:'1.5px solid #FEE2E2', borderRadius:14, padding:'14px 16px', marginBottom:'1rem' }}>
            <div style={{ display:'flex', gap:10, marginBottom:12 }}>
              <AlertCircle size={16} color="#EF4444" style={{ flexShrink:0, marginTop:1 }} />
              <p style={{ fontSize:'0.78rem', color:'#92400E', lineHeight:1.55, margin:0 }}>
                {t('orders.rejectedNotice')}
              </p>
            </div>
            <Link href={`/orders/${id}/payment`}
              style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'12px', background:'var(--sn-text)', color:'var(--sn-page)', borderRadius:12, textDecoration:'none', fontWeight:700, fontSize:'0.875rem' }}>
              {t('orders.proceedToPayment')} →
            </Link>
          </div>
        )}

        {/* Confirm delivery (for confirmed/delivered) */}
        {order?.status === 'payment_pending' && (
          <div style={{ background:'var(--sn-bg)', border:'1.5px solid #BFDBFE', borderRadius:14, padding:'14px 16px' }}>
            <p style={{ fontSize:'0.78rem', color:'var(--sn-text)', marginBottom:12, lineHeight:1.5 }}>
              {t('orders.paymentSubmittedNotice')}
            </p>
            <button
              onClick={async () => {
                await sb.from('orders').update({ status:'delivered' }).eq('id', id)
                setOrder((o: any) => ({ ...o, status:'delivered' }))
              }}
              style={{ width:'100%', padding:'11px', background:'#059669', border:'none', borderRadius:12, color: '#fff', fontWeight:700, fontSize:'0.875rem', cursor:'pointer', fontFamily:'var(--sn-font)' }}>
              ✅ {t('orders.confirmReceived')}
            </button>
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </main>
  )
}
