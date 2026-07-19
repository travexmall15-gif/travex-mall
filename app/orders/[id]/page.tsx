'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { SiteNav } from '@/components/site-nav'
import { sb } from '@/lib/supabase'
import { ArrowLeft, Package, Store, Loader2, AlertCircle } from 'lucide-react'

const STATUS_STYLE: Record<string, { bg:string; color:string; label:string; desc:string }> = {
  pending:          { bg:'#FEF3C7', color:'#92400E', label:'Pending',          desc:'Waiting for seller to confirm' },
  confirmed:        { bg:'#DCFCE7', color:'#059669', label:'Confirmed',        desc:'Seller confirmed — preparing' },
  rejected:         { bg:'#FEE2E2', color:'#DC2626', label:'Rejected',         desc:'Seller rejected — proceed with payment to reorder' },
  payment_pending:  { bg:'#EFF6FF', color:'#1D4ED8', label:'Payment Pending',  desc:'Payment submitted, awaiting confirmation' },
  delivered:        { bg:'#F0FDF4', color:'#059669', label:'Delivered',        desc:'Order delivered successfully' },
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router  = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    sb.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) { router.replace('/auth'); return }
      const { data } = await sb.from('orders').select('*').eq('id', id).single()
      setOrder(data)
      setLoading(false)
    })
  }, [id, router])

  if (loading) return (
    <main style={{ minHeight:'100vh', background:'#F8FAFF', paddingTop:108, fontFamily:"'Inter',sans-serif" }}>
      <SiteNav />
      <div style={{ textAlign:'center', padding:'5rem 0' }}>
        <Loader2 size={30} color="#0D1B3E" style={{ animation:'spin 1s linear infinite', margin:'0 auto', display:'block' }} />
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </main>
  )

  const st = STATUS_STYLE[order?.status] || STATUS_STYLE.pending

  return (
    <main style={{ minHeight:'100vh', background:'#F8FAFF', paddingTop:108, fontFamily:"'Inter',sans-serif" }}>
      <SiteNav />
      <div style={{ maxWidth:520, margin:'0 auto', padding:'1.5rem 5% 5rem' }}>
        <button onClick={() => router.back()}
          style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', cursor:'pointer', color:'#64748B', fontSize:'0.82rem', fontWeight:600, fontFamily:"'Inter',sans-serif", marginBottom:'1.25rem', padding:0 }}>
          <ArrowLeft size={15}/> Back
        </button>

        <h1 style={{ fontSize:'1.1rem', fontWeight:800, color:'#0D1B3E', marginBottom:'1.25rem' }}>Order Details</h1>

        {/* Status banner */}
        <div style={{ background: st.bg, border:`1.5px solid ${st.color}30`, borderRadius:14, padding:'14px 16px', marginBottom:'1.25rem', display:'flex', gap:12, alignItems:'flex-start' }}>
          <div style={{ width:10, height:10, borderRadius:'50%', background:st.color, marginTop:4, flexShrink:0 }} />
          <div>
            <div style={{ fontSize:'0.9rem', fontWeight:800, color:st.color }}>{st.label}</div>
            <div style={{ fontSize:'0.75rem', color:st.color, opacity:0.8, marginTop:2 }}>{st.desc}</div>
          </div>
        </div>

        {/* Order info */}
        <div style={{ background:'#fff', borderRadius:16, border:'1.5px solid #E2E8F0', overflow:'hidden', marginBottom:'1.1rem' }}>
          <div style={{ padding:'14px 16px', borderBottom:'1px solid #F1F5F9', display:'flex', gap:12 }}>
            <div style={{ width:56, height:56, borderRadius:12, background:'#F1F5F9', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, overflow:'hidden' }}>
              {order?.image_url ? <img src={order.image_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <Package size={24} color="#94A3B8" />}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:'0.95rem', fontWeight:700, color:'#0F172A' }}>{order?.product_name}</div>
              <div style={{ fontSize:'0.75rem', color:'#64748B', marginTop:3, display:'flex', alignItems:'center', gap:5 }}>
                <Store size={12}/> {order?.store_name}
              </div>
            </div>
          </div>

          {[
            { label:'Order ID',    value:`#${order?.id?.slice(-8).toUpperCase()}` },
            { label:'Amount',      value:`TZS ${order?.total_amount?.toLocaleString() || '—'}` },
            { label:'Quantity',    value: order?.quantity || 1 },
            { label:'Date',        value: new Date(order?.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}) },
          ].map((row, i) => (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'11px 16px', borderBottom: i<3?'1px solid #F1F5F9':'none' }}>
              <span style={{ fontSize:'0.78rem', color:'#94A3B8', fontWeight:600 }}>{row.label}</span>
              <span style={{ fontSize:'0.82rem', color:'#0F172A', fontWeight:700 }}>{row.value}</span>
            </div>
          ))}
        </div>

        {/* Payment & Delivery button for rejected */}
        {order?.status === 'rejected' && (
          <div style={{ background:'#FFF1F2', border:'1.5px solid #FEE2E2', borderRadius:14, padding:'14px 16px', marginBottom:'1rem' }}>
            <div style={{ display:'flex', gap:10, marginBottom:12 }}>
              <AlertCircle size={16} color="#EF4444" style={{ flexShrink:0, marginTop:1 }} />
              <p style={{ fontSize:'0.78rem', color:'#92400E', lineHeight:1.55, margin:0 }}>
                This order was rejected. You can proceed with payment and delivery arrangements to complete your purchase.
              </p>
            </div>
            <Link href={`/orders/${id}/payment`}
              style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'12px', background:'#0D1B3E', color:'#C9A84C', borderRadius:12, textDecoration:'none', fontWeight:700, fontSize:'0.875rem' }}>
              Proceed to Payment & Delivery →
            </Link>
          </div>
        )}

        {/* Confirm delivery (for confirmed/delivered) */}
        {order?.status === 'payment_pending' && (
          <div style={{ background:'#EFF6FF', border:'1.5px solid #BFDBFE', borderRadius:14, padding:'14px 16px' }}>
            <p style={{ fontSize:'0.78rem', color:'#1D4ED8', marginBottom:12, lineHeight:1.5 }}>
              Payment submitted. When you receive your item, confirm delivery to release payment to seller.
            </p>
            <button
              onClick={async () => {
                await sb.from('orders').update({ status:'delivered' }).eq('id', id)
                setOrder((o: any) => ({ ...o, status:'delivered' }))
              }}
              style={{ width:'100%', padding:'11px', background:'#059669', border:'none', borderRadius:12, color:'#fff', fontWeight:700, fontSize:'0.875rem', cursor:'pointer', fontFamily:"'Inter',sans-serif" }}>
              ✅ Confirm I Received My Item
            </button>
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </main>
  )
}
