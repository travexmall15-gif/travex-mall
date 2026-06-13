'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import {
  marketShops, marketStats, marketCategories,
  MARKET_BASIC_PRICE, MARKET_PREMIUM_PRICE, MARKET_TOTAL_SLOTS,
  type MarketShop, formatTZS,
} from '@/lib/data'
import { Search, MessageCircle, Store, ArrowRight, Star } from 'lucide-react'

const ALL_CATEGORIES = ['All', ...marketCategories.map(c => c.name)]
const ALL_PLANS = ['All', 'Premium 🥇', 'Basic 🥈']

export default function MarketPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [plan, setPlan] = useState('All')

  const filtered = marketShops.filter(s => {
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === 'All' || s.category === category
    const matchPlan = plan === 'All' || (plan.includes('Premium') ? s.plan === 'premium' : s.plan === 'basic')
    return matchSearch && matchCat && matchPlan
  })

  const slotsLeft = MARKET_TOTAL_SLOTS - marketStats.activeShops

  return (
    <main style={{ fontFamily: "'Inter', sans-serif", background: '#EEF1F8', minHeight: '100vh' }}>
      <SiteNav />

      {/* ══ HERO ══ */}
      <section style={{ position: 'relative', overflow: 'hidden', paddingTop: '64px', color: '#fff', background: 'linear-gradient(150deg, #080F24 0%, #0D1B3E 50%, #16306B 100%)' }}>
        {/* Beam */}
        <div style={{ position: 'absolute', inset: '-30%', pointerEvents: 'none', zIndex: 0, background: 'linear-gradient(112deg, transparent 30%, rgba(66,99,235,0.28) 46%, rgba(201,168,76,0.14) 56%, transparent 72%)', filter: 'blur(48px)' }} />
        {/* Grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(/business-market-hero.png)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.10, zIndex: 0 }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '4rem 5% 3rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem', marginBottom: '2.5rem' }}>
            <div style={{ maxWidth: '600px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.35)', color: '#C9A84C', padding: '0.35rem 1rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '1.25rem' }}>
                <Store size={12} /> Travex Business Market
              </div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.8rem, 4vw, 3.2rem)', fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: '0.85rem' }}>
                One Market.<br /><span style={{ color: '#C9A84C' }}>500 Seller Slots.</span>
              </h1>
              <p style={{ fontSize: 'clamp(0.82rem, 1.5vw, 0.95rem)', color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, maxWidth: '480px' }}>
                Tanzania's unified business marketplace — Premium and Basic listings, all sellers, all categories, one platform.
              </p>
            </div>

            {/* Slots counter card */}
            <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '20px', padding: '1.5rem 2rem', textAlign: 'center', minWidth: '200px', backdropFilter: 'blur(12px)' }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '3rem', fontWeight: 900, color: '#C9A84C', lineHeight: 1 }}>{slotsLeft}</div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.10em', marginTop: '0.4rem' }}>Slots Remaining</div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.10)', borderRadius: '999px', marginTop: '0.85rem', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(marketStats.activeShops / MARKET_TOTAL_SLOTS) * 100}%`, background: 'linear-gradient(90deg,#C9A84C,#F0C96B)', borderRadius: '999px' }} />
              </div>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.28)', marginTop: '0.4rem' }}>{marketStats.activeShops} of {MARKET_TOTAL_SLOTS} filled</div>
            </div>
          </div>

          {/* Stats strip */}
          <div style={{ display: 'flex', gap: '0', borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '1.5rem', flexWrap: 'wrap' }}>
            {[
              ['🥇', `${marketStats.premiumShops}`, 'Premium Shops', '#C9A84C'],
              ['🥈', `${marketStats.basicShops}`, 'Basic Shops', 'rgba(255,255,255,0.55)'],
              ['💰', formatTZS(MARKET_BASIC_PRICE), 'Basic Plan/mo', 'rgba(255,255,255,0.55)'],
              ['💎', formatTZS(MARKET_PREMIUM_PRICE), 'Premium Plan/mo', '#C9A84C'],
            ].map(([icon, val, label, color]) => (
              <div key={label} style={{ flex: 1, minWidth: '140px', paddingRight: '1.5rem' }}>
                <div style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>{icon}</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(0.95rem, 2vw, 1.35rem)', fontWeight: 800, color: color as string }}>{val}</div>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.30)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing strip */}
        <div style={{ background: 'rgba(0,0,0,0.28)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem 5%', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              {[['🥈','Basic Plan','Silver badge',MARKET_BASIC_PRICE,'rgba(255,255,255,0.85)'],['🥇','Premium Plan','Gold badge · Top listing',MARKET_PREMIUM_PRICE,'#C9A84C']].map(([icon,name,desc,price,c])=>(
                <div key={name as string} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontSize: '1rem' }}>{icon}</span>
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: c as string }}>{name}</div>
                    <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.35)' }}>{desc} · {formatTZS(price as number)}/month</div>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/open-store-b2c" style={{ background: '#C9A84C', color: '#0D1B3E', padding: '0.65rem 1.75rem', borderRadius: '999px', fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0, boxShadow: '0 6px 18px rgba(201,168,76,0.30)' }}>
              <Store size={14} /> Open Your Shop <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══ CATEGORY TABS ══ */}
      <section style={{ background: '#fff', borderBottom: '1px solid #E9ECF3', boxShadow: '0 2px 8px rgba(55,83,160,0.055)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.1rem 5%', overflowX: 'auto' }}>
          <div style={{ display: 'flex', gap: '0.5rem', minWidth: 'max-content' }}>
            {ALL_CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                style={{ padding: '0.42rem 1.1rem', borderRadius: '999px', border: '1.5px solid', borderColor: category === cat ? '#0D1B3E' : '#E8ECF4', background: category === cat ? '#0D1B3E' : '#EEF1F8', color: category === cat ? '#fff' : '#64748B', fontSize: '0.76rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s' }}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ══ SEARCH + RESULTS ══ */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 5%' }}>
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search size={15} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search shops, products, categories..."
              style={{ width: '100%', paddingLeft: '2.6rem', paddingRight: '1rem', paddingTop: '0.7rem', paddingBottom: '0.7rem', border: '1.5px solid #E9ECF3', borderRadius: '999px', fontSize: '0.85rem', outline: 'none', fontFamily: "'Inter', sans-serif", background: '#EEF1F8' }}
            />
          </div>
          {/* Plan filter */}
          <div style={{ display: 'flex', gap: '0.4rem', background: '#EEF1F8', borderRadius: '999px', padding: '0.25rem' }}>
            {ALL_PLANS.map(p => (
              <button key={p} onClick={() => setPlan(p)}
                style={{ padding: '0.42rem 1rem', borderRadius: '999px', border: 'none', background: plan === p ? '#0D1B3E' : 'transparent', color: plan === p ? '#fff' : '#64748B', fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s' }}>
                {p}
              </button>
            ))}
          </div>
          <div style={{ fontSize: '0.76rem', color: '#94A3B8' }}>{filtered.length} shops</div>
        </div>

        {/* Premium first */}
        {plan === 'All' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <span>🥇</span>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 800, color: '#0D1B3E' }}>Premium Shops</span>
              <span style={{ fontSize: '0.68rem', color: '#94A3B8' }}>Top listing · Gold verified</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(270px,1fr))', gap: '1.1rem', marginBottom: '2.5rem' }}>
              {filtered.filter(s => s.plan === 'premium').map(shop => <ShopCard key={shop.id} shop={shop} />)}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <span>🥈</span>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 800, color: '#0D1B3E' }}>Basic Shops</span>
              <span style={{ fontSize: '0.68rem', color: '#94A3B8' }}>Silver verified</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(270px,1fr))', gap: '1.1rem' }}>
              {filtered.filter(s => s.plan === 'basic').map(shop => <ShopCard key={shop.id} shop={shop} />)}
            </div>
          </>
        )}

        {plan !== 'All' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(270px,1fr))', gap: '1.1rem' }}>
            {filtered.length === 0 ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '5rem 0' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏪</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', fontWeight: 700, color: '#0D1B3E', marginBottom: '0.5rem' }}>No shops found</div>
                <p style={{ fontSize: '0.85rem', color: '#94A3B8' }}>Try changing filters or search term</p>
              </div>
            ) : filtered.map(shop => <ShopCard key={shop.id} shop={shop} />)}
          </div>
        )}

        {/* CTA Banner */}
        <div style={{ marginTop: '4rem', position: 'relative', overflow: 'hidden', background: 'linear-gradient(150deg, #080F24 0%, #0D1B3E 55%, #16306B 100%)', borderRadius: '24px', padding: '3rem 2.5rem', textAlign: 'center' }}>
          <div style={{ position: 'absolute', inset: '-20%', pointerEvents: 'none', background: 'linear-gradient(112deg, transparent 35%, rgba(201,168,76,0.10) 50%, transparent 65%)', filter: 'blur(40px)' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.3rem, 3vw, 2rem)', fontWeight: 800, color: '#fff', marginBottom: '0.75rem' }}>
              {slotsLeft} Slots Remaining — Secure Yours Now
            </div>
            <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.45)', marginBottom: '1.75rem' }}>
              Basic from {formatTZS(MARKET_BASIC_PRICE)}/mo · Premium from {formatTZS(MARKET_PREMIUM_PRICE)}/mo
            </p>
            <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/open-store-b2c" style={{ background: '#C9A84C', color: '#0D1B3E', padding: '0.9rem 2rem', borderRadius: '999px', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 8px 22px rgba(201,168,76,0.30)' }}>
                🥇 Open Premium Shop
              </Link>
              <Link href="/open-store-b2c" style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', padding: '0.9rem 2rem', borderRadius: '999px', fontWeight: 600, fontSize: '0.88rem', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.20)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                🥈 Open Basic Shop
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}

function ShopCard({ shop }: { shop: MarketShop }) {
  const init = shop.name.split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase()
  const wa = shop.whatsapp.replace(/\D/g, '')
  const isPremium = shop.plan === 'premium'

  return (
    <div
      style={{ background: '#fff', border: `1.5px solid ${isPremium ? 'rgba(201,168,76,0.30)' : '#E8ECF4'}`, borderRadius: '20px', overflow: 'hidden', transition: 'all 0.25s', cursor: 'pointer', boxShadow: '0 2px 12px rgba(55,83,160,0.055)' }}
      onMouseOver={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 14px 36px rgba(13,27,62,0.10)' }}
      onMouseOut={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(55,83,160,0.055)' }}
    >
      {/* Banner */}
      <div style={{ height: '60px', background: `linear-gradient(135deg, ${shop.logoColor}, #0D1B3E)`, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '0.9rem', fontWeight: 800, color: '#fff' }}>{init}</span>
        <div style={{ position: 'absolute', top: '8px', right: '8px', background: isPremium ? 'rgba(201,168,76,0.90)' : 'rgba(255,255,255,0.15)', color: isPremium ? '#0D1B3E' : '#fff', fontSize: '0.58rem', fontWeight: 700, padding: '0.15rem 0.55rem', borderRadius: '999px' }}>
          {shop.badge}
        </div>
      </div>
      {/* Body */}
      <div style={{ padding: '0.9rem 1.1rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.35rem', gap: '0.5rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0D1B3E', lineHeight: 1.3 }}>{shop.name}</div>
          {shop.verified && <span style={{ fontSize: '0.6rem', background: 'rgba(5,150,105,0.10)', color: '#059669', padding: '0.1rem 0.45rem', borderRadius: '999px', fontWeight: 700, flexShrink: 0 }}>✓ Verified</span>}
        </div>
        <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.62rem', background: 'rgba(201,168,76,0.10)', color: '#92741a', padding: '0.12rem 0.5rem', borderRadius: '999px', fontWeight: 700 }}>{shop.category}</span>
          <span style={{ fontSize: '0.62rem', background: 'rgba(13,27,62,0.06)', color: '#64748B', padding: '0.12rem 0.5rem', borderRadius: '999px' }}>{shop.region}</span>
        </div>
        <p style={{ fontSize: '0.76rem', color: '#64748B', lineHeight: 1.55, marginBottom: '0.8rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{shop.description}</p>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.8rem' }}>
          <Star size={11} fill="#C9A84C" color="#C9A84C" />
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0D1B3E', marginLeft: '0.25rem' }}>{shop.rating}</span>
        </div>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <a href={`https://wa.me/${wa}`} target="_blank" style={{ flex: 1, padding: '0.5rem', background: '#25D366', color: '#fff', border: 'none', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
            <MessageCircle size={12} /> WhatsApp
          </a>
          <Link href={`/store/${shop.id}`} style={{ flex: 1, padding: '0.5rem', background: '#0D1B3E', color: '#fff', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
            <Store size={12} /> Visit Shop
          </Link>
        </div>
      </div>
    </div>
  )
}
