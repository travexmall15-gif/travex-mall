'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'
import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { getMarketStores } from '@/lib/supabase-cache'
import { Search, MapPin, Heart, ArrowLeft, Loader2 } from 'lucide-react'

// ── Config ────────────────────────────────────────────────────
const REGIONS = ['Dar es Salaam', 'Arusha', 'Mwanza', 'Dodoma', 'Tanga']

const MARKET_CONFIG: Record<string, {
  label: string; emoji: string; color: string;
  categories: string[]; allCats: string[]
}> = {
  fashion: {
    label: 'Fashion Market',
    emoji: '👗',
    color: '#BE185D',
    categories: ['Fashion & Clothing','Beauty & Health','Sports & Fitness','Arts & Crafts'],
    allCats: ['Clothing','Shoes','Accessories','Beauty','Jewelry','Sports & Fitness','Arts & Crafts'],
  },
  vehicle: {
    label: 'Vehicle Market',
    emoji: '🚗',
    color: 'var(--sn-text)',
    categories: ['Automotive'],
    allCats: ['Cars','Motorcycles','Spare Parts','Tyres','Auto Accessories'],
  },
  electronics: {
    label: 'Electronics Market',
    emoji: '📱',
    color: 'var(--sn-primary)',
    categories: ['Electronics','Technology','Books & Stationery'],
    allCats: ['Phones','Laptops','TVs','Audio','Appliances','Gaming','Other Electronics'],
  },
}

const SHOP_FONTS: Record<string, string> = {
  'Inter':            "'Inter', sans-serif",
  'Playfair Display': "'Playfair Display', Georgia, serif",
  'Montserrat':       "'Montserrat', 'Inter', sans-serif",
  'Dancing Script':   "'Dancing Script', cursive",
  'Raleway':          "'Raleway', 'Inter', sans-serif",
}

type Shop = {
  id: string; owner_name: string; owner_phone: string | null
  shop_name: string; shop_category: string | null; shop_region: string | null
  shop_whatsapp: string | null; shop_desc: string | null
  shop_color: string | null; shop_logo: string | null; shop_font: string | null
  shop_products: string | null; plan: 'premium' | 'basic'
  status: string; slug: string | null; created_at: string
}

// ── Main Component ─────────────────────────────────────────────
export default function MarketInnerPage() {
  const params = useParams()
  const market = (params?.market as string || '').toLowerCase()
  const cfg    = MARKET_CONFIG[market]

  const { t } = useTranslation()
  const [shops,    setShops]    = useState<Shop[]>([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [region,   setRegion]   = useState('')
  const [category, setCategory] = useState('')


  const load = useCallback(async () => {
    if (!cfg) return
    setLoading(true)
    try {
      const data = await getMarketStores(market)

      if (!data) { setShops([]); return }

      // Filter by market: use shop_market if set, else derive from category
      const filtered = data.filter((s: any) => {
        if (s.shop_market) return s.shop_market === market
        return cfg.categories.includes(s.shop_category || '')
      })

      setShops(filtered as Shop[])
    } finally {
      setLoading(false)
    }
  }, [market, cfg])

  useEffect(() => { load() }, [load])

  // Client-side filters
  const visible = shops.filter(s => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      s.shop_name.toLowerCase().includes(q) ||
      (s.shop_desc || '').toLowerCase().includes(q)
    const matchRegion   = !region   || s.shop_region   === region
    const matchCategory = !category || s.shop_category === category ||
      (cfg?.allCats.includes(category))
    return matchSearch && matchRegion && matchCategory
  })

  // 404 guard
  if (!cfg) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔍</div>
          <p style={{ color: 'var(--sn-muted)' }}>Market not found</p>
          <Link href="/market" style={{ color: 'var(--sn-text)', fontWeight: 700, fontSize: '0.85rem' }}>← Back to Marketplaces</Link>
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--sn-page)' }}>
      <SiteNav />
      <style>{`
        .mk-chip{display:inline-flex;align-items:center;gap:5px;padding:6px 14px;border-radius:999px;font-size:0.75rem;font-weight:700;cursor:pointer;border:1.5px solid #E2E8F0;background:#fff;color:#475569;white-space:nowrap;transition:border-color 0.15s,background 0.15s,color 0.15s}
        .mk-chip.active{background:#111827;color:#fff;border-color:#111827}
        .mk-chip:hover:not(.active){border-color:#D1D5DB;background:#F9FAFB}
        .shop-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.1rem}
        @media(max-width:600px){.shop-grid{grid-template-columns:1fr}}
      `}</style>

      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '1.5rem 1rem 4rem' }}>

        {/* Back + Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link href="/market" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--sn-muted)', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none', marginBottom: '1rem' }}>
            <ArrowLeft size={13} /> Business Marketplaces
          </Link>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--sn-text)', letterSpacing: '-0.02em' }}>
            {cfg.label}
          </h1>
          <p style={{ color: 'var(--sn-muted)', fontSize: '0.83rem', marginTop: '0.25rem' }}>
            {loading ? '...' : `${shops.length} verified ${shops.length === 1 ? 'store' : 'stores'}`}
          </p>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '1rem' }}>
          <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--sn-subtle)' }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder={`Search ${cfg.label.toLowerCase()}...`}
            style={{ width: '100%', boxSizing: 'border-box', paddingLeft: 38, paddingRight: 16, paddingTop: 11, paddingBottom: 11, border: '1.5px solid #E2E8F0', borderRadius: 12, fontSize: '0.85rem', outline: 'none', background: 'var(--sn-bg)', color: 'var(--sn-text)' }}
          />
        </div>

        {/* Region filter */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
          <button className={`mk-chip${!region ? ' active' : ''}`} onClick={() => setRegion('')}>All Regions</button>
          {REGIONS.map(r => (
            <button key={r} className={`mk-chip${region === r ? ' active' : ''}`} onClick={() => setRegion(r === region ? '' : r)}>
              <MapPin size={11} />{r}
            </button>
          ))}
        </div>

        {/* Category filter */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
          <button className={`mk-chip${!category ? ' active' : ''}`} onClick={() => setCategory('')}>All Categories</button>
          {cfg.allCats.map(c => (
            <button key={c} className={`mk-chip${category === c ? ' active' : ''}`} onClick={() => setCategory(c === category ? '' : c)}>
              {c}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--sn-muted)' }}>
            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px', display: 'block', color: 'var(--sn-text)' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <p style={{ fontSize: '0.85rem' }}>Loading stores...</p>
          </div>
        ) : visible.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--sn-muted)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🏪</div>
            <p style={{ fontWeight: 700, color: 'var(--sn-text)', marginBottom: '0.4rem' }}>No stores found</p>
            <p style={{ fontSize: '0.83rem' }}>Try adjusting your filters</p>
            <button onClick={() => { setSearch(''); setRegion(''); setCategory('') }}
              style={{ marginTop: '1rem', padding: '8px 20px', borderRadius: 999, border: '1.5px solid #E2E8F0', background: 'var(--sn-bg)', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
              Clear filters
            </button>
          </div>
        ) : (
          <div className="shop-grid">
            {visible.map(shop => <ShopCard key={shop.id} shop={shop} accentColor={cfg.color} />)}
          </div>
        )}
      </section>

      <SiteFooter />
    </main>
  )
}

// ── ShopCard ──────────────────────────────────────────────────
function ShopCard({ shop, accentColor }: { shop: Shop; accentColor: string }) {
  const [saved,   setSaved]   = useState(false)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    try {
      const list = JSON.parse(localStorage.getItem('sn_saved_shops') || '[]')
      setSaved(list.some((s: any) => s.id === shop.id))
    } catch {}
  }, [shop.id])

  const toggleSave = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    try {
      const list = JSON.parse(localStorage.getItem('sn_saved_shops') || '[]')
      if (saved) {
        localStorage.setItem('sn_saved_shops', JSON.stringify(list.filter((s: any) => s.id !== shop.id)))
        setSaved(false)
      } else {
        list.push({ id: shop.id, shop_name: shop.shop_name, shop_category: shop.shop_category, shop_region: shop.shop_region, plan: shop.plan, saved_at: new Date().toISOString() })
        localStorage.setItem('sn_saved_shops', JSON.stringify(list))
        setSaved(true)
      }
    } catch {}
  }

  const isPremium  = shop.plan === 'premium'
  const color      = shop.shop_color || (isPremium ? '#1D4ED8' : accentColor)
  const nameFont   = SHOP_FONTS[shop.shop_font || ''] || SHOP_FONTS['Inter']
  const init       = (shop.shop_name || 'SH').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  let products: { name: string; price: number; image?: string }[] = []
  try { products = JSON.parse(shop.shop_products || '[]') } catch {}

  return (
    <Link href={`/store/${shop.id}`} style={{ textDecoration: 'none' }}>
      <div
        onMouseOver={() => setHovered(true)} onMouseOut={() => setHovered(false)}
        style={{
          background: 'var(--sn-bg)', borderRadius: 20, overflow: 'hidden',
          border: isPremium ? '2px solid rgba(29,78,216,0.30)' : '1.5px solid #E2E8F0',
          boxShadow: hovered ? '0 16px 40px rgba(13,27,62,0.14)' : isPremium ? '0 4px 20px rgba(29,78,216,0.10)' : '0 2px 10px rgba(15,23,42,0.06)',
          transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
          transition: 'box-shadow 0.22s ease, transform 0.22s ease',
          cursor: 'pointer',
        }}>

        {/* Header — light design */}
        <div style={{ background: 'var(--sn-bg)', padding: '14px 14px 10px', position: 'relative', borderBottom: '1px solid #F1F5F9' }}>
          {isPremium && (
            <span style={{ position: 'absolute', top: 10, right: 10, background: 'linear-gradient(135deg,#1D4ED8,#2563EB)', color: '#fff', fontSize: 9, fontWeight: 900, padding: '3px 9px', borderRadius: 999, letterSpacing: '0.06em' }}>
              ★ PREMIUM
            </span>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: '#EEF2FF', border: '1.5px solid var(--sn-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 900, color: color, flexShrink: 0, overflow: 'hidden' }}>
              {shop.shop_logo
                ? <img src={shop.shop_logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                : init}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: nameFont, fontWeight: 800, fontSize: 14, color: 'var(--sn-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {shop.shop_name}
              </div>
              <div style={{ fontSize: 10, color: 'var(--sn-subtle)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={8} color="#1D4ED8" /> {shop.shop_region}
                {shop.shop_category && <> · {shop.shop_category}</>}
              </div>
            </div>
            <button onClick={toggleSave}
              style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--sn-bg)', border: '1.5px solid #E2E8F0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              title={saved ? 'Unsave' : 'Save store'}>
              <Heart size={12} fill={saved ? '#FF4D6D' : 'none'} color={saved ? '#FF4D6D' : '#94A3B8'} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '12px 13px' }}>
          {shop.shop_desc && (
            <p style={{ fontSize: '0.75rem', color: 'var(--sn-muted)', lineHeight: 1.5, marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {shop.shop_desc}
            </p>
          )}
          {products.length > 0 && (
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {products.slice(0, 3).map((p, i) => (
                <span key={i} style={{ fontSize: '0.68rem', background: 'var(--sn-bg)', color: 'var(--sn-muted)', padding: '3px 9px', borderRadius: 999, fontWeight: 600 }}>
                  {p.name} {p.price ? `· TZS ${Number(p.price).toLocaleString()}` : ''}
                </span>
              ))}
            </div>
          )}
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--sn-subtle)', fontWeight: 600 }}>
              {isPremium ? '★ Premium' : 'Basic'}
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--sn-text)' }}>
              Visit store →
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
