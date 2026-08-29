'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'
import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { sb } from '@/lib/supabase'
import { Search, MapPin, Heart, ArrowLeft, Loader2 } from 'lucide-react'
import { getCurrentBuyerId, likeShop, unlikeShop } from '@/lib/shop-likes'

// ── Config ────────────────────────────────────────────────────
const REGIONS = ['Dar es Salaam', 'Arusha', 'Mwanza', 'Dodoma', 'Tanga']

const MARKET_CONFIG: Record<string, {
  labelKey: string; color: string;
  categories: string[]; allCats: string[]
}> = {
  fashion: {
    labelKey: 'market.marketFashionLabel',
    color: 'var(--sn-primary)',
    // Must match MARKET_CATS in app/open-store/page.tsx exactly
    categories: ['Clothing','Shoes','Accessories','Beauty','Jewelry','Sports & Fitness','Arts & Crafts',
                 'Fashion & Clothing','Beauty & Health'],
    allCats:    ['Clothing','Shoes','Accessories','Beauty','Jewelry','Sports & Fitness','Arts & Crafts'],
  },
  vehicle: {
    labelKey: 'market.marketVehicleLabel',
    color: 'var(--sn-text)',
    categories: ['Cars','Motorcycles','Spare Parts','Tyres','Auto Accessories','Automotive'],
    allCats:    ['Cars','Motorcycles','Spare Parts','Tyres','Auto Accessories'],
  },
  electronics: {
    labelKey: 'market.marketElectronicsLabel',
    color: 'var(--sn-primary)',
    categories: ['Phones','Laptops','TVs','Audio','Appliances','Gaming','Other Electronics',
                 'Electronics','Technology','Books & Stationery'],
    allCats:    ['Phones','Laptops','TVs','Audio','Appliances','Gaming','Other Electronics'],
  },
}

type Shop = {
  id: string; owner_name: string; owner_phone: string | null
  shop_name: string; shop_category: string | null; shop_region: string | null
  shop_whatsapp: string | null; shop_desc: string | null
  shop_color: string | null; shop_logo: string | null; shop_market: string | null
  plan: 'premium' | 'basic'
  status: string; created_at: string
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
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())
  const [buyerId,  setBuyerId]  = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!cfg) {return}
    setLoading(true)
    try {
      const { data } = await sb
        .from('pending_payments')
        .select('id,owner_name,owner_phone,shop_name,shop_category,shop_region,shop_whatsapp,shop_desc,shop_color,shop_market,plan,status,shop_logo,created_at')
        .eq('status', 'approved')
        .order('plan', { ascending: false })
        .order('created_at', { ascending: false })

      if (!data) { setShops([]); return }

      // Prefer explicit shop_market; fall back to category-inference for
      // shops that applied before that column existed (see Batch 1).
      const filtered = data.filter((s: any) =>
        s.shop_market ? s.shop_market === market : cfg.categories.includes(s.shop_category || '')
      )

      setShops(filtered as unknown as Shop[])
    } finally {
      setLoading(false)
    }
  }, [market, cfg])

  useEffect(() => { load() }, [load])

  // Load which of these shops the current buyer has already liked (single
  // batched query, not one-per-card) so the heart icon reflects real state.
  useEffect(() => {
    if (shops.length === 0) {return}
    let cancelled = false
    ;(async () => {
      const id = await getCurrentBuyerId()
      if (cancelled) {return}
      setBuyerId(id)
      if (!id) {return}
      const { data } = await sb.from('shop_likes').select('store_id').eq('user_id', id).in('store_id', shops.map(s => s.id))
      if (!cancelled && data) {setLikedIds(new Set(data.map((r: any) => r.store_id)))}
    })()
    return () => { cancelled = true }
  }, [shops])

  const toggleLike = async (e: React.MouseEvent, storeId: string) => {
    e.preventDefault(); e.stopPropagation()
    if (!buyerId) { window.location.href = '/auth'; return }
    const wasLiked = likedIds.has(storeId)
    setLikedIds(prev => {
      const next = new Set(prev)
      wasLiked ? next.delete(storeId) : next.add(storeId)
      return next
    })
    const { error } = wasLiked ? await unlikeShop(storeId, buyerId) : await likeShop(storeId, buyerId)
    if (error) {
      // Revert on failure
      setLikedIds(prev => {
        const next = new Set(prev)
        wasLiked ? next.add(storeId) : next.delete(storeId)
        return next
      })
    }
  }

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
          <p style={{ color: 'var(--sn-muted)' }}>{t('market.marketNotFound')}</p>
          <Link href="/market" style={{ color: 'var(--sn-text)', fontWeight: 700, fontSize: '0.85rem' }}>← {t('market.backToMarketplaces')}</Link>
        </div>
      </main>
    )
  }

  const marketLabel = t(cfg.labelKey)

  return (
    <main style={{ minHeight: '100vh', background: 'var(--sn-page)', paddingTop: 68 }}>
      <SiteNav />
      <style>{`
        .mk-chip{display:inline-flex;align-items:center;gap:5px;padding:6px 14px;border-radius:999px;font-size:0.75rem;font-weight:700;cursor:pointer;border:1.5px solid var(--sn-border);background:var(--sn-bg);color:var(--sn-muted);white-space:nowrap;transition:border-color 0.15s,background 0.15s,color 0.15s}
        .mk-chip.active{background:var(--sn-text);color:var(--sn-page);border-color:var(--sn-text)}
        .mk-chip:hover:not(.active){border-color:var(--sn-border-strong)}
        .shop-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.1rem}
        @media(max-width:600px){.shop-grid{grid-template-columns:1fr}}
      `}</style>

      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '1rem 1rem 4rem' }}>

        {/* Back + Header */}
        <div style={{ marginBottom: '1rem' }}>
          <Link href="/market" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--sn-muted)', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none', marginBottom: '1rem' }}>
            <ArrowLeft size={13} /> {t('market.backToMarketplaces')}
          </Link>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--sn-text)', letterSpacing: '-0.02em' }}>
            {marketLabel}
          </h1>
          <p style={{ color: 'var(--sn-muted)', fontSize: '0.83rem', marginTop: '0.25rem' }}>
            {loading ? '...' : t(shops.length === 1 ? 'market.verifiedStoreCount' : 'market.verifiedStoresCount', { count: shops.length })}
          </p>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '1rem' }}>
          <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--sn-subtle)' }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder={t('market.searchInMarket', { market: marketLabel.toLowerCase() })}
            style={{ width: '100%', boxSizing: 'border-box', paddingLeft: 38, paddingRight: 16, paddingTop: 11, paddingBottom: 11, border: '1.5px solid var(--sn-input-border)', borderRadius: 12, fontSize: '0.85rem', outline: 'none', background: 'var(--sn-input)', color: 'var(--sn-text)' }}
          />
        </div>

        {/* Region filter */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
          <button className={`mk-chip${!region ? ' active' : ''}`} onClick={() => setRegion('')}>{t('market.allRegionsChip')}</button>
          {REGIONS.map(r => (
            <button key={r} className={`mk-chip${region === r ? ' active' : ''}`} onClick={() => setRegion(r === region ? '' : r)}>
              <MapPin size={11} />{r}
            </button>
          ))}
        </div>

        {/* Category filter */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
          <button className={`mk-chip${!category ? ' active' : ''}`} onClick={() => setCategory('')}>{t('market.allCategoriesChip')}</button>
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
            <p style={{ fontSize: '0.85rem' }}>{t('market.loadingStores')}</p>
          </div>
        ) : visible.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--sn-muted)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🏪</div>
            <p style={{ fontWeight: 700, color: 'var(--sn-text)', marginBottom: '0.4rem' }}>{t('market.noStoresFound')}</p>
            <p style={{ fontSize: '0.83rem' }}>{t('market.adjustFilters')}</p>
            <button onClick={() => { setSearch(''); setRegion(''); setCategory('') }}
              style={{ marginTop: '1rem', padding: '8px 20px', borderRadius: 999, border: '1.5px solid var(--sn-border)', background: 'var(--sn-bg)', color: 'var(--sn-text)', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
              {t('market.clearFilters')}
            </button>
          </div>
        ) : (
          <div className="shop-grid">
            {visible.map(shop => (
              <ShopCard key={shop.id} shop={shop} accentColor={cfg.color}
                liked={likedIds.has(shop.id)} onToggleLike={e => toggleLike(e, shop.id)} t={t} />
            ))}
          </div>
        )}
      </section>

      <SiteFooter />
    </main>
  )
}

// ── ShopCard ──────────────────────────────────────────────────
function ShopCard({ shop, accentColor, liked, onToggleLike, t }: {
  shop: Shop; accentColor: string; liked: boolean
  onToggleLike: (e: React.MouseEvent) => void
  t: (k: string, vars?: Record<string, string | number>) => string
}) {
  const [hovered, setHovered] = useState(false)

  const isPremium  = shop.plan === 'premium'
  const color      = shop.shop_color || (isPremium ? '#1D4ED8' : accentColor)
  const init       = (shop.shop_name || 'SH').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <Link href={`/store/${shop.id}`} style={{ textDecoration: 'none' }}>
      <div
        onMouseOver={() => setHovered(true)} onMouseOut={() => setHovered(false)}
        style={{
          background: 'var(--sn-bg)', borderRadius: 20, overflow: 'hidden',
          border: isPremium ? '2px solid rgba(29,78,216,0.30)' : '1.5px solid var(--sn-border)',
          boxShadow: hovered ? '0 16px 40px rgba(13,27,62,0.14)' : isPremium ? '0 4px 20px rgba(29,78,216,0.10)' : '0 2px 10px rgba(15,23,42,0.06)',
          transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
          transition: 'box-shadow 0.22s ease, transform 0.22s ease',
          cursor: 'pointer',
        }}>

        {/* Header */}
        <div style={{ background: 'var(--sn-bg)', padding: '14px 14px 10px', position: 'relative', borderBottom: '1px solid var(--sn-border)' }}>
          {isPremium && (
            <span style={{ position: 'absolute', top: 10, right: 10, background: 'linear-gradient(135deg,#1D4ED8,#2563EB)', color: '#fff', fontSize: 9, fontWeight: 900, padding: '3px 9px', borderRadius: 999, letterSpacing: '0.06em' }}>
              ★ {t('market.premiumBadge')}
            </span>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--sn-page)', border: '1.5px solid var(--sn-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 900, color: color, flexShrink: 0, overflow: 'hidden' }}>
              {shop.shop_logo
                ? <img src={shop.shop_logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                : init}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--sn-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {shop.shop_name}
              </div>
              <div style={{ fontSize: 10, color: 'var(--sn-subtle)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={8} color="#1D4ED8" /> {shop.shop_region}
                {shop.shop_category && <> · {shop.shop_category}</>}
              </div>
            </div>
            <button onClick={onToggleLike}
              style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--sn-bg)', border: '1.5px solid var(--sn-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              aria-label={liked ? t('store.liked') : t('store.likeShop')}
              title={liked ? t('store.liked') : t('store.likeShop')}>
              <Heart size={12} fill={liked ? '#FF4D6D' : 'none'} color={liked ? '#FF4D6D' : 'var(--sn-subtle)'} />
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
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--sn-subtle)', fontWeight: 600 }}>
              {isPremium ? `★ ${t('market.premiumBadge')}` : t('market.basicBadge')}
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--sn-text)' }}>
              {t('market.visitStore')} →
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

