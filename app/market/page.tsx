'use client'
import { useLanguage } from '@/lib/useLanguage'
import { t } from '@/lib/i18n'

const TANZANIAN_REGIONS = [
  'All', 'Dar es Salaam', 'Mwanza', 'Arusha', 'Dodoma', 'Mbeya',
  'Morogoro', 'Tanga', 'Zanzibar', 'Kigoma', 'Tabora',
]

const SHOP_CATEGORIES = [
  'All', 'Fashion & Clothing', 'Electronics', 'Food & Groceries',
  'Beauty & Health', 'Agriculture', 'Services', 'Home & Living',
  'Sports & Fitness', 'Education', 'Automotive', 'Arts & Crafts',
]

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { sb } from '@/lib/supabase'
import {
  MARKET_BASIC_PRICE, MARKET_PREMIUM_PRICE, MARKET_TOTAL_SLOTS, formatTZS,
} from '@/lib/data'
import { Search, MessageCircle, Store, ArrowRight, Star, Loader2 } from 'lucide-react'

// Types matching pending_payments table
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


export default function MarketPage() {
  const { lang } = useLanguage()
  const [shops, setShops] = useState<MarketShop[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [categories, setCategories] = useState<string[]>([])
  const [totalApproved, setTotalApproved] = useState(0)
  const [region, setRegion] = useState('All')

  useEffect(() => {
    async function load() {
      setLoading(true)
      // Fetch approved shops from pending_payments
      const { data, error } = await sb
        .from('pending_payments')
        .select('*')
        .eq('status', 'approved')
        .order('plan', { ascending: false }) // premium first
        .order('created_at', { ascending: false })

      if (data) {
        setShops(data)
        setTotalApproved(data.length)
        // Build category list from real data
        const dbCats = [...new Set(data.map((s: MarketShop) => s.shop_category).filter(Boolean))] as string[]
        const allCats = [...new Set([...SHOP_CATEGORIES.filter(c => c !== 'All'), ...dbCats])]
        setCategories(allCats)
      }
      setLoading(false)
    }
    load()
  }, [])

  // Merge hardcoded regions with any new ones from DB
  const dbRegions = Array.from(new Set(shops.map(s => s.shop_region).filter(Boolean))) as string[]
  const regions = [...new Set([...TANZANIAN_REGIONS, ...dbRegions])]

  const filtered = shops.filter(s => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      s.shop_name.toLowerCase().includes(q) ||
      (s.shop_desc || '').toLowerCase().includes(q) ||
      (s.owner_name || '').toLowerCase().includes(q)
    const matchCat    = category === 'All' || s.shop_category === category
    const matchRegion = region  === 'All' || s.shop_region  === region
    return matchSearch && matchCat && matchRegion
  })

  const slotsLeft = MARKET_TOTAL_SLOTS - totalApproved
  const premiumShops = filtered.filter(s => s.plan === 'premium')
  const basicShops = filtered.filter(s => s.plan === 'basic')

  return (
    <main style={{ fontFamily: "'Inter', sans-serif", background: '#F8FAFF', minHeight: '100vh' }}>
      <SiteNav />

      {/* ── BUSINESS MARKET HERO ── */}
      <section style={{
        position: 'relative',
        overflow: 'hidden',
        paddingTop: '64px',
        color: '#fff',
        background: 'linear-gradient(160deg, #010510 0%, #030920 35%, #050E2E 65%, #071540 100%)',
      }}>
        {/* Subtle glow */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 60% 80% at 90% 20%, rgba(56,120,255,0.35) 0%, transparent 65%)', zIndex: 0 }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '3rem 5% 0' }}>

          {/* Top row — badge + CTA */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)', padding: '0.3rem 0.9rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.06em' }}>
              <Store size={11} /> Business Market
            </div>
            <Link href="/open-store" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#C9A84C', color: '#0F172A', padding: '0.6rem 1.4rem', borderRadius: '999px', fontWeight: 700, fontSize: '0.8rem', textDecoration: 'none', boxShadow: '0 4px 16px rgba(201,168,76,0.30)' }}>
              <Store size={13} /> {t('common.openShop', lang)}
            </Link>
          </div>

          {/* Headline + description */}
          <div style={{ maxWidth: '600px', marginBottom: '2rem' }}>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem, 4.5vw, 3.4rem)', fontWeight: 900, color: '#fff', lineHeight: 1.08, marginBottom: '0.85rem', letterSpacing: '-0.01em' }}>
              <span style={{ color: '#C9A84C' }}>Business</span> Marketplace.
            </h1>
            <p style={{ fontSize: 'clamp(0.82rem, 1.5vw, 0.92rem)', color: 'rgba(255,255,255,0.45)', lineHeight: 1.8, maxWidth: '440px' }}>
              Verified sellers. All categories. Five regions. Join {loading ? '...' : totalApproved} businesses already selling on Travex Mall.
            </p>
          </div>

          {/* Plan pills — white bg, centered */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fff', borderRadius: '12px', padding: '10px 18px', boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#94A3B8', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0F172A', lineHeight: 1 }}>Basic Plan</div>
                <div style={{ fontSize: '0.63rem', color: '#64748B', marginTop: '2px' }}>{formatTZS(MARKET_BASIC_PRICE)} / month</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fff', borderRadius: '12px', padding: '10px 18px', boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#C9A84C', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0F172A', lineHeight: 1 }}>Premium Plan</div>
                <div style={{ fontSize: '0.63rem', color: '#64748B', marginTop: '2px' }}>{formatTZS(MARKET_PREMIUM_PRICE)} / month</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fff', borderRadius: '12px', padding: '10px 18px', boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#C9A84C', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0F172A', lineHeight: 1 }}>Top Estate</div>
                <div style={{ fontSize: '0.63rem', color: '#64748B', marginTop: '2px' }}>TZS 200,000 / month</div>
              </div>
            </div>
          </div>

          {/* Stats ticker — auto scroll right to left */}
          <div style={{ overflow: 'hidden', paddingBottom: '1.75rem', borderBottom: '1px solid rgba(255,255,255,0.06)', marginLeft: '-5%', marginRight: '-5%', paddingLeft: 0 }}>
            <style>{`
              @keyframes tickerRTL {
                0%   { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
              .stats-ticker { animation: tickerRTL 22s linear infinite; will-change: transform; }
              .stats-ticker:hover { animation-play-state: paused; }
            `}</style>
            <div className="stats-ticker" style={{ display: 'flex', gap: '0', width: 'max-content' }}>
              {[
                ...[
                  { val: loading ? '...' : String(shops.filter(s => s.plan === 'premium').length), label: t('market.premiumShops', lang), color: '#C9A84C' },
                  { val: loading ? '...' : String(shops.filter(s => s.plan === 'basic').length), label: t('market.basicShops', lang), color: 'rgba(255,255,255,0.6)' },
                  { val: '5', label: 'Regions', color: 'rgba(255,255,255,0.6)' },
                  { val: 'OPEN', label: t('market.registration', lang), color: '#86EFAC' },
                  { val: loading ? '...' : String(totalApproved), label: t('market.activeSelrers', lang), color: 'rgba(255,255,255,0.6)' },
                  { val: String(MARKET_TOTAL_SLOTS), label: t('market.totalSlots', lang), color: 'rgba(255,255,255,0.6)' },
                ],
                ...[
                  { val: loading ? '...' : String(shops.filter(s => s.plan === 'premium').length), label: 'Premium Shops', color: '#C9A84C' },
                  { val: loading ? '...' : String(shops.filter(s => s.plan === 'basic').length), label: 'Basic Shops', color: 'rgba(255,255,255,0.6)' },
                  { val: '5', label: 'Regions', color: 'rgba(255,255,255,0.6)' },
                  { val: 'OPEN', label: 'Registration', color: '#86EFAC' },
                  { val: loading ? '...' : String(totalApproved), label: 'Active Sellers', color: 'rgba(255,255,255,0.6)' },
                  { val: String(MARKET_TOTAL_SLOTS), label: 'Total Slots', color: 'rgba(255,255,255,0.6)' },
                ],
              ].map((s, i) => (
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

      {/* ── QUICK ACCESS TICKER ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <style>{`
          @keyframes quickScroll {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .quick-ticker { animation: quickScroll 18s linear infinite; will-change: transform; }
          .quick-ticker:hover { animation-play-state: paused; }
          .quick-chip { transition: all 0.2s; }
          .quick-chip:hover { opacity: 0.8; transform: scale(0.97); }
        `}</style>
        <div style={{ padding: '10px 0' }}>
          <div className="quick-ticker" style={{ display: 'flex', gap: '8px', width: 'max-content', paddingLeft: '24px' }}>
            {[
              { href: '/flash-deals', label: 'Flash Deals', sub: 'Limited Time', bg: '#FEF3C7', border: '#FCD34D', color: '#92400E' },
              { href: '/group-buy',  label: 'Group Buy',   sub: 'Save Together', bg: '#DBEAFE', border: '#93C5FD', color: '#1E40AF' },
              { href: '/vybe',       label: 'Social Vybe', sub: 'Community Feed', bg: '#EDE9FE', border: '#C4B5FD', color: '#5B21B6' },
              { href: '/campus',     label: 'Campus Market', sub: 'Students Only', bg: '#ECFDF5', border: '#6EE7B7', color: '#065F46' },
              { href: '/flash-deals', label: 'Flash Deals', sub: 'Limited Time', bg: '#FEF3C7', border: '#FCD34D', color: '#92400E' },
              { href: '/group-buy',  label: 'Group Buy',   sub: 'Save Together', bg: '#DBEAFE', border: '#93C5FD', color: '#1E40AF' },
              { href: '/vybe',       label: 'Social Vybe', sub: 'Community Feed', bg: '#EDE9FE', border: '#C4B5FD', color: '#5B21B6' },
              { href: '/campus',     label: 'Campus Market', sub: 'Students Only', bg: '#ECFDF5', border: '#6EE7B7', color: '#065F46' },
            ].map((c, i) => (
              <a key={i} href={c.href} className="quick-chip" style={{ display: 'inline-flex', flexDirection: 'column', gap: '1px', background: c.bg, border: `1px solid ${c.border}`, color: c.color, padding: '6px 14px', borderRadius: '10px', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{c.label}</span>
                <span style={{ fontSize: '0.58rem', opacity: 0.7 }}>{c.sub}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── SEARCH + FILTERS + SHOPS ── */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 5% 2rem' }}>

        {/* 1. Search bar */}
        <div style={{ position: 'relative', marginBottom: '1rem' }}>
          <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('market.searchPlaceholder', lang)}
            style={{ width: '100%', paddingLeft: '2.75rem', paddingRight: '1rem', paddingTop: '0.75rem', paddingBottom: '0.75rem', border: '1.5px solid #E2E8F0', borderRadius: '12px', fontSize: '0.88rem', outline: 'none', fontFamily: "'Inter', sans-serif", background: '#fff', boxShadow: '0 1px 4px rgba(15,23,42,0.05)', transition: 'border-color 0.2s' }}
            onFocus={e => (e.target.style.borderColor = '#0D1B3E')}
            onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
          />
        </div>

        {/* Filters — Region + Category horizontal */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.25rem' }}>

          {/* Region row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', scrollbarWidth: 'none' as const, paddingBottom: '2px' }}>
            <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' as const, letterSpacing: '0.08em', whiteSpace: 'nowrap' as const, flexShrink: 0, minWidth: '52px' }}>Region</span>
            {regions.map(r => (
              <button
                key={r}
                onClick={() => setRegion(r)}
                style={{ padding: '5px 14px', borderRadius: '8px', border: '1.5px solid', borderColor: region === r ? '#0D1B3E' : '#E2E8F0', background: region === r ? '#0D1B3E' : '#fff', color: region === r ? '#fff' : '#475569', fontSize: '0.74rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' as const, flexShrink: 0, transition: 'all 0.15s' }}
              >{r}</button>
            ))}
          </div>

          {/* Category row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', scrollbarWidth: 'none' as const, paddingBottom: '2px' }}>
            <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' as const, letterSpacing: '0.08em', whiteSpace: 'nowrap' as const, flexShrink: 0, minWidth: '52px' }}>Category</span>
            {['All', ...categories].map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                style={{ padding: '5px 14px', borderRadius: '8px', border: '1.5px solid', borderColor: category === cat ? '#C9A84C' : '#E2E8F0', background: category === cat ? '#C9A84C' : '#fff', color: category === cat ? '#0F172A' : '#475569', fontSize: '0.74rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' as const, flexShrink: 0, transition: 'all 0.15s' }}
              >{cat}</button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div style={{ fontSize: '0.76rem', color: '#94A3B8', fontWeight: 500, marginBottom: '1.25rem' }}>
          {filtered.length} shop{filtered.length !== 1 ? 's' : ''} found
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '5rem 0' }}>
            <Loader2 style={{ width: '32px', height: '32px', color: '#3B82F6', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
            <p style={{ color: '#64748B', fontSize: '0.88rem' }}>Loading shops...</p>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* No shops yet */}
        {!loading && shops.length === 0 && (
          <div style={{ textAlign: 'center', padding: '6rem 0' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}></div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>No shops yet</h3>
            <p style={{ fontSize: '0.88rem', color: '#64748B', marginBottom: '1.5rem' }}>Be the first to open a shop on Travex Business Market!</p>
            <Link href="/open-store" style={{ background: '#C9A84C', color: '#0F172A', padding: '0.85rem 2rem', borderRadius: '999px', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 8px 22px rgba(201,168,76,0.30)' }}>
              Open Shop 
            </Link>
          </div>
        )}

        {/* Shops grid */}
        {!loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: '1.1rem' }}>
            {filtered.length === 0 ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '5rem 0' }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>No {t('market.shopsFound', lang).replace('{n}', String(filtered.length))}</div>
                <p style={{ fontSize: '0.85rem', color: '#94A3B8' }}>Try different filters or search term</p>
              </div>
            ) : filtered.map(shop => <ShopCard key={shop.id} shop={shop} />)}
          </div>
        )}


      </section>

      <SiteFooter />
    </main>
  )
}

function ShopCard({ shop }: { shop: MarketShop }) {
  const init = shop.shop_name.split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase()
  const isPremium = shop.plan === 'premium'
  const color = shop.shop_color || (isPremium ? '#C9A84C' : '#3B82F6')

  return (
    <div
      style={{ background: '#fff', border: `1.5px solid ${isPremium ? 'rgba(201,168,76,0.20)' : '#EEF0F6'}`, borderRadius: '16px', overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer', boxShadow: '0 1px 6px rgba(15,23,42,0.06)' }}
      onMouseOver={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 28px rgba(15,23,42,0.10)' }}
      onMouseOut={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 6px rgba(15,23,42,0.06)' }}
    >
      {/* Banner — user image or gradient */}
      <div style={{ height: '70px', position: 'relative', overflow: 'hidden' }}>
        {shop.shop_banner ? (
          <img src={shop.shop_banner} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${color}55 0%, ${color}99 50%, #050B2E 100%)` }} />
        )}
        {/* Plan badge */}
        <div style={{ position: 'absolute', top: '6px', right: '8px', background: isPremium ? '#C9A84C' : 'rgba(255,255,255,0.85)', color: isPremium ? '#0F172A' : '#64748B', fontSize: '0.52rem', fontWeight: 800, padding: '2px 7px', borderRadius: '999px', letterSpacing: '0.04em' }}>
          {isPremium ? 'PREMIUM' : 'BASIC'}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '0.45rem 0.7rem 0.6rem' }}>
        {/* Logo left + shop name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
          {/* Logo — left side */}
          <div style={{ width: '28px', height: '28px', borderRadius: '7px', border: '1.5px solid #E8ECF4', overflow: 'hidden', flexShrink: 0, background: `linear-gradient(135deg, ${color}, #050B2E)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {shop.shop_logo ? (
              <img src={shop.shop_logo} alt={init} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '0.62rem', fontWeight: 900, color: '#fff' }}>{init}</span>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: '0.76rem', color: '#0F172A', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{shop.shop_name}</div>
            {shop.shop_region && <div style={{ fontSize: '0.58rem', color: '#94A3B8', marginTop: '1px' }}>{shop.shop_region}</div>}
          </div>
        </div>

        {/* Category tag */}
        {shop.shop_category && (
          <div style={{ marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.58rem', background: 'rgba(201,168,76,0.10)', color: '#92741a', padding: '2px 7px', borderRadius: '999px', fontWeight: 700 }}>{shop.shop_category}</span>
          </div>
        )}

        {/* Description */}
        {shop.shop_desc && (
          <p style={{ fontSize: '0.65rem', color: '#94A3B8', lineHeight: 1.45, marginBottom: '0.3rem', display: '-webkit-box', WebkitLineClamp: 2 as any, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden' }}>{shop.shop_desc}</p>
        )}

        {/* Visit Shop — small button */}
        <a
          href={`/store/${shop.id}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 12px', background: isPremium ? '#C9A84C' : '#0D1B3E', color: isPremium ? '#0F172A' : '#fff', borderRadius: '7px', fontSize: '0.65rem', fontWeight: 700, textDecoration: 'none', transition: 'opacity 0.2s' }}
          onMouseOver={e => (e.currentTarget as HTMLElement).style.opacity = '0.82'}
          onMouseOut={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
        >
          <Store size={10} /> Visit Shop
        </a>
      </div>
    </div>
  )
}
