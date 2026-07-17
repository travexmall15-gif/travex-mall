'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'
import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { sb } from '@/lib/supabase'
import { MARKET_BASIC_PRICE, MARKET_PREMIUM_PRICE, MARKET_TOTAL_SLOTS, formatTZS } from '@/lib/data'
import {
  Search, Store, ArrowRight, MapPin, Star, Loader2,
  SlidersHorizontal, ChevronDown, X, Zap, Users, GraduationCap,
  MessageCircle, ShoppingBag, CheckCircle2
} from 'lucide-react'

const REGIONS = [
  'Dar es Salaam','Mwanza','Arusha','Dodoma','Mbeya',
  'Morogoro','Tanga','Zanzibar','Kigoma','Tabora',
]

const CATEGORIES = [
  'Fashion & Clothing','Electronics','Food & Groceries','Beauty & Health',
  'Agriculture','Services','Home & Living','Sports & Fitness',
  'Education','Automotive','Arts & Crafts','Technology',
]

type MarketShop = {
  id: string; owner_name: string; owner_email: string | null
  owner_phone: string | null; shop_name: string; shop_category: string | null
  shop_region: string | null; shop_whatsapp: string | null; shop_desc: string | null
  shop_color: string | null; shop_banner: string | null; shop_logo: string | null
  plan: 'premium' | 'basic'; status: string; slug: string | null; created_at: string
}

export default function MarketPage() {
  const { t } = useTranslation()
  const [shops, setShops]           = useState<MarketShop[]>([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [category, setCategory]     = useState('')
  const [region, setRegion]         = useState('')
  const [totalApproved, setTotal]   = useState(0)
  const searchRef                   = useRef<HTMLInputElement>(null)

  useEffect(() => {
    (async () => {
      setLoading(true)
      const { data } = await sb.from('pending_payments')
        .select('*').eq('status','approved')
        .order('plan',{ascending:false}).order('created_at',{ascending:false})
      if (data) { setShops(data); setTotal(data.length) }
      setLoading(false)
    })()
  }, [])

  const filtered = shops.filter(s => {
    const q = search.toLowerCase()
    return (
      (!q || s.shop_name.toLowerCase().includes(q) || (s.shop_desc||'').toLowerCase().includes(q)) &&
      (!category || s.shop_category === category) &&
      (!region   || s.shop_region   === region)
    )
  })

  const premiumCount = shops.filter(s => s.plan === 'premium').length
  const basicCount   = shops.filter(s => s.plan === 'basic').length

  const clearFilters = () => { setSearch(''); setCategory(''); setRegion('') }
  const hasFilters   = search || category || region

  // Stats for ticker (rendered twice for infinite scroll)
  const STATS = [
    { val: loading ? '…' : String(premiumCount), label: t('market.premiumShops'), color: '#C9A84C' },
    { val: loading ? '…' : String(basicCount),   label: t('market.basicShops'),   color: 'rgba(255,255,255,0.55)' },
    { val: '5',                                   label: t('home.regions'),         color: 'rgba(255,255,255,0.55)' },
    { val: t('market.open'),                      label: t('market.registration'),  color: '#86EFAC' },
    { val: loading ? '…' : String(totalApproved), label: t('market.activeSellersStat'), color: 'rgba(255,255,255,0.55)' },
    { val: String(MARKET_TOTAL_SLOTS),            label: t('market.totalSlots'),    color: 'rgba(255,255,255,0.55)' },
  ]

  const QUICK_CHIPS = [
    { href: '/flash-deals', icon: Zap,          label: t('nav.flashDeals'),  sub: t('market.flash_time'), bg:'#FEF3C7',border:'#FCD34D',color:'#92400E' },
    { href: '/group-buy',   icon: Users,        label: t('nav.groupBuy'),    sub: t('market.save_together'), bg:'#DBEAFE',border:'#93C5FD',color:'#1E40AF' },
    { href: '/vybe',        icon: MessageCircle,label: 'Social Vybe',        sub: t('market.community'),  bg:'#EDE9FE',border:'#C4B5FD',color:'#5B21B6' },
    { href: '/campus',      icon: GraduationCap,label: t('nav.campus'),      sub: t('market.students'),   bg:'#ECFDF5',border:'#6EE7B7',color:'#065F46' },
  ]

  return (
    <main style={{ fontFamily:"'Inter',sans-serif", background:'#F8FAFF', paddingTop:'108px', minHeight:'100vh' }}>
      <SiteNav />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section style={{
        position:'relative', overflow:'hidden', color:'#fff',
        background:'linear-gradient(160deg,#010510 0%,#030920 35%,#050E2E 65%,#071540 100%)',
      }}>
        {/* Glow orb */}
        <div style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:0,
          background:'radial-gradient(ellipse 55% 75% at 85% 15%, rgba(56,120,255,0.32) 0%, transparent 65%)' }} />
        {/* Grid texture */}
        <div style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:0, opacity:0.03,
          backgroundImage:'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
          backgroundSize:'40px 40px' }} />

        <div style={{ position:'relative', zIndex:1, maxWidth:'1200px', margin:'0 auto', padding:'3.5rem 5% 0' }}>

          {/* Row — badge + CTA */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem', marginBottom:'2.5rem' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:'0.4rem', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.14)', color:'rgba(255,255,255,0.7)', padding:'0.32rem 0.9rem', borderRadius:'999px', fontSize:'0.68rem', fontWeight:700, letterSpacing:'0.07em', textTransform:'uppercase' }}>
              <Store size={10} /> {t('market.hero_badge')}
            </div>
            <Link href="/open-store" style={{ display:'inline-flex', alignItems:'center', gap:'5px', background:'#C9A84C', color:'#0F172A', padding:'0.65rem 1.4rem', borderRadius:'999px', fontWeight:700, fontSize:'0.82rem', textDecoration:'none', boxShadow:'0 4px 16px rgba(201,168,76,0.32)', letterSpacing:'-0.01em', transition:'all 0.2s' }}
              onMouseOver={e=>{(e.currentTarget as HTMLElement).style.transform='translateY(-1px)';(e.currentTarget as HTMLElement).style.boxShadow='0 8px 24px rgba(201,168,76,0.40)'}}
              onMouseOut={e=>{(e.currentTarget as HTMLElement).style.transform='translateY(0)';(e.currentTarget as HTMLElement).style.boxShadow='0 4px 16px rgba(201,168,76,0.32)'}}>
              <ShoppingBag size={13} /> {t('market.open_shop_btn')}
            </Link>
          </div>

          {/* Headline */}
          <div style={{ maxWidth:'560px', marginBottom:'2.5rem' }}>
            <h1 style={{ fontSize:'clamp(2.2rem,5vw,3.5rem)', fontWeight:800, color:'#fff', lineHeight:1.08, marginBottom:'0.9rem', letterSpacing:'-0.03em' }}>
              {t('market.headline')}
            </h1>
            <p style={{ fontSize:'clamp(0.85rem,1.5vw,0.95rem)', color:'rgba(255,255,255,0.48)', lineHeight:1.65, maxWidth:'420px' }}>
              {t('market.subtitle')}{' '}
              <span style={{ color:'rgba(255,255,255,0.65)', fontWeight:500 }}>
                {t('market.join_count', { count: loading ? '…' : String(totalApproved) })}
              </span>
            </p>

            {/* Plan pills */}
            <div style={{ display:'flex', gap:'10px', flexWrap:'wrap', marginTop:'1.5rem' }}>
              {[
                { dot:'#64748B', label:t('market.basicPlan'),   price:formatTZS(MARKET_BASIC_PRICE) },
                { dot:'#C9A84C', label:t('market.premiumPlan'), price:formatTZS(MARKET_PREMIUM_PRICE) },
                { dot:'#C9A84C', label:t('market.topEstate'),   price:'TZS 200,000' },
              ].map((p,i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:'8px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.10)', borderRadius:'10px', padding:'8px 14px', backdropFilter:'blur(8px)' }}>
                  <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:p.dot, flexShrink:0 }} />
                  <div>
                    <div style={{ fontSize:'0.75rem', fontWeight:700, color:'#fff', lineHeight:1 }}>{p.label}</div>
                    <div style={{ fontSize:'0.6rem', color:'rgba(255,255,255,0.38)', marginTop:'2px' }}>{p.price} {t('market.per_month')}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats ticker */}
          <div style={{ overflow:'hidden', paddingBottom:'0', borderTop:'1px solid rgba(255,255,255,0.06)', marginLeft:'-5%', marginRight:'-5%' }}>
            <style>{`
              @keyframes tickerRTL { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
              .stats-ticker { animation:tickerRTL 24s linear infinite; will-change:transform; }
              .stats-ticker:hover { animation-play-state:paused; }
            `}</style>
            <div className="stats-ticker" style={{ display:'flex', width:'max-content', paddingTop:'1.25rem', paddingBottom:'1.5rem' }}>
              {[...STATS,...STATS].map((s,i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', paddingRight:'2.5rem' }}>
                  <div style={{ paddingRight:'2.5rem', borderRight:'1px solid rgba(255,255,255,0.07)' }}>
                    <div style={{ fontSize:'clamp(0.88rem,2vw,1.05rem)', fontWeight:800, color:s.color, lineHeight:1, marginBottom:'3px', letterSpacing:'-0.02em' }}>{s.val}</div>
                    <div style={{ fontSize:'0.58rem', color:'rgba(255,255,255,0.25)', textTransform:'uppercase', letterSpacing:'0.09em', whiteSpace:'nowrap' }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── QUICK ACCESS CHIPS ───────────────────────────────── */}
      <div style={{ background:'#fff', borderBottom:'1px solid #E2E8F0', overflow:'hidden' }}>
        <style>{`
          @keyframes chipsScroll { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
          .chips-scroll { animation:chipsScroll 20s linear infinite; will-change:transform; }
          .chips-scroll:hover { animation-play-state:paused; }
          .quick-chip { transition:all 0.18s; text-decoration:none; }
          .quick-chip:hover { opacity:0.82; transform:translateY(-1px); }
        `}</style>
        <div style={{ padding:'10px 0' }}>
          <div className="chips-scroll" style={{ display:'flex', gap:'8px', width:'max-content', paddingLeft:'20px' }}>
            {[...QUICK_CHIPS,...QUICK_CHIPS].map((c,i) => (
              <a key={i} href={c.href} className="quick-chip" style={{ display:'inline-flex', alignItems:'center', gap:'6px', background:c.bg, border:`1px solid ${c.border}`, color:c.color, padding:'6px 14px', borderRadius:'10px', whiteSpace:'nowrap', flexShrink:0 }}>
                <c.icon size={11} />
                <div>
                  <div style={{ fontSize:'0.73rem', fontWeight:700, lineHeight:1 }}>{c.label}</div>
                  <div style={{ fontSize:'0.58rem', opacity:0.65, lineHeight:1, marginTop:'2px' }}>{c.sub}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────────────── */}
      <section style={{ maxWidth:'1200px', margin:'0 auto', padding:'2rem 5% 4rem' }}>

        {/* Search + Filters bar */}
        <div style={{ background:'#fff', borderRadius:'16px', border:'1.5px solid #E2E8F0', padding:'16px', marginBottom:'1.5rem', boxShadow:'0 2px 8px rgba(15,23,42,0.04)' }}>

          {/* Search */}
          <div style={{ position:'relative', marginBottom:'12px' }}>
            <Search size={15} style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'#94A3B8' }} />
            <input
              ref={searchRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('market.search_placeholder')}
              style={{ width:'100%', boxSizing:'border-box', padding:'10px 36px 10px 36px', border:'1.5px solid #E2E8F0', borderRadius:'10px', fontSize:'0.88rem', outline:'none', fontFamily:"'Inter',sans-serif", background:'#F8FAFF', color:'#0F172A', transition:'all 0.2s', letterSpacing:'-0.01em' }}
              onFocus={e=>{e.target.style.borderColor='#0D1B3E';e.target.style.background='#fff'}}
              onBlur={e=>{e.target.style.borderColor='#E2E8F0';e.target.style.background='#F8FAFF'}}
            />
            {search && (
              <button onClick={()=>setSearch('')} style={{ position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', padding:'2px', color:'#94A3B8', display:'flex' }}>
                <X size={14} />
              </button>
            )}
          </div>

          {/* Region chips */}
          <div style={{ marginBottom:'10px' }}>
            <div style={{ fontSize:'0.6rem', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:'6px' }}>
              {t('market.region_label')}
            </div>
            <div style={{ display:'flex', gap:'5px', flexWrap:'wrap' }}>
              <button onClick={()=>setRegion('')}
                style={{ padding:'4px 12px', borderRadius:'7px', border:'1.5px solid', borderColor:!region?'#0D1B3E':'#E2E8F0', background:!region?'#0D1B3E':'#fff', color:!region?'#fff':'#475569', fontSize:'0.72rem', fontWeight:600, cursor:'pointer', transition:'all 0.15s', fontFamily:"'Inter',sans-serif" }}>
                {t('market.all')}
              </button>
              {REGIONS.map(r => (
                <button key={r} onClick={()=>setRegion(r===region?'':r)}
                  style={{ padding:'4px 12px', borderRadius:'7px', border:'1.5px solid', borderColor:region===r?'#0D1B3E':'#E2E8F0', background:region===r?'#0D1B3E':'#fff', color:region===r?'#fff':'#475569', fontSize:'0.72rem', fontWeight:600, cursor:'pointer', whiteSpace:'nowrap', transition:'all 0.15s', fontFamily:"'Inter',sans-serif" }}>
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Category chips */}
          <div>
            <div style={{ fontSize:'0.6rem', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:'6px' }}>
              {t('market.category_label')}
            </div>
            <div style={{ display:'flex', gap:'5px', flexWrap:'wrap' }}>
              <button onClick={()=>setCategory('')}
                style={{ padding:'4px 12px', borderRadius:'7px', border:'1.5px solid', borderColor:!category?'#C9A84C':'#E2E8F0', background:!category?'#C9A84C':'#fff', color:!category?'#0F172A':'#475569', fontSize:'0.72rem', fontWeight:600, cursor:'pointer', transition:'all 0.15s', fontFamily:"'Inter',sans-serif" }}>
                {t('market.all')}
              </button>
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={()=>setCategory(cat===category?'':cat)}
                  style={{ padding:'4px 12px', borderRadius:'7px', border:'1.5px solid', borderColor:category===cat?'#C9A84C':'#E2E8F0', background:category===cat?'#C9A84C':'#fff', color:category===cat?'#0F172A':'#475569', fontSize:'0.72rem', fontWeight:600, cursor:'pointer', whiteSpace:'nowrap', transition:'all 0.15s', fontFamily:"'Inter',sans-serif" }}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Active filters + clear */}
          {hasFilters && (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'12px', paddingTop:'12px', borderTop:'1px solid #F1F5F9' }}>
              <div style={{ fontSize:'0.72rem', color:'#64748B', fontWeight:500 }}>
                {filtered.length === 1
                  ? t('market.results_one', { count: '1' })
                  : t('market.results_many', { count: String(filtered.length) })}
              </div>
              <button onClick={clearFilters} style={{ display:'flex', alignItems:'center', gap:'4px', padding:'4px 10px', background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:'7px', color:'#EF4444', fontSize:'0.7rem', fontWeight:600, cursor:'pointer', fontFamily:"'Inter',sans-serif" }}>
                <X size={11} /> Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Results count bar */}
        {!hasFilters && !loading && (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem' }}>
            <p style={{ fontSize:'0.78rem', color:'#64748B', fontWeight:500, letterSpacing:'-0.01em' }}>
              {totalApproved === 1
                ? t('market.results_one', { count: '1' })
                : t('market.results_many', { count: String(totalApproved) })}
            </p>
            <div style={{ display:'flex', gap:'6px' }}>
              {[
                { icon:Star, label:t('market.premium_badge'), count:String(shops.filter(s=>s.plan==='premium').length), color:'#C9A84C' },
                { icon:Store, label:t('market.basic_badge'), count:String(shops.filter(s=>s.plan==='basic').length), color:'#64748B' },
              ].map((tag,i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:'4px', background:'#fff', border:'1px solid #E2E8F0', borderRadius:'8px', padding:'4px 10px', fontSize:'0.68rem', color:'#475569', fontWeight:600 }}>
                  <tag.icon size={10} color={tag.color} /> {tag.count} {tag.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:'1rem' }}>
            {Array.from({length:8}).map((_,i) => (
              <div key={i} style={{ background:'#fff', borderRadius:'16px', border:'1.5px solid #F1F5F9', overflow:'hidden', height:'240px' }}>
                <div style={{ height:'100px', background:'linear-gradient(90deg,#F1F5F9 25%,#E2E8F0 50%,#F1F5F9 75%)', backgroundSize:'200% 100%', animation:'shimmer 1.5s infinite' }} />
                <div style={{ padding:'12px 16px' }}>
                  {[80,60,40].map((w,j)=><div key={j} style={{ height:'12px', background:'#F1F5F9', borderRadius:'6px', width:`${w}%`, marginBottom:'8px' }} />)}
                </div>
                <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
              </div>
            ))}
          </div>
        )}

        {/* Empty — no shops at all */}
        {!loading && shops.length === 0 && (
          <div style={{ textAlign:'center', padding:'6rem 1rem' }}>
            <div style={{ width:'72px', height:'72px', background:'linear-gradient(135deg,#0D1B3E,#1B3A8A)', borderRadius:'20px', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.25rem' }}>
              <Store size={32} color="#C9A84C" />
            </div>
            <h3 style={{ fontSize:'1.3rem', fontWeight:700, color:'#0D1B3E', marginBottom:'0.5rem', letterSpacing:'-0.02em' }}>
              {t('market.empty_title')}
            </h3>
            <p style={{ fontSize:'0.9rem', color:'#64748B', marginBottom:'1.75rem', maxWidth:'340px', margin:'0 auto 1.75rem', lineHeight:1.6 }}>
              {t('market.empty_desc')}
            </p>
            <Link href="/open-store" style={{ display:'inline-flex', alignItems:'center', gap:'6px', background:'#C9A84C', color:'#0F172A', padding:'0.85rem 2rem', borderRadius:'999px', fontWeight:700, fontSize:'0.88rem', textDecoration:'none', boxShadow:'0 8px 22px rgba(201,168,76,0.30)', letterSpacing:'-0.01em' }}>
              <ShoppingBag size={15} /> {t('market.open_shop_btn')}
            </Link>
          </div>
        )}

        {/* No results from filters */}
        {!loading && shops.length > 0 && filtered.length === 0 && (
          <div style={{ textAlign:'center', padding:'5rem 1rem' }}>
            <Search size={40} color="#CBD5E1" style={{ margin:'0 auto 1rem' }} />
            <h3 style={{ fontSize:'1.2rem', fontWeight:700, color:'#0D1B3E', marginBottom:'0.5rem', letterSpacing:'-0.02em' }}>
              {t('market.no_results_title')}
            </h3>
            <p style={{ fontSize:'0.88rem', color:'#94A3B8', marginBottom:'1.5rem', lineHeight:1.6 }}>
              {t('market.no_results_desc')}
            </p>
            <button onClick={clearFilters} style={{ display:'inline-flex', alignItems:'center', gap:'6px', background:'#0D1B3E', color:'#fff', padding:'0.75rem 1.75rem', borderRadius:'999px', fontWeight:700, fontSize:'0.85rem', border:'none', cursor:'pointer', fontFamily:"'Inter',sans-serif", letterSpacing:'-0.01em' }}>
              <X size={13} /> Clear filters
            </button>
          </div>
        )}

        {/* Shop grid */}
        {!loading && filtered.length > 0 && (
          <>
            {/* Premium section */}
            {filtered.filter(s=>s.plan==='premium').length > 0 && (
              <div style={{ marginBottom:'2.5rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'1rem' }}>
                  <Star size={13} color="#C9A84C" fill="#C9A84C" />
                  <span style={{ fontSize:'0.72rem', fontWeight:800, color:'#C9A84C', textTransform:'uppercase', letterSpacing:'0.08em' }}>
                    {t('market.premiumShops')}
                  </span>
                  <div style={{ flex:1, height:'1px', background:'linear-gradient(90deg,rgba(201,168,76,0.25),transparent)' }} />
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:'1rem' }}>
                  {filtered.filter(s=>s.plan==='premium').map(shop => (
                    <ShopCard key={shop.id} shop={shop} t={t} />
                  ))}
                </div>
              </div>
            )}

            {/* Basic section */}
            {filtered.filter(s=>s.plan==='basic').length > 0 && (
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'1rem' }}>
                  <Store size={12} color="#94A3B8" />
                  <span style={{ fontSize:'0.72rem', fontWeight:800, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.08em' }}>
                    {t('market.basicShops')}
                  </span>
                  <div style={{ flex:1, height:'1px', background:'linear-gradient(90deg,rgba(148,163,184,0.25),transparent)' }} />
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:'1rem' }}>
                  {filtered.filter(s=>s.plan==='basic').map(shop => (
                    <ShopCard key={shop.id} shop={shop} t={t} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </section>

      <SiteFooter />

      <style>{`
        @media (max-width:640px) {
          .market-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width:400px) {
          .market-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  )
}

// ── SHOP CARD ─────────────────────────────────────────────────
function ShopCard({ shop, t }: { shop: MarketShop; t: (k: string) => string }) {
  const isPremium = shop.plan === 'premium'
  const accentColor = shop.shop_color || (isPremium ? '#C9A84C' : '#3B82F6')
  const initials = shop.shop_name.split(' ').map((w:string)=>w[0]).join('').slice(0,2).toUpperCase()

  return (
    <div
      style={{ background:'#fff', borderRadius:'16px', border:`1.5px solid ${isPremium?'rgba(201,168,76,0.22)':'#EEF0F6'}`, overflow:'hidden', transition:'all 0.22s', cursor:'pointer', boxShadow:'0 1px 4px rgba(15,23,42,0.05)', display:'flex', flexDirection:'column' }}
      onMouseOver={e=>{const el=e.currentTarget as HTMLElement;el.style.transform='translateY(-4px)';el.style.boxShadow=isPremium?'0 12px 32px rgba(201,168,76,0.14)':'0 12px 32px rgba(15,23,42,0.10)'}}
      onMouseOut={e=>{const el=e.currentTarget as HTMLElement;el.style.transform='translateY(0)';el.style.boxShadow='0 1px 4px rgba(15,23,42,0.05)'}}
    >
      {/* Banner */}
      <div style={{ height:'96px', position:'relative', overflow:'hidden', flexShrink:0 }}>
        {shop.shop_banner
          ? <img src={shop.shop_banner} alt="" style={{ width:'100%',height:'100%',objectFit:'cover' }} />
          : <div style={{ width:'100%',height:'100%',background:`linear-gradient(135deg,${accentColor}44 0%,${accentColor}88 50%,#030920 100%)` }} />
        }
        {/* Premium line */}
        {isPremium && <div style={{ position:'absolute', top:0, left:0, right:0, height:'2px', background:'linear-gradient(90deg,#C9A84C,#F0C96B,#C9A84C)' }} />}
        {/* Badge */}
        <div style={{ position:'absolute', top:'8px', right:'8px', background:isPremium?'#C9A84C':'rgba(15,23,42,0.65)', backdropFilter:'blur(8px)', color:isPremium?'#0F172A':'rgba(255,255,255,0.85)', fontSize:'0.5rem', fontWeight:800, padding:'2px 8px', borderRadius:'999px', letterSpacing:'0.05em', textTransform:'uppercase' }}>
          {isPremium ? t('market.premium_badge') : t('market.basic_badge')}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding:'12px 14px 14px', display:'flex', flexDirection:'column', flex:1, gap:'8px' }}>

        {/* Logo + Name row */}
        <div style={{ display:'flex', alignItems:'flex-start', gap:'10px' }}>
          <div style={{ width:'36px', height:'36px', borderRadius:'10px', border:`2px solid ${isPremium?'rgba(201,168,76,0.25)':'#E8ECF4'}`, overflow:'hidden', flexShrink:0, background:`linear-gradient(135deg,${accentColor},#030920)`, display:'flex', alignItems:'center', justifyContent:'center' }}>
            {shop.shop_logo
              ? <img src={shop.shop_logo} alt={initials} style={{ width:'100%',height:'100%',objectFit:'cover' }} />
              : <span style={{ fontSize:'0.72rem', fontWeight:800, color:'#fff', letterSpacing:'-0.02em' }}>{initials}</span>
            }
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontWeight:700, fontSize:'0.88rem', color:'#0F172A', lineHeight:1.25, letterSpacing:'-0.01em', marginBottom:'2px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
              {shop.shop_name}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'4px', flexWrap:'wrap' }}>
              {shop.shop_region && (
                <span style={{ display:'inline-flex', alignItems:'center', gap:'2px', fontSize:'0.62rem', color:'#94A3B8', fontWeight:500 }}>
                  <MapPin size={9} /> {shop.shop_region}
                </span>
              )}
              {isPremium && (
                <span style={{ display:'inline-flex', alignItems:'center', gap:'2px', fontSize:'0.6rem', color:'#16A34A', fontWeight:700 }}>
                  <CheckCircle2 size={9} /> {t('market.verified')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Category */}
        {shop.shop_category && (
          <div>
            <span style={{ fontSize:'0.62rem', background:isPremium?'rgba(201,168,76,0.10)':'rgba(59,130,246,0.07)', color:isPremium?'#92741a':'#1D4ED8', padding:'3px 9px', borderRadius:'999px', fontWeight:700, letterSpacing:'0.01em' }}>
              {shop.shop_category}
            </span>
          </div>
        )}

        {/* Description */}
        {shop.shop_desc && (
          <p style={{ fontSize:'0.72rem', color:'#64748B', lineHeight:1.55, margin:0, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2 as any, WebkitBoxOrient:'vertical' as any }}>
            {shop.shop_desc}
          </p>
        )}

        {/* Footer row */}
        <div style={{ display:'flex', alignItems:'center', gap:'6px', marginTop:'auto', paddingTop:'4px' }}>
          <Link href={`/store/${shop.id}`}
            style={{ flex:1, display:'inline-flex', alignItems:'center', justifyContent:'center', gap:'5px', padding:'8px 14px', background:isPremium?'#C9A84C':'#0D1B3E', color:isPremium?'#0F172A':'#fff', borderRadius:'9px', fontSize:'0.72rem', fontWeight:700, textDecoration:'none', transition:'opacity 0.2s', letterSpacing:'-0.01em' }}
            onMouseOver={e=>(e.currentTarget as HTMLElement).style.opacity='0.85'}
            onMouseOut={e=>(e.currentTarget as HTMLElement).style.opacity='1'}>
            <Store size={11} /> {t('market.visit_shop')}
          </Link>
          {shop.shop_whatsapp && (
            <a href={`https://wa.me/${shop.shop_whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer"
              style={{ padding:'8px 10px', background:'#F0FDF4', border:'1px solid #BBF7D0', borderRadius:'9px', color:'#15803D', textDecoration:'none', display:'flex', alignItems:'center', transition:'all 0.2s' }}
              onMouseOver={e=>{(e.currentTarget as HTMLElement).style.background='#DCFCE7'}}
              onMouseOut={e=>{(e.currentTarget as HTMLElement).style.background='#F0FDF4'}}>
              <MessageCircle size={13} />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
