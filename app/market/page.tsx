'use client'

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
  plan: 'premium' | 'basic'
  status: string
  slug: string | null
  created_at: string
}

const ALL_PLANS = ['All', 'Premium 🥇', 'Basic 🥈']

export default function MarketPage() {
  const [shops, setShops] = useState<MarketShop[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [plan, setPlan] = useState('All')
  const [categories, setCategories] = useState<string[]>([])
  const [totalApproved, setTotalApproved] = useState(0)

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
        const cats = [...new Set(data.map((s: MarketShop) => s.shop_category).filter(Boolean))] as string[]
        setCategories(cats)
      }
      setLoading(false)
    }
    load()
  }, [])

  const filtered = shops.filter(s => {
    const matchSearch = !search ||
      s.shop_name.toLowerCase().includes(search.toLowerCase()) ||
      (s.shop_desc || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.owner_name || '').toLowerCase().includes(search.toLowerCase())
    const matchCat = category === 'All' || s.shop_category === category
    const matchPlan = plan === 'All' ||
      (plan.includes('Premium') ? s.plan === 'premium' : s.plan === 'basic')
    return matchSearch && matchCat && matchPlan
  })

  const slotsLeft = MARKET_TOTAL_SLOTS - totalApproved
  const premiumShops = filtered.filter(s => s.plan === 'premium')
  const basicShops = filtered.filter(s => s.plan === 'basic')

  return (
    <main style={{ fontFamily: "'Inter', sans-serif", background: '#F8FAFF', minHeight: '100vh' }}>
      <SiteNav />

      {/* ══ HERO ══ */}
      <section style={{
        position: 'relative', overflow: 'hidden', paddingTop: '64px', color: '#fff',
        background: `
          radial-gradient(ellipse 70% 90% at 92% 20%,
            rgba(56,120,255,0.68) 0%, rgba(30,80,220,0.42) 25%,
            rgba(15,45,150,0.18) 50%, transparent 70%
          ),
          radial-gradient(ellipse 45% 55% at 88% 55%,
            rgba(80,140,255,0.26) 0%, transparent 60%
          ),
          linear-gradient(160deg, #010510 0%, #030920 30%, #050E2E 60%, #071540 100%)
        `,
      }}>
        {/* Ambient glow */}
        <div style={{ position: 'absolute', top: '-25%', right: '-8%', width: '60%', height: '110%', pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(ellipse 55% 55% at 62% 28%, rgba(56,120,255,0.65) 0%, rgba(35,80,220,0.38) 28%, rgba(20,55,180,0.15) 52%, transparent 70%), radial-gradient(ellipse 32% 38% at 72% 16%, rgba(140,190,255,0.45) 0%, rgba(90,155,255,0.20) 35%, transparent 65%)', filter: 'blur(22px)' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '4rem 5% 3rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem', marginBottom: '2rem' }}>
            <div style={{ maxWidth: '600px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(56,120,255,0.12)', border: '1px solid rgba(96,165,250,0.25)', color: '#93C5FD', padding: '0.35rem 1rem', borderRadius: '999px', fontSize: '0.70rem', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '1.25rem' }}>
                <Store size={12} /> Travex Business Market
              </div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.8rem, 4vw, 3.2rem)', fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: '0.85rem' }}>
                One Market.<br /><span style={{ color: '#C9A84C' }}>{MARKET_TOTAL_SLOTS} Seller Slots.</span>
              </h1>
              <p style={{ fontSize: 'clamp(0.82rem, 1.5vw, 0.95rem)', color: 'rgba(255,255,255,0.50)', lineHeight: 1.75, maxWidth: '480px' }}>
                Tanzania's unified business marketplace, verified sellers, all categories, five regions.
              </p>
            </div>

            {/* Slots counter */}
            <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '20px', padding: '1.5rem 2rem', textAlign: 'center', minWidth: '200px', backdropFilter: 'blur(12px)' }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '3rem', fontWeight: 900, color: '#C9A84C', lineHeight: 1 }}>{loading ? '...' : slotsLeft}</div>
              <div style={{ fontSize: '0.70rem', color: 'rgba(255,255,255,0.40)', textTransform: 'uppercase', letterSpacing: '0.10em', marginTop: '0.4rem' }}>Slots Remaining</div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.10)', borderRadius: '999px', marginTop: '0.85rem', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(totalApproved / MARKET_TOTAL_SLOTS) * 100}%`, background: 'linear-gradient(90deg,#C9A84C,#F0C96B)', borderRadius: '999px', transition: 'width 0.5s ease' }} />
              </div>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.28)', marginTop: '0.4rem' }}>{loading ? '...' : totalApproved} of {MARKET_TOTAL_SLOTS} filled</div>
            </div>
          </div>

          {/* Stats strip */}
          <div style={{ display: 'flex', gap: '0', borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '1.5rem', flexWrap: 'wrap' }}>
            {[
              ['🥇', String(shops.filter(s => s.plan === 'premium').length), 'Premium Shops', '#C9A84C'],
              ['🥈', String(shops.filter(s => s.plan === 'basic').length), 'Basic Shops', 'rgba(255,255,255,0.55)'],
              ['✅', 'OPEN', 'Registration', '#86EFAC'],
              ['📍', '5', 'Regions', 'rgba(255,255,255,0.55)'],
            ].map(([icon, val, label, color]) => (
              <div key={label} style={{ flex: 1, minWidth: '120px', paddingRight: '1.5rem' }}>
                <div style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>{icon}</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(0.95rem, 2vw, 1.35rem)', fontWeight: 800, color: color }}>{loading && val !== 'FREE' && val !== '5' ? '...' : val}</div>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.30)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom strip */}
        <div style={{ background: 'rgba(0,0,0,0.25)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem 5%', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span>🥈</span>
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>Basic Plan</div>
                  <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.35)' }}>Silver badge · {formatTZS(MARKET_BASIC_PRICE)}/mo </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span>🥇</span>
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#C9A84C' }}>Premium Plan</div>
                  <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.35)' }}>Gold badge · Top listing · {formatTZS(MARKET_PREMIUM_PRICE)}/mo </div>
                </div>
              </div>
            </div>
            <Link href="/open-store" style={{ background: '#C9A84C', color: '#0F172A', padding: '0.65rem 1.75rem', borderRadius: '999px', fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0, boxShadow: '0 6px 18px rgba(201,168,76,0.30)' }}>
              <Store size={14} /> Open Shop <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── QUICK ACCESS: Flash Deals + Group Buy ── */}
      <div style={{ background:'#fff', borderBottom:'1px solid #E2E8F0', padding:'0 5%' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', display:'flex', gap:8, overflowX:'auto',
          padding:'10px 0', scrollbarWidth:'none' }}>
          <a href="/flash-deals" style={{ display:'inline-flex', alignItems:'center', gap:6,
            background:'linear-gradient(135deg,#FEF3C7,#FDE68A)', color:'#92400E',
            padding:'8px 16px', borderRadius:999, fontWeight:700, fontSize:13,
            textDecoration:'none', whiteSpace:'nowrap', border:'1px solid #FCD34D',
            boxShadow:'0 2px 8px rgba(245,158,11,0.2)' }}>
            ⚡ Flash Deals, Limited Time
          </a>
          <a href="/group-buy" style={{ display:'inline-flex', alignItems:'center', gap:6,
            background:'linear-gradient(135deg,#DBEAFE,#BFDBFE)', color:'#1E40AF',
            padding:'8px 16px', borderRadius:999, fontWeight:700, fontSize:13,
            textDecoration:'none', whiteSpace:'nowrap', border:'1px solid #93C5FD',
            boxShadow:'0 2px 8px rgba(29,78,216,0.15)' }}>
            👥 Group Buying, Save Together
          </a>
          <a href="/vybe" style={{ display:'inline-flex', alignItems:'center', gap:6,
            background:'linear-gradient(135deg,#EDE9FE,#DDD6FE)', color:'#5B21B6',
            padding:'8px 16px', borderRadius:999, fontWeight:700, fontSize:13,
            textDecoration:'none', whiteSpace:'nowrap', border:'1px solid #C4B5FD' }}>
            ✦ Social Vybe
          </a>
        </div>
      </div>

      {/* ══ CATEGORY TABS ══ */}
      <section style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.1rem 5%', overflowX: 'auto' }}>
          <div style={{ display: 'flex', gap: '0.5rem', minWidth: 'max-content' }}>
            {['All', ...categories].map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                style={{ padding: '0.42rem 1.1rem', borderRadius: '999px', border: '1.5px solid', borderColor: category === cat ? '#050B2E' : '#E2E8F0', background: category === cat ? '#050B2E' : '#F8FAFF', color: category === cat ? '#fff' : '#64748B', fontSize: '0.76rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s' }}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ══ SEARCH + RESULTS ══ */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 5%' }}>

        {/* Search + filter */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search size={15} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search shops, products, categories..."
              style={{ width: '100%', paddingLeft: '2.6rem', paddingRight: '1rem', paddingTop: '0.7rem', paddingBottom: '0.7rem', border: '1.5px solid #E2E8F0', borderRadius: '999px', fontSize: '0.85rem', outline: 'none', fontFamily: "'Inter', sans-serif", background: '#F8FAFF' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', background: '#F3F4F6', borderRadius: '999px', padding: '0.25rem' }}>
            {ALL_PLANS.map(p => (
              <button key={p} onClick={() => setPlan(p)}
                style={{ padding: '0.42rem 1rem', borderRadius: '999px', border: 'none', background: plan === p ? '#050B2E' : 'transparent', color: plan === p ? '#fff' : '#64748B', fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s' }}>
                {p}
              </button>
            ))}
          </div>
          <div style={{ fontSize: '0.76rem', color: '#94A3B8' }}>{filtered.length} shops</div>
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
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🏪</div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>No shops yet</h3>
            <p style={{ fontSize: '0.88rem', color: '#64748B', marginBottom: '1.5rem' }}>Be the first to open a shop on Travex Business Market!</p>
            <Link href="/open-store" style={{ background: '#C9A84C', color: '#0F172A', padding: '0.85rem 2rem', borderRadius: '999px', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 8px 22px rgba(201,168,76,0.30)' }}>
              Open Shop →
            </Link>
          </div>
        )}

        {/* Premium shops */}
        {!loading && plan === 'All' && premiumShops.length > 0 && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <span>🥇</span>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>Premium Shops</span>
              <span style={{ fontSize: '0.68rem', color: '#94A3B8' }}>Top listing · Gold verified</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(270px,1fr))', gap: '1.1rem', marginBottom: '2.5rem' }}>
              {premiumShops.map(shop => <ShopCard key={shop.id} shop={shop} />)}
            </div>
          </>
        )}

        {/* Basic shops */}
        {!loading && plan === 'All' && basicShops.length > 0 && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <span>🥈</span>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>Basic Shops</span>
              <span style={{ fontSize: '0.68rem', color: '#94A3B8' }}>Silver verified</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(270px,1fr))', gap: '1.1rem' }}>
              {basicShops.map(shop => <ShopCard key={shop.id} shop={shop} />)}
            </div>
          </>
        )}

        {/* Filtered single list */}
        {!loading && plan !== 'All' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(270px,1fr))', gap: '1.1rem' }}>
            {filtered.length === 0 ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '5rem 0' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>No shops found</div>
                <p style={{ fontSize: '0.85rem', color: '#94A3B8' }}>Try changing filters or search term</p>
              </div>
            ) : filtered.map(shop => <ShopCard key={shop.id} shop={shop} />)}
          </div>
        )}

        {/* CTA Banner */}
        {!loading && (
          <div style={{ marginTop: '4rem', position: 'relative', overflow: 'hidden', background: 'linear-gradient(160deg, #010510 0%, #030920 35%, #050E2E 65%, #071540 100%)', borderRadius: '24px', padding: '3rem 2.5rem', textAlign: 'center' }}>
            <div style={{ position: 'absolute', top: '-25%', right: '-5%', width: '55%', height: '120%', background: 'radial-gradient(ellipse 60% 60% at 65% 30%, rgba(56,120,255,0.40) 0%, transparent 65%)', filter: 'blur(30px)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'inline-block', background: 'linear-gradient(135deg,#C9A84C,#F0C96B)', color: '#0F172A', padding: '0.35rem 1.2rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 800, marginBottom: '1rem' }}>✅ Open Your Shop Today</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.3rem, 3vw, 2rem)', fontWeight: 800, color: '#fff', marginBottom: '0.75rem' }}>
                {slotsLeft} Slots Remaining
              </div>
              <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.45)', marginBottom: '1.75rem' }}>
                Open your shop today, no payment required. Basic from {formatTZS(MARKET_BASIC_PRICE)}/mo · Premium from {formatTZS(MARKET_PREMIUM_PRICE)}/mo starting next month.
              </p>
              <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/open-store" style={{ background: '#C9A84C', color: '#0F172A', padding: '0.9rem 2rem', borderRadius: '999px', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 8px 22px rgba(201,168,76,0.30)' }}>
                  🥇 Open Premium Shop
                </Link>
                <Link href="/open-store" style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', padding: '0.9rem 2rem', borderRadius: '999px', fontWeight: 600, fontSize: '0.88rem', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.18)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  🥈 Open Basic Shop
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>

      <SiteFooter />
    </main>
  )
}

function ShopCard({ shop }: { shop: MarketShop }) {
  const init = shop.shop_name.split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase()
  const wa = (shop.shop_whatsapp || shop.owner_phone || '').replace(/\D/g, '')
  const isPremium = shop.plan === 'premium'
  const color = shop.shop_color || (isPremium ? '#C9A84C' : '#3B82F6')

  return (
    <div
      style={{ background: '#fff', border: `1.5px solid ${isPremium ? 'rgba(201,168,76,0.30)' : '#E2E8F0'}`, borderRadius: '20px', overflow: 'hidden', transition: 'all 0.25s', cursor: 'pointer', boxShadow: '0 2px 12px rgba(15,23,42,0.04)' }}
      onMouseOver={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 14px 36px rgba(15,23,42,0.10)' }}
      onMouseOut={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(15,23,42,0.04)' }}
    >
      {/* Banner */}
      <div style={{ height: '60px', background: `linear-gradient(135deg, ${color}, #050B2E)`, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '0.9rem', fontWeight: 800, color: '#fff' }}>{init}</span>
        <div style={{ position: 'absolute', top: '8px', right: '8px', background: isPremium ? 'rgba(201,168,76,0.90)' : 'rgba(255,255,255,0.15)', color: isPremium ? '#0F172A' : '#fff', fontSize: '0.58rem', fontWeight: 700, padding: '0.15rem 0.55rem', borderRadius: '999px' }}>
          {isPremium ? '🥇 Premium' : '🥈 Basic'}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '0.9rem 1.1rem' }}>
        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0F172A', marginBottom: '0.35rem', lineHeight: 1.3 }}>{shop.shop_name}</div>
        <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
          {shop.shop_category && <span style={{ fontSize: '0.62rem', background: 'rgba(201,168,76,0.10)', color: '#92741a', padding: '0.12rem 0.5rem', borderRadius: '999px', fontWeight: 700 }}>{shop.shop_category}</span>}
          {shop.shop_region && <span style={{ fontSize: '0.62rem', background: 'rgba(15,23,42,0.06)', color: '#64748B', padding: '0.12rem 0.5rem', borderRadius: '999px' }}>{shop.shop_region}</span>}
        </div>
        {shop.shop_desc && (
          <p style={{ fontSize: '0.76rem', color: '#64748B', lineHeight: 1.55, marginBottom: '0.8rem', display: '-webkit-box', WebkitLineClamp: 2 as any, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden' }}>{shop.shop_desc}</p>
        )}
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {wa && (
            <a href={`https://wa.me/${wa}`} target="_blank" style={{ flex: 1, padding: '0.5rem', background: '#25D366', color: '#fff', border: 'none', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
              <MessageCircle size={12} /> WhatsApp
            </a>
          )}
          <a href={`/store/${shop.id}`} style={{ flex: 1, padding: '0.5rem', background: '#050B2E', color: '#fff', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', textDecoration: 'none' }}>
            <Store size={12} /> View Shop
          </a>
        </div>
      </div>
    </div>
  )
}
