'use client'
import NextImage from "next/image"

import { Suspense, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'
import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { sb } from '@/lib/supabase'
import { MARKET_BASIC_PRICE, MARKET_PREMIUM_PRICE, formatTZS } from '@/lib/data'
import { Search, Store, MapPin, Navigation, Heart, ExternalLink, MessageCircle } from 'lucide-react'

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
  shop_font: string | null       // ← new: custom font for shop name
  shop_products: string | null   // ← new: JSON array of {name,price}
  plan: 'premium' | 'basic'
  status: string
  slug: string | null
  created_at: string
}

type ShopProduct = { name: string; price: number }

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
          .select('id,owner_name,owner_phone,shop_name,shop_category,shop_region,shop_whatsapp,shop_desc,shop_color,shop_banner,shop_logo,shop_font,shop_products,plan,status,created_at')
          .eq('status', 'approved')
          .order('plan', { ascending: false })
          .order('created_at', { ascending: false })

        if (error) {
          // RLS or permission error — try without ordering by plan
          console.error('Market load error:', error.message)
          const { data: fallback, error: fallbackErr } = await sb
            .from('pending_payments')
            .select('id,owner_name,owner_phone,shop_name,shop_category,shop_region,shop_whatsapp,shop_desc,shop_font,shop_products,plan,status,created_at')
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

  // ── Quick chips (translated on every render) ──────────
  const QUICK_CHIPS = [
    { href: '/flash-deals', label: t('market.flashDealsLabel'), sub: t('market.flashDealsSub'), bg: '#FEF3C7', border: '#FCD34D', color: '#92400E' },
    { href: '/group-buy',   label: t('market.groupBuyLabel'),   sub: t('market.groupBuySub'),   bg: '#DBEAFE', border: '#93C5FD', color: '#1E40AF' },
    { href: '/vybe',        label: 'Social Vybe',               sub: t('market.communityFeed'), bg: '#EDE9FE', border: '#C4B5FD', color: '#5B21B6' },
  ]

  return (
    <main style={{ fontFamily: "'Inter', sans-serif", background: '#F8FAFF', paddingTop: '108px', minHeight: '100vh' }}>
      <SiteNav />

      {/* ── SLIM PAGE HEADER ─────────────────────────────────── */}
      <div style={{ background:'linear-gradient(135deg,#0D1B3E,#1B3A8A)', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
        <style>{`
          @keyframes quickScroll { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
          .quick-ticker { animation: quickScroll 20s linear infinite; will-change: transform; }
          .quick-ticker:hover { animation-play-state: paused; }
          .quick-chip { transition: opacity .15s; }
          .quick-chip:hover { opacity: .78; }
          @keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
          .sk { background:linear-gradient(90deg,#F1F5F9 25%,#E2E8F0 50%,#F1F5F9 75%); background-size:800px 100%; animation:shimmer 1.4s infinite; border-radius:8px; }
        `}</style>
        <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'1rem 5%', display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 }}>
          <h1 style={{ fontFamily:"'Inter',sans-serif", fontSize:'clamp(1.1rem,2.5vw,1.4rem)', fontWeight:900, color:'#fff', margin:0, letterSpacing:'-0.02em' }}>
            Business Marketplace
          </h1>
          <Link href="/open-store" style={{ display:'inline-flex', alignItems:'center', gap:'0.4rem', background:'#C9A84C', color:'#0F172A', padding:'0.5rem 1.2rem', borderRadius:999, fontWeight:700, fontSize:'0.78rem', textDecoration:'none', flexShrink:0 }}>
            <Store size={13} /> {t('nav.openShop')}
          </Link>
        </div>
        {/* Quick nav chips */}
        <div style={{ overflow:'hidden', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ padding:'8px 0' }}>
            <div className="quick-ticker" style={{ display:'flex', gap:8, width:'max-content', paddingLeft:24 }}>
              {[...QUICK_CHIPS, ...QUICK_CHIPS].map((c, i) => (
                <a key={i} href={c.href} className="quick-chip" style={{ display:'inline-flex', flexDirection:'column', gap:1, background:c.bg, border:`1px solid ${c.border}`, color:c.color, padding:'5px 13px', borderRadius:9, textDecoration:'none', whiteSpace:'nowrap', flexShrink:0 }}>
                  <span style={{ fontSize:'0.73rem', fontWeight:700 }}>{c.label}</span>
                  <span style={{ fontSize:'0.57rem', opacity:0.7 }}>{c.sub}</span>
                </a>
              ))}
            </div>
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

        {/* Skeleton cards — show immediately while data loads */}
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: '1.1rem' }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ background:'#fff', borderRadius:20, overflow:'hidden', border:'1.5px solid #E2E8F0', boxShadow:'0 2px 10px rgba(15,23,42,0.05)' }}>
                <div className="sk" style={{ height:72 }} />
                <div style={{ padding:'12px 13px' }}>
                  <div className="sk" style={{ height:10, width:'70%', marginBottom:8 }} />
                  <div className="sk" style={{ height:8, width:'45%', marginBottom:16 }} />
                  <div style={{ display:'flex', gap:6, marginBottom:10 }}>
                    {[1,2,3].map(j => <div key={j} className="sk" style={{ flex:1, height:80, borderRadius:11 }} />)}
                  </div>
                  <div className="sk" style={{ height:36, borderRadius:10 }} />
                </div>
              </div>
            ))}
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: '1.1rem', animation:'fadeIn .3s ease' }}>
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

// ── SHOP WINDOW CARD ─────────────────────────────────────
// Shows products inside the card like a shop window display
const SHOP_FONTS: Record<string, string> = {
  'Inter':           "'Inter', sans-serif",
  'Playfair Display':"'Playfair Display', Georgia, serif",
  'Montserrat':      "'Montserrat', 'Inter', sans-serif",
  'Dancing Script':  "'Dancing Script', cursive",
  'Raleway':         "'Raleway', 'Inter', sans-serif",
}

function ShopCard({ shop }: { shop: MarketShop }) {
  const { t } = useTranslation()
  const [isSaved, setIsSaved] = useState(false)
  const [hovered, setHovered] = useState(false)

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

  const isPremium   = shop.plan === 'premium'
  const accentColor = shop.shop_color || (isPremium ? '#C9A84C' : '#3B82F6')
  const nameFont    = SHOP_FONTS[shop.shop_font || ''] || SHOP_FONTS['Inter']
  const init        = (shop.shop_name || 'SH').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()

  // Parse products from JSON string
  let products: ShopProduct[] = []
  try { products = JSON.parse(shop.shop_products || '[]') } catch {}
  const visibleProds = products.slice(0, 3)
  const extraProds   = Math.max(products.length - 3, 0)

  return (
    <div
      onMouseOver={() => setHovered(true)}
      onMouseOut={() => setHovered(false)}
      style={{
        background: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        border: isPremium ? '2px solid rgba(201,168,76,0.30)' : '1.5px solid #E2E8F0',
        boxShadow: hovered
          ? '0 20px 50px rgba(13,27,62,0.16)'
          : isPremium ? '0 4px 20px rgba(201,168,76,0.12)' : '0 2px 10px rgba(15,23,42,0.06)',
        transform: hovered ? 'translateY(-5px)' : 'translateY(0)',
        transition: 'all 0.25s cubic-bezier(0.34,1.2,0.64,1)',
        cursor: 'pointer',
      }}>

      {/* ── Header — shop identity ─────────────────── */}
      <div style={{ background: `linear-gradient(135deg,${accentColor}40 0%,${accentColor}80 50%,#050B2E 100%)`, padding: '13px 13px 10px', position: 'relative' }}>
        {/* Badges */}
        <div style={{ display: 'flex', gap: 5, marginBottom: 8 }}>
          {isPremium && (
            <span style={{ background: 'linear-gradient(135deg,#C9A84C,#E0B85A)', color: '#0F172A', fontSize: 9, fontWeight: 900, padding: '3px 10px', borderRadius: 999, letterSpacing: '0.06em' }}>
              ★ PREMIUM
            </span>
          )}
        </div>

        {/* Logo + Name row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 0 }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(255,255,255,0.16)', border: '2px solid rgba(255,255,255,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color: '#fff', flexShrink: 0, backdropFilter: 'blur(8px)' }}>
            {shop.shop_logo ? <img src={shop.shop_logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 9 }} loading="lazy" /> : init}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: nameFont, fontWeight: 800, fontSize: 14, color: '#fff', letterSpacing: '-0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {shop.shop_name}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.50)', marginTop: 1, display: 'flex', alignItems: 'center', gap: 4 }}>
              <MapPin size={8} /> {shop.shop_region}
              {shop.shop_category && <> &middot; {shop.shop_category}</>}
            </div>
          </div>
          {/* Save heart */}
          <button onClick={toggleSave}
            style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.22)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'transform .15s' }}
            onMouseOver={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1.18)'}
            onMouseOut={e  => (e.currentTarget as HTMLElement).style.transform = 'scale(1)'}>
            <Heart size={13} color={isSaved ? '#EF4444' : 'rgba(255,255,255,0.7)'} fill={isSaved ? '#EF4444' : 'none'} />
          </button>
        </div>
      </div>

      {/* ── SHOP WINDOW — product display ──────────── */}
      <div style={{ padding: '10px 12px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <div style={{ flex: 1, height: 1, background: '#F1F5F9' }} />
          <span style={{ fontSize: 8, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.12em', textTransform: 'uppercase' as const }}>
            Products
          </span>
          <div style={{ flex: 1, height: 1, background: '#F1F5F9' }} />
        </div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
          {visibleProds.length > 0 ? visibleProds.map((p, i) => (
            <div key={i} style={{ flex: 1, background: '#F8FAFF', border: '1.5px solid #E8EDF4', borderRadius: 11, overflow: 'hidden', transition: 'border-color .15s, transform .15s' }}
              onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = accentColor; (e.currentTarget as HTMLElement).style.transform = 'scale(1.04)' }}
              onMouseOut={e  => { (e.currentTarget as HTMLElement).style.borderColor = '#E8EDF4'; (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}>
              <div style={{ height: 56, background: `linear-gradient(135deg,${accentColor}14,${accentColor}30)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Store size={22} color={accentColor} strokeWidth={1.5} />
              </div>
              <div style={{ padding: '4px 5px 5px' }}>
                <div style={{ fontSize: 8, fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.3 }}>{p.name}</div>
                <div style={{ fontSize: 8, fontWeight: 800, color: isPremium ? '#A07830' : '#2563EB', marginTop: 2 }}>
                  TZS {Number(p.price).toLocaleString('en-US')}
                </div>
              </div>
            </div>
          )) : (
            // Placeholder tiles when no products registered
            [1,2,3].map(i => (
              <div key={i} style={{ flex: 1, height: 80, background: '#F8FAFF', border: '1.5px dashed #E2E8F0', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Store size={18} color="#CBD5E1" strokeWidth={1.2} />
              </div>
            ))
          )}

          {extraProds > 0 && (
            <div style={{ flex: 1, background: `${accentColor}12`, border: `1.5px dashed ${accentColor}50`, borderRadius: 11, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: accentColor }}>+{extraProds}</div>
              <div style={{ fontSize: 7, color: accentColor, fontWeight: 700, opacity: 0.7 }}>more</div>
            </div>
          )}
        </div>
      </div>

      {/* ── Actions ─────────────────────────────────── */}
      <div style={{ padding: '0 12px 13px', display: 'flex', gap: 7 }}>
        <a href={`/store/${shop.id}`}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '9px 10px', background: isPremium ? 'linear-gradient(135deg,#C9A84C,#E0B85A)' : '#0D1B3E', color: isPremium ? '#0F172A' : '#fff', borderRadius: 10, fontSize: 12, fontWeight: 800, textDecoration: 'none', transition: 'opacity .2s' }}
          onMouseOver={e => (e.currentTarget as HTMLElement).style.opacity = '0.87'}
          onMouseOut={e  => (e.currentTarget as HTMLElement).style.opacity = '1'}>
          <Store size={12} /> {t('market.visitShop')}
        </a>
        {/* Internal message button — NOT WhatsApp */}
        <a href={`/store/${shop.id}#contact`}
          style={{ width: 38, height: 38, background: '#EEF2FF', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', transition: 'background .15s', flexShrink: 0 }}
          title={t('messages.messageSeller')}
          onMouseOver={e => (e.currentTarget as HTMLElement).style.background = '#E0E7FF'}
          onMouseOut={e  => (e.currentTarget as HTMLElement).style.background = '#EEF2FF'}>
          <MessageCircle size={16} color="#4F46E5" />
        </a>
      </div>
    </div>
  )
}
