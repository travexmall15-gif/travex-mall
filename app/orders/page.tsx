'use client'
import { useTranslation } from "@/hooks/useTranslation"

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { sb } from '@/lib/supabase'
import { ArrowLeft, Package, Filter as FilterIcon, Loader2, AlertCircle } from 'lucide-react'

type Order = {
  id: string
  product_name: string
  store_name: string
  status: 'pending' | 'confirmed' | 'rejected'
  total_amount: number
  created_at: string
  image_url?: string
}

type OrderFilter = 'all' | 'pending' | 'confirmed' | 'rejected'

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  pending:   { bg:'#FEF3C7', color:'#92400E' },
  confirmed: { bg:'#059669', color:'#fff' },
  rejected:  { bg:'#DC2626', color:'#fff' },
}

export default function OrdersPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [orders,  setOrders]  = useState<Order[]>([])
  const [filter,  setFilter]  = useState<OrderFilter>('all')
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadOrders() {
      // Try Supabase Auth session first
      const { data: { session } } = await sb.auth.getSession()
      if (session?.user) {
        const { data } = await sb
          .from('orders')
          .select('id,product_name,store_name,status,total_amount,created_at,image_url')
          .eq('buyer_id', session.user.id)
          .order('created_at', { ascending: false })
        setOrders(data || [])
        setLoading(false)
        return
      }
      // Fallback: OTP customer session (localStorage)
      try {
        const raw = localStorage.getItem('sn_customer_session')
        if (raw) {
          const sess = JSON.parse(raw)
          if (sess?.id) {
            const { data } = await sb
              .from('orders')
              .select('id,product_name,store_name,status,total_amount,created_at,image_url')
              .eq('buyer_id', sess.id)
              .order('created_at', { ascending: false })
            setOrders(data || [])
            setLoading(false)
            return
          }
        }
      } catch {}
      // No session — redirect to auth
      router.replace('/auth')
    }
    loadOrders()
  }, [router])

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)
  const counts = {
    all:       orders.length,
    pending:   orders.filter(o => o.status==='pending').length,
    confirmed: orders.filter(o => o.status==='confirmed').length,
    rejected:  orders.filter(o => o.status==='rejected').length,
  }

  return (
    <main style={{ minHeight:'100vh', background:'var(--sn-page)', paddingTop:118, fontFamily:'var(--sn-font)' }}>
      <div style={{ maxWidth:540, margin:'0 auto', padding:'1.5rem 5% 5rem' }}>

        <button onClick={() => router.back()}
          style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', cursor:'pointer', color:'var(--sn-muted)', fontSize:'0.82rem', fontWeight:600, fontFamily:'var(--sn-font)', marginBottom:'1.25rem', padding:0 }}>
          <ArrowLeft size={15}/> {t('common.back')}
        </button>
        <h1 style={{ fontSize:'1.25rem', fontWeight:800, color:'var(--sn-text)', marginBottom:'1.25rem', letterSpacing:'-0.025em' }}>{t('orders.title')}</h1>

        {/* Filter pills */}
        <div style={{ display:'flex', gap:6, marginBottom:'1.25rem', overflowX:'auto', paddingBottom:4 }}>
          {(['all','pending','confirmed','rejected'] as OrderFilter[]).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding:'7px 14px', borderRadius:999, border:'none', cursor:'pointer', fontFamily:'var(--sn-font)', fontSize:'0.78rem', fontWeight:700, whiteSpace:'nowrap', flexShrink:0, transition:'all .15s',
                background: filter===f ? 'var(--sn-text)' : 'var(--sn-bg)',
                color:      filter===f ? 'var(--sn-page)'  : 'var(--sn-muted)',
                boxShadow:  filter===f ? 'none' : '0 1px 4px rgba(15,23,42,0.08)',
              }}>
              {t(`orders.${f}`)}
              {' '}<span style={{ fontSize:'0.7rem', opacity:0.7 }}>({counts[f]})</span>
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign:'center', padding:'4rem 0' }}>
            <Loader2 size={28} color="var(--sn-text)" style={{ animation:'spin 1s linear infinite', margin:'0 auto', display:'block' }} />
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign:'center', padding:'4rem 0' }}>
            <Package size={44} color="var(--sn-subtle)" style={{ margin:'0 auto 12px', display:'block' }} />
            <p style={{ color:'var(--sn-subtle)', fontSize:'0.875rem' }}>
              {filter==='all' ? t('orders.empty') : t('orders.noFilteredOrders', { status: t(`orders.${filter}`) })}
            </p>
          </div>
        )}

        {/* Orders list */}
        {!loading && filtered.length > 0 && (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {filtered.map(order => {
              const st = STATUS_STYLE[order.status]
              return (
                <div key={order.id} style={{ background:'var(--sn-bg)', borderRadius:16, border:`1.5px solid ${order.status==='rejected'?'#FEE2E2':'var(--sn-border)'}`, padding:'14px 16px', boxShadow:'0 1px 4px rgba(15,23,42,0.05)' }}>
                  <div style={{ display:'flex', alignItems:'flex-start', gap:12, marginBottom:12 }}>
                    {/* Product image / icon */}
                    <div style={{ width:52, height:52, borderRadius:12, background:'var(--sn-page)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, overflow:'hidden' }}>
                      {order.image_url
                        ? <img src={order.image_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}  loading="lazy" />
                        : <Package size={22} color="var(--sn-subtle)" />}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:'0.9rem', fontWeight:700, color:'var(--sn-text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{order.product_name}</div>
                      <div style={{ fontSize:'0.72rem', color:'var(--sn-muted)', marginTop:2 }}>{order.store_name}</div>
                      <div style={{ fontSize:'0.72rem', color:'var(--sn-subtle)', marginTop:2 }}>{new Date(order.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</div>
                    </div>
                    <div>
                      <span style={{ fontSize:'0.7rem', fontWeight:700, padding:'4px 10px', borderRadius:999, background:st.bg, color:st.color }}>
                        {t(`orders.${order.status}`)}
                      </span>
                    </div>
                  </div>

                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <span style={{ fontSize:'0.9rem', fontWeight:800, color:'var(--sn-text)' }}>
                      TZS {order.total_amount?.toLocaleString() || '—'}
                    </span>

                    <div style={{ display:'flex', gap:8 }}>
                      <Link href={`/orders/${order.id}`}
                        style={{ padding:'7px 14px', background:'var(--sn-page)', border:'none', borderRadius:10, fontSize:'0.78rem', fontWeight:600, color:'var(--sn-muted)', cursor:'pointer', textDecoration:'none', display:'inline-block' }}>
                        {t('orders.details')}
                      </Link>

                      {order.status === 'rejected' && (
                        <Link href={`/orders/${order.id}/payment`}
                          style={{ padding:'7px 14px', background:'var(--sn-page)', border:'none', borderRadius:10, fontSize:'0.78rem', fontWeight:700, color:'var(--sn-text)', cursor:'pointer', textDecoration:'none', display:'flex', alignItems:'center', gap:5 }}>
                          <AlertCircle size={13} /> {t('orders.paymentAndDelivery')}
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
