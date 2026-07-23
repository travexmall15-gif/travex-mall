'use client'
import { useTranslation } from "@/hooks/useTranslation"

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { SiteNav } from '@/components/site-nav'
import { sb } from '@/lib/supabase'
import { ArrowLeft, Package, Filter, Loader2, AlertCircle } from 'lucide-react'

type Order = {
  id: string
  product_name: string
  store_name: string
  status: 'pending' | 'confirmed' | 'rejected'
  total_amount: number
  created_at: string
  image_url?: string
}

type Filter = 'all' | 'pending' | 'confirmed' | 'rejected'

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  pending:   { bg:'#FEF3C7', color:'#92400E', label:'Pending'   },
  confirmed: { bg:'#DCFCE7', color:'#059669', label:'Confirmed' },
  rejected:  { bg:'#FEE2E2', color:'#DC2626', label:'Rejected'  },
}

export default function OrdersPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [orders,  setOrders]  = useState<Order[]>([])
  const [filter,  setFilter]  = useState<Filter>('all')
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    sb.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) { router.replace('/auth'); return }
      const { data } = await sb
        .from('orders')
        .select('id,product_name,store_name,status,total_amount,created_at,image_url')
        .eq('buyer_id', session.user.id)
        .order('created_at', { ascending: false })
      setOrders(data || [])
      setLoading(false)
    })
  }, [router])

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)
  const counts = {
    all:       orders.length,
    pending:   orders.filter(o => o.status==='pending').length,
    confirmed: orders.filter(o => o.status==='confirmed').length,
    rejected:  orders.filter(o => o.status==='rejected').length,
  }

  return (
    <main style={{ minHeight:'100vh', background:'#F8FAFF', paddingTop:108, fontFamily:"'Inter',sans-serif" }}>
      <SiteNav />
      <div style={{ maxWidth:540, margin:'0 auto', padding:'1.5rem 5% 5rem' }}>

        <button onClick={() => router.back()}
          style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', cursor:'pointer', color:'#64748B', fontSize:'0.82rem', fontWeight:600, fontFamily:"'Inter',sans-serif", marginBottom:'1.25rem', padding:0 }}>
          <ArrowLeft size={15}/> Back
        </button>
        <h1 style={{ fontSize:'1.25rem', fontWeight:800, color:'#0D1B3E', marginBottom:'1.25rem', letterSpacing:'-0.025em' }}>{t('orders.title')}</h1>

        {/* Filter pills */}
        <div style={{ display:'flex', gap:6, marginBottom:'1.25rem', overflowX:'auto', paddingBottom:4 }}>
          {(['all','pending','confirmed','rejected'] as Filter[]).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding:'7px 14px', borderRadius:999, border:'none', cursor:'pointer', fontFamily:"'Inter',sans-serif", fontSize:'0.78rem', fontWeight:700, whiteSpace:'nowrap', flexShrink:0, transition:'all .15s',
                background: filter===f ? '#0D1B3E' : '#fff',
                color:      filter===f ? '#C9A84C'  : '#64748B',
                boxShadow:  filter===f ? 'none' : '0 1px 4px rgba(15,23,42,0.08)',
              }}>
              {f.charAt(0).toUpperCase()+f.slice(1)}
              {' '}<span style={{ fontSize:'0.7rem', opacity:0.7 }}>({counts[f]})</span>
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign:'center', padding:'4rem 0' }}>
            <Loader2 size={28} color="#0D1B3E" style={{ animation:'spin 1s linear infinite', margin:'0 auto', display:'block' }} />
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign:'center', padding:'4rem 0' }}>
            <Package size={44} color="#CBD5E1" style={{ margin:'0 auto 12px', display:'block' }} />
            <p style={{ color:'#94A3B8', fontSize:'0.875rem' }}>
              {filter==='all' ? 'No orders yet' : `No ${filter} orders`}
            </p>
          </div>
        )}

        {/* Orders list */}
        {!loading && filtered.length > 0 && (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {filtered.map(order => {
              const st = STATUS_STYLE[order.status]
              return (
                <div key={order.id} style={{ background:'#fff', borderRadius:16, border:`1.5px solid ${order.status==='rejected'?'#FEE2E2':'#E2E8F0'}`, padding:'14px 16px', boxShadow:'0 1px 4px rgba(15,23,42,0.05)' }}>
                  <div style={{ display:'flex', alignItems:'flex-start', gap:12, marginBottom:12 }}>
                    {/* Product image / icon */}
                    <div style={{ width:52, height:52, borderRadius:12, background:'#F1F5F9', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, overflow:'hidden' }}>
                      {order.image_url
                        ? <img src={order.image_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}  loading="lazy" />
                        : <Package size={22} color="#94A3B8" />}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:'0.9rem', fontWeight:700, color:'#0F172A', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{order.product_name}</div>
                      <div style={{ fontSize:'0.72rem', color:'#64748B', marginTop:2 }}>{order.store_name}</div>
                      <div style={{ fontSize:'0.72rem', color:'#94A3B8', marginTop:2 }}>{new Date(order.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</div>
                    </div>
                    <div>
                      <span style={{ fontSize:'0.7rem', fontWeight:700, padding:'4px 10px', borderRadius:999, background:st.bg, color:st.color }}>
                        {st.label}
                      </span>
                    </div>
                  </div>

                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <span style={{ fontSize:'0.9rem', fontWeight:800, color:'#0D1B3E' }}>
                      TZS {order.total_amount?.toLocaleString() || '—'}
                    </span>

                    <div style={{ display:'flex', gap:8 }}>
                      <Link href={`/orders/${order.id}`}
                        style={{ padding:'7px 14px', background:'#F1F5F9', border:'none', borderRadius:10, fontSize:'0.78rem', fontWeight:600, color:'#475569', cursor:'pointer', textDecoration:'none', display:'inline-block' }}>
                        Details
                      </Link>

                      {order.status === 'rejected' && (
                        <Link href={`/orders/${order.id}/payment`}
                          style={{ padding:'7px 14px', background:'#0D1B3E', border:'none', borderRadius:10, fontSize:'0.78rem', fontWeight:700, color:'#C9A84C', cursor:'pointer', textDecoration:'none', display:'flex', alignItems:'center', gap:5 }}>
                          <AlertCircle size={13} /> Payment & Delivery
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </main>
  )
}
