'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslation } from '@/hooks/useTranslation'
import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { sb } from '@/lib/supabase'
import { Zap, Clock, Store, ArrowLeft, ShoppingBag, TrendingUp, AlertCircle } from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────
type Deal = {
  id: string
  store_id: string
  shop_name: string
  product_name: string
  product_image: string | null
  original_price: number
  deal_price: number
  discount_pct: number
  ends_at: string
  max_orders: number
  current_orders: number
  status: string
}

// ── Countdown hook ────────────────────────────────────────────
function useCountdown(endTime: string) {
  const calc = useCallback(() => {
    const diff = new Date(endTime).getTime() - Date.now()
    if (diff <= 0) return { h: '00', m: '00', s: '00', done: true }
    const h = Math.floor(diff / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    const s = Math.floor((diff % 60000) / 1000)
    return {
      h: String(h).padStart(2, '0'),
      m: String(m).padStart(2, '0'),
      s: String(s).padStart(2, '0'),
      done: false,
    }
  }, [endTime])

  const [time, setTime] = useState(calc())
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000)
    return () => clearInterval(id)
  }, [calc])
  return time
}

// ── Format price ──────────────────────────────────────────────
const fmtTZS = (n: number) => 'TZS ' + Number(n).toLocaleString('en-US')

// ── Urgency level from stock ──────────────────────────────────
function urgencyLevel(deal: Deal): 'high' | 'med' | 'new' | 'normal' {
  const soldPct = (deal.current_orders / deal.max_orders) * 100
  const minsLeft = (new Date(deal.ends_at).getTime() - Date.now()) / 60000
  if (soldPct >= 80) return 'high'
  if (minsLeft < 120) return 'med'
  const isNew = (Date.now() - (Date.now() - 86400000)) > 0 && deal.current_orders === 0
  return 'normal'
}

// ── Deal Card ─────────────────────────────────────────────────
function DealCard({ deal, featured = false }: { deal: Deal; featured?: boolean }) {
  const { t } = useTranslation()      // ← critical: own hook for instant re-render
  const time   = useCountdown(deal.ends_at)
  const sold   = Math.round((deal.current_orders / deal.max_orders) * 100)
  const left   = deal.max_orders - deal.current_orders
  const saves  = deal.original_price - deal.deal_price
  const urge   = urgencyLevel(deal)
  const isEndingSoon = (new Date(deal.ends_at).getTime() - Date.now()) < 7200000

  return (
    <article style={{
      background: 'var(--sn-bg)',
      border: featured ? '2px solid #1D4ED8' : '1.5px solid #E5E7EB',
      borderRadius: featured ? 24 : 20,
      overflow: 'hidden',
      boxShadow: featured
        ? '0 20px 60px rgba(13,27,62,0.35), 0 0 0 1px rgba(29,78,216,0.15)'
        : '0 4px 20px rgba(234,179,8,0.10)',
      transition: 'all .25s',
      position: 'relative',
    }}
    onMouseOver={e => {
      const el = e.currentTarget as HTMLElement
      el.style.transform = 'translateY(-4px)'
      el.style.boxShadow = featured
        ? '0 28px 64px rgba(13,27,62,0.45)'
        : '0 12px 32px rgba(234,179,8,0.18)'
    }}
    onMouseOut={e => {
      const el = e.currentTarget as HTMLElement
      el.style.transform = 'translateY(0)'
      el.style.boxShadow = featured
        ? '0 20px 60px rgba(13,27,62,0.35)'
        : '0 4px 20px rgba(234,179,8,0.10)'
    }}>

      {/* Urgency ribbon */}
      {isEndingSoon && !time.done && (
        <div style={{ position:'absolute', top:0, left:0, right:0, height:3,
          background:'linear-gradient(90deg,#EF4444,#F97316,#EF4444)',
          backgroundSize:'200% 100%', zIndex:2 }} />
      )}

      {/* Image */}
      <div style={{ position:'relative', height: featured ? 240 : 188,
        background: featured ? '#F3F4F6' : 'linear-gradient(135deg,#FEF3C7,#FDE68A)',
        overflow:'hidden' }}>

        {deal.product_image ? (
          <Image src={deal.product_image} alt={deal.product_name} fill
            style={{ objectFit:'cover', transition:'transform .4s' }} />
        ) : (
          <div style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <ShoppingBag size={featured ? 56 : 44} color={featured ? 'rgba(29,78,216,0.3)' : 'rgba(245,158,11,0.3)'} />
          </div>
        )}

        {/* Overlay gradient */}
        <div style={{ position:'absolute', inset:0,
          background:'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)' }} />

        {/* Discount badge */}
        <div style={{ position:'absolute', top:12, left:12,
          background:'linear-gradient(135deg,#EF4444,#DC2626)',
          color:'#fff', fontWeight:900, fontSize: featured ? 15 : 13,
          padding:'5px 12px', borderRadius:999,
          boxShadow:'0 4px 12px rgba(239,68,68,0.4)',
          letterSpacing:'-0.02em' }}>
          -{deal.discount_pct}% {t('flash.off')}
        </div>

        {/* Urgency badge */}
        {urge === 'high' && (
          <div style={{ position:'absolute', top:12, right:12,
            background:'#EF4444',
            color:'#fff', fontSize:10, fontWeight:800, padding:'3px 9px', borderRadius:999,
            display:'flex', alignItems:'center', gap:3, letterSpacing:'0.04em' }}>
            <AlertCircle size={9} /> {t('flash.urgencyLow')}
          </div>
        )}
        {urge === 'med' && isEndingSoon && (
          <div style={{ position:'absolute', top:12, right:12,
            background:'#F97316',
            color:'#fff', fontSize:10, fontWeight:800, padding:'3px 9px', borderRadius:999,
            letterSpacing:'0.04em' }}>
            {t('flash.endingSoon')}
          </div>
        )}

        {/* Countdown on image */}
        <div style={{ position:'absolute', bottom:10, left:10,
          background: time.done ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0.80)',
          backdropFilter:'blur(8px)',
          borderRadius:10, padding:'6px 12px',
          display:'flex', alignItems:'center', gap:6 }}>
          {time.done ? (
            <span style={{ color:'#FCA5A5', fontSize:12, fontWeight:700 }}>{t('flash.dealEnded')}</span>
          ) : (
            <div style={{ display:'flex', alignItems:'center', gap:4 }}>
              <Clock size={11} color={isEndingSoon ? '#FCA5A5' : '#FCD34D'} />
              {[
                { val: time.h, label: t('flash.hours') },
                { val: time.m, label: t('flash.mins') },
                { val: time.s, label: t('flash.secs') },
              ].map((u, i) => (
                <span key={i} style={{ display:'flex', alignItems:'flex-end', gap:1 }}>
                  {i > 0 && <span style={{ color:isEndingSoon?'#EF4444':'#374151', fontSize:11, fontWeight:700, margin:'0 1px' }}>:</span>}
                  <span style={{ display:'flex', flexDirection:'column' as const, alignItems:'center' }}>
                    <span style={{ fontSize:13, fontWeight:900, color:isEndingSoon?'#FCA5A5':'#fff', lineHeight:1 }}>{u.val}</span>
                    <span style={{ fontSize:8, color:'var(--sn-subtle)', textTransform:'uppercase' as const, letterSpacing:'0.04em' }}>{u.label}</span>
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: featured ? '1.25rem 1.25rem 1.25rem' : '1rem' }}>

        {/* Shop name */}
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.06em', marginBottom:5,
          color: featured ? '#1D4ED8' : '#374151',
          textTransform:'uppercase' as const, display:'flex', alignItems:'center', gap:4 }}>
          <Store size={9} /> {deal.shop_name}
        </div>

        {/* Product name */}
        <div style={{ fontSize: featured ? '1.1rem' : '0.95rem', fontWeight:800,
          color: 'var(--sn-text)',
          lineHeight:1.3, marginBottom:10, letterSpacing:'-0.02em' }}>
          {deal.product_name}
        </div>

        {/* Prices */}
        <div style={{ display:'flex', alignItems:'baseline', gap:10, marginBottom:4, flexWrap:'wrap' }}>
          <span style={{ fontSize: featured ? 22 : 18, fontWeight:900, color:'#EF4444', letterSpacing:'-0.02em' }}>
            {fmtTZS(deal.deal_price)}
          </span>
          <span style={{ fontSize:12, textDecoration:'line-through', color: 'var(--sn-subtle)' }}>
            {fmtTZS(deal.original_price)}
          </span>
        </div>

        {/* You save */}
        <div style={{ fontSize:11, fontWeight:700, marginBottom:12,
          color: '#059669' }}>
          {t('flash.youSave')} {fmtTZS(saves)}
        </div>

        {/* Stock progress */}
        <div style={{ marginBottom:14 }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:11,
            color: 'var(--sn-muted)', marginBottom:5 }}>
            <span>{t('flash.ordersCount', { count: String(deal.current_orders) })}</span>
            <span style={{ fontWeight:700, color: left <= 5 ? '#EF4444' : '#374151' }}>
              {t('flash.leftCount', { count: String(left) })}
            </span>
          </div>
          <div style={{ height:5, background: featured ? 'rgba(255,255,255,0.10)' : '#F3F4F6', borderRadius:999, overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${sold}%`, borderRadius:999,
              background: sold >= 80
                ? 'linear-gradient(90deg,#EF4444,#DC2626)'
                : 'linear-gradient(90deg,#F59E0B,#EF4444)',
              transition:'width .5s' }} />
          </div>
        </div>

        {/* CTA */}
        <Link href={`/store/${deal.store_id}`}
          style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:7,
            background: featured
              ? 'linear-gradient(135deg,#1D4ED8,#F0C96B)'
              : 'linear-gradient(135deg,#F59E0B,#EF4444)',
            color: featured ? '#0F172A' : '#fff',
            borderRadius:999, padding:'12px 20px',
            fontWeight:800, fontSize:14,
            textDecoration:'none',
            boxShadow: featured
              ? '0 8px 24px rgba(29,78,216,0.35)'
              : '0 4px 16px rgba(245,158,11,0.40)',
            letterSpacing:'-0.01em',
            transition:'all .2s' }}
          onMouseOver={e => { (e.currentTarget as HTMLElement).style.transform='scale(1.02)' }}
          onMouseOut={e  => { (e.currentTarget as HTMLElement).style.transform='scale(1)' }}>
          <Zap size={14} /> {t('flash.grabDeal')}
        </Link>
      </div>
    </article>
  )
}

// ── Main Page ─────────────────────────────────────────────────
export default function FlashDealsPage() {
  const { t } = useTranslation()
  const [deals, setDeals]     = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    sb.from('flash_deals')
      .select('*')
      .eq('status', 'active')
      .gt('ends_at', new Date().toISOString())
      .order('ends_at', { ascending: true })
      .then(({ data }) => { setDeals(data || []); setLoading(false) })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const featured     = deals[0] || null
  const rest         = deals.slice(1)
  const endingSoon   = rest.filter(d => (new Date(d.ends_at).getTime() - Date.now()) < 7200000)
  const others       = rest.filter(d => (new Date(d.ends_at).getTime() - Date.now()) >= 7200000)
  const totalSavings = deals.reduce((a, d) => a + (d.original_price - d.deal_price), 0)

  return (
    <main style={{ minHeight:'100vh', background:'var(--sn-page)', fontFamily:'var(--sn-font)' }}>
      <style>{`
        @keyframes shimmer { 0%{background-position:200%} 100%{background-position:-200%} }
        @keyframes pulse   { 50%{opacity:.5} }
        @keyframes fadeIn  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes zap     { 50%{transform:scale(1.15)} }
        * { box-sizing: border-box; }
        .deal-grid { display:grid; gap:1.1rem; }
        @media (min-width:640px)  { .deal-grid { grid-template-columns:repeat(2,1fr); } }
        @media (min-width:1024px) { .deal-grid { grid-template-columns:repeat(3,1fr); } }
      `}</style>

      <SiteNav />

      {/* ── CONTENT ───────────────────────────────────────────── */}
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'5.5rem 5% 4rem' }}>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign:'center', padding:'6rem 0' }}>
            <div style={{ fontSize:40, marginBottom:14 }}>⚡</div>
            <p style={{ color:'#92400E', fontSize:15, fontWeight:500 }}>{t('flash.loading')}</p>
          </div>
        )}

        {/* Empty */}
        {!loading && deals.length === 0 && (
          <div style={{ textAlign:'center', padding:'6rem 0' }}>
            <div style={{ width:80, height:80, borderRadius:'24px', background:'linear-gradient(135deg,#FEF3C7,#FDE68A)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', boxShadow:'0 8px 24px rgba(234,179,8,0.20)' }}>
              <Zap size={36} color="#F59E0B" />
            </div>
            <h2 style={{ fontSize:'1.5rem', fontWeight:800, color:'var(--sn-text)', marginBottom:8, letterSpacing:'-0.025em' }}>
              {t('flash.noDeals')}
            </h2>
            <p style={{ color:'var(--sn-muted)', marginBottom:24, fontSize:14, lineHeight:1.6 }}>
              {t('flash.noDealsDesc')}
            </p>
            <Link href="/market"
              style={{ background:'linear-gradient(135deg,#F59E0B,#EF4444)', color:'var(--sn-text)',
                padding:'12px 28px', borderRadius:999, fontWeight:700, textDecoration:'none',
                fontSize:14, display:'inline-flex', alignItems:'center', gap:6,
                boxShadow:'0 8px 24px rgba(245,158,11,0.35)' }}>
              <Store size={14} /> {t('flash.browseMarket')}
            </Link>
          </div>
        )}

        {/* Deals */}
        {!loading && deals.length > 0 && (
          <>
            {/* Featured deal */}
            {featured && (
              <div style={{ marginBottom:'2rem', }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:'1rem' }}>
                  <Zap size={14} color="#F59E0B" style={{ }} />
                  <span style={{ fontSize:12, fontWeight:800, color:'#92400E', textTransform:'uppercase' as const, letterSpacing:'0.09em' }}>
                    {t('flash.featuredDeal')}
                  </span>
                  <div style={{ flex:1, height:1, background:'linear-gradient(90deg,rgba(234,179,8,0.4),transparent)' }} />
                </div>
                <DealCard deal={featured} featured={true} />
              </div>
            )}

            {/* Ending soon section */}
            {endingSoon.length > 0 && (
              <div style={{ marginBottom:'2rem', }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:'1rem' }}>
                  <Clock size={13} color="#EF4444" />
                  <span style={{ fontSize:12, fontWeight:800, color:'#EF4444', textTransform:'uppercase' as const, letterSpacing:'0.09em' }}>
                    {t('flash.endingSoonTitle')}
                  </span>
                  <div style={{ flex:1, height:1, background:'linear-gradient(90deg,rgba(239,68,68,0.35),transparent)' }} />
                </div>
                <div className="deal-grid">
                  {endingSoon.map(d => <DealCard key={d.id} deal={d} />)}
                </div>
              </div>
            )}

            {/* All other deals */}
            {others.length > 0 && (
              <div style={{ }}>
                {(endingSoon.length > 0 || featured) && (
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:'1rem' }}>
                    <TrendingUp size={13} color="#F59E0B" />
                    <span style={{ fontSize:12, fontWeight:800, color:'#92400E', textTransform:'uppercase' as const, letterSpacing:'0.09em' }}>
                      {t('flash.allDeals')}
                    </span>
                    <div style={{ flex:1, height:1, background:'linear-gradient(90deg,rgba(234,179,8,0.4),transparent)' }} />
                  </div>
                )}
                <div className="deal-grid">
                  {others.map(d => <DealCard key={d.id} deal={d} />)}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <SiteFooter />
    </main>
  )
}
