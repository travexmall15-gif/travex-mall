'use client'
import { useTranslation } from '@/hooks/useTranslation'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { sb } from '@/lib/supabase'
import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { Zap, Clock, ShoppingCart, ArrowLeft } from 'lucide-react'

type Deal = {
  id: string; store_id: string; shop_name: string
  product_name: string; product_image: string | null
  original_price: number; deal_price: number; discount_pct: number
  ends_at: string; max_orders: number; current_orders: number; status: string
}

function useCountdown(endTime: string) {
  const calc = useCallback(() => {
    const diff = new Date(endTime).getTime() - Date.now()
    if (diff <= 0) return { h: '00', m: '00', s: '00', done: true }
    const h = Math.floor(diff / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    const s = Math.floor((diff % 60000) / 1000)
    return { h: String(h).padStart(2,'0'), m: String(m).padStart(2,'0'), s: String(s).padStart(2,'0'), done: false }
  }, [endTime])

  const [time, setTime] = useState(calc())
  useEffect(() => {
    const t = setInterval(() => setTime(calc()), 1000)
    return () => clearInterval(t)
  }, [calc])
  return time
}

function DealCard({ deal }: { deal: Deal }) {
  const time = useCountdown(deal.ends_at)
  const sold  = Math.round((deal.current_orders / deal.max_orders) * 100)
  const fmt   = (n: number) => 'TZS ' + Number(n).toLocaleString()

  return (
    <div style={{ background:'#fff', border:'2px solid #FEF3C7', borderRadius:16,
      overflow:'hidden', boxShadow:'0 4px 20px rgba(234,179,8,0.12)',
      transition:'all .25s' }}>
      {/* Image */}
      <div style={{ position:'relative', height:180, background:'linear-gradient(135deg,#FEF3C7,#FDE68A)' }}>
        {deal.product_image
          ? <Image src={deal.product_image} alt={deal.product_name} fill className="object-cover" />
          : <div style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:48 }}></div>
        }
        {/* Discount badge */}
        <div style={{ position:'absolute', top:10, right:10, background:'#EF4444',
          color:'#fff', fontWeight:900, fontSize:13, padding:'4px 10px',
          borderRadius:999 }}>
          -{deal.discount_pct}%
        </div>
        {/* Timer */}
        <div style={{ position:'absolute', bottom:10, left:10, background:'rgba(0,0,0,0.75)',
          color:'#fff', borderRadius:8, padding:'6px 10px',
          display:'flex', alignItems:'center', gap:6, fontSize:13, fontWeight:700 }}>
          <Clock size={13} />
          {time.done ? ' Ended' : `${time.h}:${time.m}:${time.s}`}
        </div>
      </div>

      <div style={{ padding:'1rem' }}>
        <div style={{ fontSize:11, color:'#92400E', fontWeight:700,
          textTransform:'uppercase', letterSpacing:'.06em', marginBottom:4 }}>
          {deal.shop_name}
        </div>
        <div style={{ fontFamily:"'Inter',sans-serif", fontSize:'1rem',
          fontWeight:800, color:'#0F172A', marginBottom:10 }}>
          {deal.product_name}
        </div>

        {/* Prices */}
        <div style={{ display:'flex', alignItems:'baseline', gap:8, marginBottom:10 }}>
          <span style={{ fontSize:20, fontWeight:900, color:'#EF4444' }}>{fmt(deal.deal_price)}</span>
          <span style={{ fontSize:13, textDecoration:'line-through', color:'#94A3B8' }}>{fmt(deal.original_price)}</span>
        </div>

        {/* Progress */}
        <div style={{ marginBottom:12 }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:11,
            color:'#64748B', marginBottom:4 }}>
            <span>{deal.current_orders} orders</span>
            <span>{deal.max_orders - deal.current_orders} left</span>
          </div>
          <div style={{ height:6, background:'#F1F5F9', borderRadius:999 }}>
            <div style={{ height:'100%', width:`${sold}%`, borderRadius:999,
              background:`linear-gradient(90deg,#F59E0B,#EF4444)`,
              transition:'width .5s' }} />
          </div>
        </div>

        <Link href={`/store/${deal.store_id}`}
          style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6,
            background:'linear-gradient(135deg,#F59E0B,#EF4444)', color:'#fff',
            borderRadius:999, padding:'11px', fontWeight:800, fontSize:13,
            textDecoration:'none', boxShadow:'0 4px 14px rgba(245,158,11,0.4)' }}>
          <Zap size={14} /> Grab This Deal
        </Link>
      </div>
    </div>
  )
}

export default function FlashDealsPage() {
  const { t } = useTranslation()
  const [deals, setDeals]   = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    sb.from('flash_deals')
      .select('*')
      .eq('status','active')
      .gt('ends_at', new Date().toISOString())
      .order('ends_at', { ascending: true })
      .then(({ data }) => { setDeals(data||[]); setLoading(false) })
  }, [])

  return (
    <main style={{ minHeight:'100vh', background:'#FFFBEB' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        *{box-sizing:border-box}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
      `}</style>
      <SiteNav />

      {/* Hero */}
      <div style={{ paddingTop:64, background:'linear-gradient(135deg,#92400E,#B45309)', color:'#fff' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'2rem 5%',
          display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
          <div>
            <Link href="/market" style={{ display:'inline-flex', alignItems:'center', gap:6,
              color:'rgba(255,255,255,0.7)', textDecoration:'none', fontSize:13, marginBottom:12 }}>
              <ArrowLeft size={14} /> Back to Market
            </Link>
            <div style={{ display:'inline-flex', alignItems:'center', gap:6, marginBottom:8,
              background:'rgba(255,255,255,0.15)', padding:'4px 12px', borderRadius:999,
              fontSize:11, fontWeight:700 }}>
              <Zap size={12} /> FLASH DEALS, LIMITED TIME
            </div>
            <h1 style={{ fontFamily:"'Inter',sans-serif", fontSize:'clamp(1.8rem,4vw,2.8rem)',
              fontWeight:900, marginBottom:8 }}> {t('flash.featuredDeal')}</h1>
            <p style={{ color:'rgba(255,255,255,0.75)', fontSize:14 }}>
              Huge discounts for a limited time only. Grab them before they expire!
            </p>
          </div>
          <div style={{ background:'rgba(255,255,255,0.15)', borderRadius:16, padding:'1rem 1.5rem',
            textAlign:'center', backdropFilter:'blur(10px)' }}>
            <div style={{ fontSize:28, fontWeight:900 }}>{deals.length}</div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.7)' }}>{t('flash.activeDeals')}</div>
          </div>
        </div>
      </div>

      {/* Deals grid */}
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'2rem 5% 5rem' }}>
        {loading ? (
          <div style={{ textAlign:'center', padding:'4rem 0', color:'#92400E' }}>
            <div style={{ fontSize:32, animation:'pulse 1.5s infinite', marginBottom:12 }}></div>
            <p>Loading deals...</p>
          </div>
        ) : deals.length === 0 ? (
          <div style={{ textAlign:'center', padding:'5rem 0' }}>
            <div style={{ fontSize:56, marginBottom:16 }}></div>
            <h2 style={{ fontFamily:"'Inter',sans-serif", color:'#0F172A', marginBottom:8 }}>
              {t('flash.noDeals')}
            </h2>
            <p style={{ color:'#64748B', marginBottom:24 }}>
              Check back soon! Sellers post new deals every day.
            </p>
            <Link href="/market" style={{ background:'#F59E0B', color:'#fff',
              padding:'12px 28px', borderRadius:999, fontWeight:700, textDecoration:'none', fontSize:14 }}>
              Browse Market
            </Link>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'1.25rem' }}>
            {deals.map(d => <DealCard key={d.id} deal={d} />)}
          </div>
        )}
      </div>
      <SiteFooter />
    </main>
  )
}
