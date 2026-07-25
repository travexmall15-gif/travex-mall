'use client'
import NextImage from "next/image"

import { Suspense, useState, useEffect } from 'react'
import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'
import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { sb } from '@/lib/supabase'
import { MARKET_BASIC_PRICE, MARKET_PREMIUM_PRICE, MARKET_TOTAL_SLOTS, formatTZS } from '@/lib/data'
import { Search, Store, Loader2, MapPin, Navigation, Heart, ExternalLink } from 'lucide-react'

// ── Region + Category data (proper nouns stay the same in both languages) ──
// All 31 Tanzania regions (mainland + Zanzibar islands)
const TANZANIAN_REGIONS = [
  // Mainland
  'Arusha','Dar es Salaam','Dodoma','Geita','Iringa','Kagera',
  'Katavi','Kigoma','Kilimanjaro','Lindi','Manyara','Mara',
  'Mbeya','Morogoro','Mtwara','Mwanza','Njombe','Pwani',
  'Rukwa','Ruvuma','Shinyanga','Simiyu','Singida','Songwe',
  'Tabora','Tanga',
  // Zanzibar — Unguja
  'Kaskazini Unguja','Kusini Unguja','Mjini Magharibi (Unguja)',
  // Zanzibar — Pemba
  'Kaskazini Pemba','Kusini Pemba',
]

// Districts by major region
const TANZANIAN_DISTRICTS: Record<string, string[]> = {
  'Dar es Salaam': ['Ilala','Kinondoni','Temeke','Ubungo','Kigamboni'],
  'Dodoma':    ['Dodoma Manispaa','Bahi','Chamwino','Chilonwa','Kondoa','Kongwa','Mpwapwa'],
  'Arusha':    ['Arusha Manispaa','Arumeru','Karatu','Longido','Meru','Monduli','Ngorongoro'],
  'Mwanza':    ['Ilemela','Nyamagana','Buchosa','Kwimba','Magu','Misungwi','Sengerema','Ukerewe'],
  'Tanga':     ['Tanga Manispaa','Handeni','Kilindi','Korogwe','Lushoto','Mkinga','Muheza','Pangani','Siha'],
  'Kilimanjaro':['Moshi Manispaa','Hai','Moshi Vijijini','Mwanga','Rombo','Same','Siha'],
  'Mbeya':     ['Mbeya Manispaa','Chunya','Kyela','Mbarali','Mbeya Vijijini','Mbozi','Momba','Rungwe'],
  'Morogoro':  ['Morogoro Manispaa','Gairo','Kilombero','Kilosa','Malinyi','Mvomero','Ulanga'],
  'Kagera':    ['Bukoba Manispaa','Biharamulo','Bukoba Vijijini','Karagwe','Kyerwa','Misenyi','Muleba','Ngara'],
  'Mtwara':    ['Mtwara Manispaa','Masasi','Nanyumbu','Newala','Tandahimba'],
}

const SHOP_CATEGORIES_EXTENDED = [
  'Fashion & Clothing','Electronics','Furniture','Electrical','Food & Groceries',
  'Beauty & Health','Agriculture','Services','Home & Living','Sports & Fitness',
  'Books & Stationery','Technology','Automotive','Arts & Crafts','Education','Other',
]

const SHOP_CATEGORIES = [
  'Fashion & Clothing', 'Electronics', 'Food & Groceries',
  'Beauty & Health', 'Agriculture', 'Services', 'Home & Living',
  'Sports & Fitness', 'Education', 'Automotive', 'Arts & Crafts',
]

type MarketShop = {
  id: string
  owner_name: string
  owner_email: string | null
  owner_phone: string | null
  shop_name: string
  shop_category: string | null
  shop_region: string | null
  shop_whatsapp: string | null
  shop_desc: string | null
  shop_color: string | null
  shop_banner: string | null
  shop_logo: string | null
  plan: 'premium' | 'basic'
  status: string
  slug: string | null
  created_at: string
}

const PAGE_SIZE = 20

export default function MarketPage() {
  const { t } = useTranslation()
  const [shops, setShops]         = useState<MarketShop[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [category,       setCategory]       = useState('')
  const [region,         setRegion]         = useState('')
  const [district,       setDistrict]       = useState('')
  const [showRegionDrop, setShowRegionDrop] = useState(false)
  const [showDistrictDrop, setShowDistrictDrop] = useState(false)
  const [showCatDrop,    setShowCatDrop]    = useState(false)
  const [regionSearch,   setRegionSearch]   = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [totalApproved, setTotalApproved] = useState(0)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const { data, error } = await sb
          .from('pending_payments')
          .select('id,owner_name,owner_phone,shop_name,shop_category,shop_region,shop_whatsapp,shop_desc,shop_color,shop_banner,shop_logo,plan,status,created_at')
          .eq('status', 'approved')
          .order('plan', { ascending: false })
          .order('created_at', { ascending: false })

        if (error) {
          // RLS or permission error — try without ordering by plan
          console.error('Market load error:', error.message)
          const { data: fallback, error: fallbackErr } = await sb
            .from('pending_payments')
            .select('id,owner_name,owner_phone,shop_name,shop_category,shop_region,shop_whatsapp,shop_desc,plan,status,created_at')
            .eq('status', 'approved')
          if (fallback && !fallbackErr) {
            setShops(fallback as MarketShop[])
            setTotalApproved(fallback.length)
          }
        } else if (data) {
          setShops(data as MarketShop[])
          setTotalApproved(data.length)
          const dbCats = [...new Set(
            (data as MarketShop[]).map((s: MarketShop) => s.shop_category).filter(Boolean)
          )] as string[]
          const allCats = [...new Set([...SHOP_CATEGORIES_EXTENDED, ...dbCats])]
          setCategories(allCats)
        }
      } catch (e) {
        console.error('Market fetch exception:', e)
      }
      setLoading(false)
    }
    load()
  }, [])

  // Merge DB regions with static list
  const dbRegions = Array.from(
    new Set(shops.map(s => s.shop_region).filter(Boolean))
  ) as string[]
  const regions = [...new Set([...TANZANIAN_REGIONS, ...dbRegions])]

  const filtered = shops.filter(s => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      s.shop_name.toLowerCase().includes(q) ||
      (s.shop_desc  || '').toLowerCase().includes(q) ||
      (s.owner_name || '').toLowerCase().includes(q)
    const matchCat    = !category || s.shop_category === category
    const matchRegion = !region   || s.shop_region   === region
    const matchDist   = !district || (s.shop_region === region && s.shop_name?.toLowerCase().includes(district.toLowerCase())) || !district
    return matchSearch && matchCat && matchRegion
  })

  // ── Stats ticker data (translated on every render) ──────────
  const STATS = [
    { val: loading ? '...' : String(shops.filter(s => s.plan === 'premium').length), label: t('market.premiumShops'), color: '#C9A84C' },
    { val: loading ? '...' : String(shops.filter(s => s.plan === 'basic').length),   label: t('market.basicShops'),   color: 'rgba(255,255,255,0.6)' },
    { val: '5',                                                                        label: t('home.regions'),         color: 'rgba(255,255,255,0.6)' },
    { val: t('market.open'),                                                           label: t('market.registration'),  color: '#86EFAC' },
    { val: loading ? '...' : String(totalApproved),                                   label: t('market.activeSellersStat'), color: 'rgba(255,255,255,0.6)' },
    { val: String(MARKET_TOTAL_SLOTS),                                                 label: t('market.totalSlots'),    color: 'rgba(255,255,255,0.6)' },
  ]

  // ── Quick chips ticker (translated on every render) ──────────
  const QUICK_CHIPS = [
    { href: '/flash-deals', label: t('market.flashDealsLabel'), sub: t('market.flashDealsSub'), bg: '#FEF3C7', border: '#FCD34D', color: '#92400E' },
    { href: '/group-buy',   label: t('market.groupBuyLabel'),   sub: t('market.groupBuySub'),   bg: '#DBEAFE', border: '#93C5FD', color: '#1E40AF' },
    { href: '/vybe',        label: 'Social Vybe',               sub: t('market.communityFeed'), bg: '#EDE9FE', border: '#C4B5FD', color: '#5B21B6' },
    { href: '/campus',      label: t('market.campusMarketLabel'), sub: t('market.studentsOnly'), bg: '#ECFDF5', border: '#6EE7B7', color: '#065F46' },
  ]

  return (
    <main style={{ fontFamily: "'Inter', sans-serif", background: '#F8FAFF', paddingTop: '108px', minHeight: '100vh' }}>
      <SiteNav />

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section style={{
        position: 'relative', overflow: 'hidden', paddingTop: '64px',
        color: '#fff',
        background: 'linear-gradient(160deg, #010510 0%, #030920 35%, #050E2E 65%, #071540 100%)',
      }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
          background: 'radial-gradient(ellipse 60% 80% at 90% 20%, rgba(56,120,255,0.35) 0%, transparent 65%)' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '3rem 5% 0' }}>

          {/* Top row — badge + CTA */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)', padding: '0.3rem 0.9rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.06em' }}>
              <Store size={11} /> {t('market.heroBadge')}
            </div>
            <Link href="/open-store" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#C9A84C', color: '#0F172A', padding: '0.6rem 1.4rem', borderRadius: '999px', fontWeight: 700, fontSize: '0.8rem', textDecoration: 'none', boxShadow: '0 4px 16px rgba(201,168,76,0.30)' }}>
              <Store size={13} /> {t('nav.openShop')}
            </Link>
          </div>

          {/* Headline + description */}
          <div style={{ maxWidth: '600px', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: 'clamp(2rem, 4.5vw, 3.4rem)', fontWeight: 800, color: '#fff', lineHeight: 1.08, marginBottom: '0.85rem', letterSpacing: '-0.03em' }}>
              {t('market.headline')}
            </h1>
            <p style={{ fontSize: 'clamp(0.82rem, 1.5vw, 0.92rem)', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, maxWidth: '440px' }}>
              {t('market.subtitle')}{' '}
              <span style={{ color: 'rgba(255,255,255,0.65)' }}>
                {t('market.joinCount', { count: loading ? '...' : String(totalApproved) })}
              </span>
            </p>
          </div>

          {/* Plan pills */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '2rem' }}>
            {[
              { dot: '#94A3B8', name: t('market.basicPlan'),   price: formatTZS(MARKET_BASIC_PRICE) },
              { dot: '#C9A84C', name: t('market.premiumPlan'), price: formatTZS(MARKET_PREMIUM_PRICE) },
              { dot: '#C9A84C', name: t('market.topEstate'),   price: 'TZS 200,000' },
            ].map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fff', borderRadius: '12px', padding: '10px 18px', boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.dot, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0F172A', lineHeight: 1 }}>{p.name}</div>
                  <div style={{ fontSize: '0.63rem', color: '#64748B', marginTop: '2px' }}>{p.price} {t('market.perMonth')}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Stats ticker */}
          <div style={{ overflow: 'hidden', paddingBottom: '1.75rem', borderBottom: '1px solid rgba(255,255,255,0.06)', marginLeft: '-5%', marginRight: '-5%' }}>
            <style>{`
              @keyframes tickerRTL { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
              .stats-ticker { animation: tickerRTL 22s linear infinite; will-change: transform; }
              .stats-ticker:hover { animation-play-state: paused; }
            `}</style>
            <div className="stats-ticker" style={{ display: 'flex', gap: '0', width: 'max-content' }}>
              {[...STATS, ...STATS].map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', paddingRight: '2.5rem' }}>
                  <div style={{ paddingRight: '2.5rem', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontSize: 'clamp(0.9rem,2vw,1.1rem)', fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: '3px' }}>{s.val}</div>
                    <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── QUICK ACCESS TICKER ────────────────────────────────── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <style>{`
          @keyframes quickScroll { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
          .quick-ticker { animation: quickScroll 18s linear infinite; will-change: transform; }
          .quick-ticker:hover { animation-play-state: paused; }
          .quick-chip { transition: all 0.2s; }
          .quick-chip:hover { opacity: 0.8; transform: scale(0.97); }
        `}</style>
        <div style={{ padding: '10px 0' }}>
          <div className="quick-ticker" style={{ display: 'flex', gap: '8px', width: 'max-content', paddingLeft: '24px' }}>
            {[...QUICK_CHIPS, ...QUICK_CHIPS].map((c, i) => (
              <a key={i} href={c.href} className="quick-chip" style={{ display: 'inline-flex', flexDirection: 'column', gap: '1px', background: c.bg, border: `1px solid ${c.border}`, color: c.color, padding: '6px 14px', borderRadius: '10px', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{c.label}</span>
                <span style={{ fontSize: '0.58rem', opacity: 0.7 }}>{c.sub}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── SEARCH + FILTERS + GRID ────────────────────────────── */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 5% 2rem' }}>

        {/* Search bar */}
        <div style={{ position: 'relative', marginBottom: '1rem' }}>
          <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('market.searchPlaceholder')}
            style={{ width: '100%', paddingLeft: '2.75rem', paddingRight: '1rem', paddingTop: '0.75rem', paddingBottom: '0.75rem', border: '1.5px solid #E2E8F0', borderRadius: '12px', fontSize: '0.88rem', outline: 'none', fontFamily: "'Inter', sans-serif", background: '#fff', boxShadow: '0 1px 4px rgba(15,23,42,0.05)', transition: 'border-color 0.2s', boxSizing: 'border-box' as const }}
            onFocus={e => (e.target.style.borderColor = '#0D1B3E')}
            onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
          />
        </div>

        {/* ── NEW FILTER SYSTEM: horizontal chips + dropdown cards ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'1.25rem' }}>
          <style>{`
            .mk-chip{display:inline-flex;align-items:center;gap:5px;padding:7px 16px;border-radius:999px;border:1.5px solid #E2E8F0;background:#fff;color:#475569;font-size:0.78rem;font-weight:600;cursor:pointer;white-space:nowrap;transition:all .15s;font-family:'Inter',sans-serif}
            .mk-chip.active{background:#0D1B3E;border-color:#0D1B3E;color:#fff}
            .mk-chip:hover:not(.active){background:#F8FAFF;border-color:#CBD5E1}
            .mk-cat-chip{display:inline-flex;align-items:center;gap:5px;padding:6px 14px;border-radius:999px;border:1.5px solid #E2E8F0;background:#fff;color:#475569;font-size:0.75rem;font-weight:600;cursor:pointer;white-space:nowrap;transition:all .15s;font-family:'Inter',sans-serif}
            .mk-cat-chip.active{background:#C9A84C;border-color:#C9A84C;color:#0F172A;font-weight:800}
            .mk-cat-chip:hover:not(.active){background:#FFFBEB;border-color:#F59E0B}
            .mk-drop-card{position:absolute;top:calc(100% + 6px);left:0;background:#fff;border:1.5px solid #E2E8F0;border-radius:18px;box-shadow:0 12px 40px rgba(13,27,62,0.14);z-index:500;padding:12px;min-width:220px}
          `}</style>

          {/* ROW 1: All | Regions | Districts — horizontal */}
          <div style={{ display:'flex', gap:'8px', overflowX:'auto', scrollbarWidth:'none' as const, paddingBottom:'2px', alignItems:'center' }}>

            {/* ALL button */}
            <button
              className={`mk-chip${!region && !district ? ' active' : ''}`}
              onClick={() => { setRegion(''); setDistrict(''); setShowRegionDrop(false); setShowDistrictDrop(false) }}>
              {t('market.allRegions') || 'All'}
            </button>

            {/* REGIONS button + dropdown */}
            <div style={{ position:'relative', flexShrink:0 }}>
              <button
                className={`mk-chip${region && !district ? ' active' : ''}`}
                onClick={() => { setShowRegionDrop(v=>!v); setShowDistrictDrop(false); setShowCatDrop(false) }}>
                <MapPin size={12} style={{flexShrink:0}}/> {region || 'Regions'} <span style={{ fontSize:'0.6rem', opacity:.6 }}>▾</span>
              </button>
              {showRegionDrop && (
                <div className="mk-drop-card" style={{ maxHeight:320, overflow:'hidden', display:'flex', flexDirection:'column' }}>
                  {/* Region search mini-input */}
                  <input
                    value={regionSearch}
                    onChange={e => setRegionSearch(e.target.value)}
                    placeholder="Search region..."
                    style={{ width:'100%', padding:'7px 12px', border:'1.5px solid #E2E8F0', borderRadius:10, fontSize:'0.8rem', fontFamily:"'Inter',sans-serif", outline:'none', marginBottom:6, boxSizing:'border-box' as const }}
                    autoFocus
                  />
                  {/* Clear */}
                  {region && (
                    <button onClick={() => { setRegion(''); setRegionSearch('') }}
                      style={{ textAlign:'left', padding:'6px 8px', border:'none', background:'#F1F5F9', borderRadius:8, fontSize:'0.75rem', color:'#64748B', cursor:'pointer', fontFamily:"'Inter',sans-serif", marginBottom:4 }}>
                      ✕ Clear region
                    </button>
                  )}
                  {/* Scrollable region list */}
                  <div style={{ overflowY:'auto', maxHeight:230, display:'flex', flexDirection:'column', gap:2 }}>
                    {TANZANIAN_REGIONS
                      .filter(r => !regionSearch || r.toLowerCase().includes(regionSearch.toLowerCase()))
                      .map(r => (
                        <button key={r}
                          onClick={() => { setRegion(r); setDistrict(''); setShowRegionDrop(false); setRegionSearch('') }}
                          style={{ textAlign:'left', padding:'8px 10px', border:'none', borderRadius:10, background: region===r ? '#0D1B3E' : 'transparent', color: region===r ? '#fff' : '#0F172A', fontSize:'0.82rem', fontWeight: region===r ? 700 : 500, cursor:'pointer', fontFamily:"'Inter',sans-serif", transition:'all .12s' }}
                          onMouseOver={e => { if(region!==r)(e.currentTarget as HTMLElement).style.background='#F8FAFF' }}
                          onMouseOut={e  => { if(region!==r)(e.currentTarget as HTMLElement).style.background='transparent' }}>
                          {r}
                        </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* DISTRICT button + dropdown */}
            <div style={{ position:'relative', flexShrink:0 }}>
              <button
                className={`mk-chip${district ? ' active' : ''}`}
                onClick={() => { setShowDistrictDrop(v=>!v); setShowRegionDrop(false); setShowCatDrop(false) }}>
                <Navigation size={12} style={{flexShrink:0}}/> {district || 'Wilaya'} <span style={{ fontSize:'0.6rem', opacity:.6 }}>▾</span>
              </button>
              {showDistrictDrop && (
                <div className="mk-drop-card" style={{ maxHeight:320, overflow:'hidden', display:'flex', flexDirection:'column' }}>
                  {/* Show districts for selected region, or major cities */}
                  {district && (
                    <button onClick={() => { setDistrict(''); setShowDistrictDrop(false) }}
                      style={{ textAlign:'left', padding:'6px 8px', border:'none', background:'#F1F5F9', borderRadius:8, fontSize:'0.75rem', color:'#64748B', cursor:'pointer', fontFamily:"'Inter',sans-serif", marginBottom:6 }}>
                      ✕ Clear wilaya
                    </button>
                  )}
                  <div style={{ overflowY:'auto', maxHeight:260, display:'flex', flexDirection:'column', gap:2 }}>
                    {(region && TANZANIAN_DISTRICTS[region]
                      ? TANZANIAN_DISTRICTS[region]
                      : [
                        // Major districts shown when no region selected
                        ...TANZANIAN_DISTRICTS['Dar es Salaam'],
                        ...TANZANIAN_DISTRICTS['Dodoma'],
                        ...TANZANIAN_DISTRICTS['Arusha'],
                      ]
                    ).map(d => (
                      <button key={d}
                        onClick={() => { setDistrict(d); if(!region) setRegion(Object.entries(TANZANIAN_DISTRICTS).find(([,ds])=>ds.includes(d))?.[0]||''); setShowDistrictDrop(false) }}
                        style={{ textAlign:'left', padding:'8px 10px', border:'none', borderRadius:10, background: district===d ? '#0D1B3E' : 'transparent', color: district===d ? '#fff' : '#0F172A', fontSize:'0.82rem', fontWeight: district===d ? 700 : 500, cursor:'pointer', fontFamily:"'Inter',sans-serif", transition:'all .12s' }}
                        onMouseOver={e => { if(district!==d)(e.currentTarget as HTMLElement).style.background='#F8FAFF' }}
                        onMouseOut={e  => { if(district!==d)(e.currentTarget as HTMLElement).style.background='transparent' }}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ROW 2: Category chips — horizontal scrollable */}
          <div style={{ display:'flex', gap:'6px', overflowX:'auto', scrollbarWidth:'none' as const, paddingBottom:'2px', alignItems:'center' }}>
            <button className={`mk-cat-chip${!category ? ' active' : ''}`} onClick={() => setCategory('')}>
              All
            </button>
            {SHOP_CATEGORIES_EXTENDED.map(cat => (
              <button key={cat} className={`mk-cat-chip${category===cat ? ' active' : ''}`}
                onClick={() => setCategory(cat === category ? '' : cat)}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Close dropdowns on outside click */}
        {(showRegionDrop || showDistrictDrop || showCatDrop) && (
          <div style={{ position:'fixed', inset:0, zIndex:499 }}
            onClick={() => { setShowRegionDrop(false); setShowDistrictDrop(false); setShowCatDrop(false) }} />
        )}

        {/* Results count */}
        <div style={{ fontSize: '0.76rem', color: '#94A3B8', fontWeight: 500, marginBottom: '1.25rem' }}>
          {filtered.length === 1
            ? t('market.resultFound', { count: '1' })
            : t('market.resultsFound', { count: String(filtered.length) })}
        </div>

        {/* Loading spinner */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '5rem 0' }}>
            <Loader2 style={{ width: '32px', height: '32px', color: '#3B82F6', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
            <p style={{ color: '#64748B', fontSize: '0.88rem' }}>{t('market.loadingShops')}</p>
            <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
          </div>
        )}

        {/* Empty — no shops at all */}
        {!loading && shops.length === 0 && (
          <div style={{ textAlign: 'center', padding: '6rem 0' }}>
            <div style={{ width:72, height:72, borderRadius:20, background:'#EEF2FF', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1rem' }}><Store size={36} color="#6366F1" /></div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>
              {t('market.emptyTitle')}
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#64748B', marginBottom: '1.5rem' }}>
              {t('market.emptyDesc')}
            </p>
            <Link href="/open-store" style={{ background: '#C9A84C', color: '#0F172A', padding: '0.85rem 2rem', borderRadius: '999px', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 8px 22px rgba(201,168,76,0.30)' }}>
              {t('market.openShopBtn')}
            </Link>
          </div>
        )}

        {/* Shops grid */}
        {!loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: '1.1rem' }}>
            {filtered.length === 0 && shops.length > 0 ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '5rem 0' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>
                  {t('market.noResultsTitle')}
                </div>
                <p style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
                  {t('market.noResultsDesc')}
                </p>
              </div>
            ) : (
              filtered.map(shop => <ShopCard key={shop.id} shop={shop} />)
            )}
          </div>
        )}

      </section>

      <SiteFooter />
    </main>
  )
}

// ── SHOP CARD ─────────────────────────────────────────────────
function ShopCard({ shop }: { shop: MarketShop }) {
  const { t } = useTranslation()
  const init       = (shop.shop_name || 'SH').split(' ').map((w: string) => w[0]).join('').substring(0,2).toUpperCase()
  const isPremium  = shop.plan === 'premium'
  const accentColor = shop.shop_color || (isPremium ? '#C9A84C' : '#3B82F6')

  const [isSaved, setIsSaved] = useState(false)
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('sn_saved_shops') || '[]')
      setIsSaved(saved.some((s: any) => s.id === shop.id))
    } catch {}
  }, [shop.id])

  const toggleSave = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    try {
      const saved = JSON.parse(localStorage.getItem('sn_saved_shops') || '[]')
      if (isSaved) {
        localStorage.setItem('sn_saved_shops', JSON.stringify(saved.filter((s: any) => s.id !== shop.id)))
        setIsSaved(false)
      } else {
        saved.push({ id: shop.id, shop_name: shop.shop_name, shop_category: shop.shop_category, shop_region: shop.shop_region, plan: shop.plan, saved_at: new Date().toISOString() })
        localStorage.setItem('sn_saved_shops', JSON.stringify(saved))
        setIsSaved(true)
      }
    } catch {}
  }

  return (
    <div style={{
      background:'#fff',
      border: isPremium ? '1.5px solid rgba(201,168,76,0.30)' : '1.5px solid #E8EDF4',
      borderRadius:20,
      overflow:'hidden',
      transition:'transform .22s, box-shadow .22s',
      boxShadow: isPremium ? '0 2px 12px rgba(201,168,76,0.10)' : '0 2px 8px rgba(15,23,42,0.06)',
    }}
    onMouseOver={e => { const el=e.currentTarget as HTMLElement; el.style.transform='translateY(-4px)'; el.style.boxShadow='0 14px 36px rgba(15,23,42,0.12)' }}
    onMouseOut={e  => { const el=e.currentTarget as HTMLElement; el.style.transform='translateY(0)';   el.style.boxShadow= isPremium ? '0 2px 12px rgba(201,168,76,0.10)' : '0 2px 8px rgba(15,23,42,0.06)' }}>

      {/* ── Banner ─────────────────────────────────────────── */}
      <div style={{ height:88, position:'relative', overflow:'hidden' }}>
        {shop.shop_banner
          ? <img src={shop.shop_banner} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} loading="lazy" />
          : <div style={{ width:'100%', height:'100%', background:`linear-gradient(135deg, ${accentColor}40 0%, ${accentColor}88 50%, #050B2E 100%)` }} />
        }
        {/* Gradient overlay */}
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.35) 100%)' }} />

        {/* Plan badge */}
        <div style={{ position:'absolute', top:8, left:8, background: isPremium ? '#C9A84C' : 'rgba(255,255,255,0.92)', color: isPremium ? '#0F172A' : '#475569', fontSize:'0.55rem', fontWeight:800, padding:'3px 8px', borderRadius:999, letterSpacing:'0.06em', boxShadow:'0 2px 6px rgba(0,0,0,0.12)' }}>
          {isPremium ? '⭐ ' + t('market.premiumBadge') : t('market.basicBadge')}
        </div>

        {/* Save heart button */}
        <button onClick={toggleSave}
          style={{ position:'absolute', top:6, right:8, width:28, height:28, borderRadius:'50%', background:'rgba(255,255,255,0.92)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 6px rgba(0,0,0,0.15)', transition:'all .18s' }}
          onMouseOver={e => (e.currentTarget as HTMLElement).style.transform='scale(1.15)'}
          onMouseOut={e  => (e.currentTarget as HTMLElement).style.transform='scale(1)'}>
          <Heart size={14} color={isSaved ? '#EF4444' : '#94A3B8'} fill={isSaved ? '#EF4444' : 'none'} />
        </button>

        {/* Logo floating on banner bottom */}
        <div style={{ position:'absolute', bottom:-16, left:12, width:36, height:36, borderRadius:10, border:'2px solid #fff', overflow:'hidden', background:`linear-gradient(135deg,${accentColor},#050B2E)`, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 8px rgba(0,0,0,0.18)' }}>
          {shop.shop_logo
            ? <img src={shop.shop_logo} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} loading="lazy" />
            : <span style={{ fontSize:'0.7rem', fontWeight:900, color:'#fff' }}>{init}</span>
          }
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────── */}
      <div style={{ padding:'24px 12px 12px' }}>

        {/* Shop name */}
        <div style={{ fontWeight:800, fontSize:'0.88rem', color:'#0F172A', lineHeight:1.2, marginBottom:4, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
          {shop.shop_name}
        </div>

        {/* Region + Category row */}
        <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap', marginBottom:6 }}>
          {shop.shop_region && (
            <span style={{ display:'inline-flex', alignItems:'center', gap:3, fontSize:'0.62rem', color:'#64748B' }}>
              <MapPin size={9} /> {shop.shop_region}
            </span>
          )}
          {shop.shop_category && (
            <span style={{ fontSize:'0.6rem', background:`${accentColor}18`, color: isPremium ? '#92741a' : '#1E40AF', padding:'2px 8px', borderRadius:999, fontWeight:700 }}>
              {shop.shop_category}
            </span>
          )}
        </div>

        {/* Description */}
        {shop.shop_desc && (
          <p style={{ fontSize:'0.72rem', color:'#94A3B8', lineHeight:1.5, marginBottom:10, display:'-webkit-box', WebkitLineClamp:2 as any, WebkitBoxOrient:'vertical' as any, overflow:'hidden', margin:'0 0 10px' }}>
            {shop.shop_desc}
          </p>
        )}

        {/* Actions */}
        <div style={{ display:'flex', gap:6, marginTop: shop.shop_desc ? 0 : 10 }}>
          <a href={`/store/${shop.id}`}
            style={{ flex:1, display:'inline-flex', alignItems:'center', justifyContent:'center', gap:5, padding:'8px 10px', background: isPremium ? 'linear-gradient(135deg,#C9A84C,#E0B85A)' : '#0D1B3E', color: isPremium ? '#0F172A' : '#fff', borderRadius:10, fontSize:'0.74rem', fontWeight:700, textDecoration:'none', transition:'opacity .2s' }}
            onMouseOver={e => (e.currentTarget as HTMLElement).style.opacity='0.85'}
            onMouseOut={e  => (e.currentTarget as HTMLElement).style.opacity='1'}>
            <Store size={12} /> {t('market.visitShop')}
          </a>
          {shop.shop_whatsapp && (
            <a href={`https://wa.me/${shop.shop_whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer"
              style={{ width:36, height:36, display:'inline-flex', alignItems:'center', justifyContent:'center', background:'#DCFCE7', borderRadius:10, textDecoration:'none', fontSize:16, transition:'background .2s', flexShrink:0 }}
              onMouseOver={e => (e.currentTarget as HTMLElement).style.background='#BBF7D0'}
              onMouseOut={e  => (e.currentTarget as HTMLElement).style.background='#DCFCE7'}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#16A34A"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
