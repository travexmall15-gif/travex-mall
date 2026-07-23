'use client'
import NextImage from "next/image"

import { Suspense, useState, useEffect } from 'react'
import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'
import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { sb } from '@/lib/supabase'
import { MARKET_BASIC_PRICE, MARKET_PREMIUM_PRICE, MARKET_TOTAL_SLOTS, formatTZS } from '@/lib/data'
import { Search, Store, Loader2 } from 'lucide-react'

// ── Region + Category data (proper nouns stay the same in both languages) ──
const TANZANIAN_REGIONS = [
  'Dar es Salaam', 'Mwanza', 'Arusha', 'Dodoma', 'Mbeya',
  'Morogoro', 'Tanga', 'Zanzibar', 'Kigoma', 'Tabora',
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
  const [category, setCategory]   = useState('')   // '' = All
  const [region, setRegion]       = useState('')    // '' = All
  const [categories, setCategories] = useState<string[]>([])
  const [totalApproved, setTotalApproved] = useState(0)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data } = await sb
        .from('pending_payments')
        .select('*')
        .eq('status', 'approved')
        .order('plan', { ascending: false })
        .order('created_at', { ascending: false })

      if (data) {
        setShops(data)
        setTotalApproved(data.length)
        const dbCats = [...new Set(
          data.map((s: MarketShop) => s.shop_category).filter(Boolean)
        )] as string[]
        const allCats = [...new Set([...SHOP_CATEGORIES, ...dbCats])]
        setCategories(allCats)
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

        {/* Filters */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.25rem' }}>

          {/* Region filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', scrollbarWidth: 'none' as const, paddingBottom: '2px' }}>
            <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' as const, letterSpacing: '0.08em', whiteSpace: 'nowrap' as const, flexShrink: 0, minWidth: '52px' }}>
              {t('market.region')}
            </span>
            {/* All regions button */}
            <button
              onClick={() => setRegion('')}
              style={{ padding: '5px 14px', borderRadius: '8px', border: '1.5px solid', borderColor: region === '' ? '#0D1B3E' : '#E2E8F0', background: region === '' ? '#0D1B3E' : '#fff', color: region === '' ? '#fff' : '#475569', fontSize: '0.74rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' as const, flexShrink: 0, transition: 'all 0.15s', fontFamily: "'Inter',sans-serif" }}
            >
              {t('market.allRegions')}
            </button>
            {regions.map(r => (
              <button
                key={r}
                onClick={() => setRegion(r === region ? '' : r)}
                style={{ padding: '5px 14px', borderRadius: '8px', border: '1.5px solid', borderColor: region === r ? '#0D1B3E' : '#E2E8F0', background: region === r ? '#0D1B3E' : '#fff', color: region === r ? '#fff' : '#475569', fontSize: '0.74rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' as const, flexShrink: 0, transition: 'all 0.15s', fontFamily: "'Inter',sans-serif" }}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Category filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', scrollbarWidth: 'none' as const, paddingBottom: '2px' }}>
            <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' as const, letterSpacing: '0.08em', whiteSpace: 'nowrap' as const, flexShrink: 0, minWidth: '52px' }}>
              {t('market.category')}
            </span>
            {/* All categories button */}
            <button
              onClick={() => setCategory('')}
              style={{ padding: '5px 14px', borderRadius: '8px', border: '1.5px solid', borderColor: category === '' ? '#C9A84C' : '#E2E8F0', background: category === '' ? '#C9A84C' : '#fff', color: category === '' ? '#0F172A' : '#475569', fontSize: '0.74rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' as const, flexShrink: 0, transition: 'all 0.15s', fontFamily: "'Inter',sans-serif" }}
            >
              {t('market.allCategories')}
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat === category ? '' : cat)}
                style={{ padding: '5px 14px', borderRadius: '8px', border: '1.5px solid', borderColor: category === cat ? '#C9A84C' : '#E2E8F0', background: category === cat ? '#C9A84C' : '#fff', color: category === cat ? '#0F172A' : '#475569', fontSize: '0.74rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' as const, flexShrink: 0, transition: 'all 0.15s', fontFamily: "'Inter',sans-serif" }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

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
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🏪</div>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: '1.1rem' }}>
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

// ── SHOP CARD ────────────────────────────────────────────────
// Uses useTranslation() directly — no need to pass t as prop
function ShopCard({ shop }: { shop: MarketShop }) {
  const { t } = useTranslation()
  const init      = shop.shop_name.split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase()
  const isPremium = shop.plan === 'premium'
  const color     = shop.shop_color || (isPremium ? '#C9A84C' : '#3B82F6')

  return (
    <div
      style={{ background: '#fff', border: `1.5px solid ${isPremium ? 'rgba(201,168,76,0.20)' : '#EEF0F6'}`, borderRadius: '16px', overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer', boxShadow: '0 1px 6px rgba(15,23,42,0.06)' }}
      onMouseOver={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-3px)'; el.style.boxShadow = '0 10px 28px rgba(15,23,42,0.10)' }}
      onMouseOut={e  => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(0)';   el.style.boxShadow = '0 1px 6px rgba(15,23,42,0.06)'  }}
    >
      {/* Banner */}
      <div style={{ height: '70px', position: 'relative', overflow: 'hidden' }}>
        {shop.shop_banner
          ? <img src={shop.shop_banner} alt={`${shop.shop_name || 'Shop'} banner`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
          : <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${color}55 0%, ${color}99 50%, #050B2E 100%)` }} />
        }
        {/* Plan badge — translated */}
        <div style={{ position: 'absolute', top: '6px', right: '8px', background: isPremium ? '#C9A84C' : 'rgba(255,255,255,0.85)', color: isPremium ? '#0F172A' : '#64748B', fontSize: '0.52rem', fontWeight: 800, padding: '2px 7px', borderRadius: '999px', letterSpacing: '0.04em' }}>
          {isPremium ? t('market.premiumBadge') : t('market.basicBadge')}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '0.45rem 0.7rem 0.6rem' }}>
        {/* Logo + shop name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '7px', border: '1.5px solid #E8ECF4', overflow: 'hidden', flexShrink: 0, background: `linear-gradient(135deg, ${color}, #050B2E)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {shop.shop_logo
              ? <img src={shop.shop_logo} alt={`${shop.shop_name || 'Shop'} logo`} style={{ width: '100%', height: '100%', objectFit: 'cover' }}  loading="lazy" />
              : <span style={{ fontSize: '0.62rem', fontWeight: 900, color: '#fff' }}>{init}</span>
            }
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: '0.76rem', color: '#0F172A', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{shop.shop_name}</div>
            {shop.shop_region && (
              <div style={{ fontSize: '0.58rem', color: '#94A3B8', marginTop: '1px' }}>{shop.shop_region}</div>
            )}
          </div>
        </div>

        {/* Category tag */}
        {shop.shop_category && (
          <div style={{ marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.58rem', background: 'rgba(201,168,76,0.10)', color: '#92741a', padding: '2px 7px', borderRadius: '999px', fontWeight: 700 }}>
              {shop.shop_category}
            </span>
          </div>
        )}

        {/* Description */}
        {shop.shop_desc && (
          <p style={{ fontSize: '0.65rem', color: '#94A3B8', lineHeight: 1.45, marginBottom: '0.3rem', display: '-webkit-box', WebkitLineClamp: 2 as any, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden' }}>
            {shop.shop_desc}
          </p>
        )}

        {/* Visit Shop button — translated */}
        <a
          href={`/store/${shop.id}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 12px', background: isPremium ? '#C9A84C' : '#0D1B3E', color: isPremium ? '#0F172A' : '#fff', borderRadius: '7px', fontSize: '0.65rem', fontWeight: 700, textDecoration: 'none', transition: 'opacity 0.2s' }}
          onMouseOver={e => (e.currentTarget as HTMLElement).style.opacity = '0.82'}
          onMouseOut={e  => (e.currentTarget as HTMLElement).style.opacity = '1'}
        >
          <Store size={10} /> {t('market.visitShop')}
        </a>
      </div>
    </div>
  )
}
