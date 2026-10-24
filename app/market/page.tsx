'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'
import { Shirt, Car, Smartphone, ArrowRight } from 'lucide-react'

// ── Market definitions ─────────────────────────────────────
const MARKETS = [
  {
    key: 'fashion',
    icon: Shirt,
    iconColor: '#7800FF',
    categories: ['Clothing','Shoes','Accessories','Beauty','Jewelry','Sports & Fitness','Arts & Crafts','Fashion & Clothing','Beauty & Health'],
    labelKey: 'market.marketFashionLabel',
    descKey: 'market.marketFashionDesc',
  },
  {
    key: 'vehicle',
    icon: Car,
    iconColor: '#7800FF',
    categories: ['Cars','Motorcycles','Spare Parts','Tyres','Auto Accessories','Automotive'],
    labelKey: 'market.marketVehicleLabel',
    descKey: 'market.marketVehicleDesc',
  },
  {
    key: 'electronics',
    icon: Smartphone,
    iconColor: '#7800FF',
    categories: ['Phones','Laptops','TVs','Audio','Appliances','Gaming','Other Electronics','Electronics','Technology','Books & Stationery'],
    labelKey: 'market.marketElectronicsLabel',
    descKey: 'market.marketElectronicsDesc',
  },
]

const HOME_LIVING_CATEGORIES = [
  'Furniture', 'Sofas & Chairs', 'Beds & Mattresses', 'Tables & Desks', 'Wardrobes & Storage',
  'Décor', 'Curtains & Carpets', 'Kitchen & Dining', 'Lighting', 'Bathroom', 'Garden & Outdoor',
  'Appliances', 'Art & Mirrors', 'Home Improvement', 'Building & Interior Materials',
]

export default function MarketPage() {
  const { t } = useTranslation()
  const [counts, setCounts] = useState<Record<string, number>>({ fashion: 0, vehicle: 0, electronics: 0 })
  const [loading, setLoading] = useState(true)
  const [countsError, setCountsError] = useState(false)

  useEffect(() => {
    async function loadCounts() {
      try {
        const response = await fetch('/api/public/market?type=counts', { cache: 'no-store' })
        const result = await response.json().catch(() => null)
        if (response.ok && result?.counts) {setCounts(result.counts)}
        else {setCountsError(true)}
      } catch {
        setCountsError(true)
      } finally {
        setLoading(false)
      }
    }
    loadCounts()
  }, [])

  return (
    <main style={{ minHeight: '100vh', background: 'var(--sn-page)', paddingTop: 118 }}>
      <section style={{ maxWidth: 860, margin: '0 auto', padding: '1.5rem 1rem 4rem' }}>

        <h1 style={{ fontSize: 'clamp(1.3rem,3.5vw,1.7rem)', fontWeight: 900, color: 'var(--sn-text)', letterSpacing: '-0.02em', marginBottom: '1.5rem', textAlign: 'center' }}>
          {t('market.gatewayTitle')}
        </h1>

        {/* Market Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
          {MARKETS.map((market) => {
            const Icon = market.icon
            const count = counts[market.key] ?? 0
            return (
              <Link key={market.key} href={`/market/${market.key}`} style={{ textDecoration: 'none' }}>
                <div className="market-card" style={{
                  background: 'var(--sn-bg)',
                  border: '1.5px solid var(--sn-border)',
                  borderRadius: 22,
                  padding: '2rem 1.75rem 1.75rem',
                  height: '100%',
                  boxSizing: 'border-box',
                  cursor: 'pointer',
                  transition: 'border-color .18s, transform .18s',
                }}>
                  {/* Icon container */}
                  <div style={{
                    width: 54, height: 54,
                    borderRadius: 16,
                    background: 'var(--sn-page)',
                    border: '1.5px solid var(--sn-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '1.35rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  }}>
                    <Icon size={26} color={market.iconColor} strokeWidth={1.8} />
                  </div>

                  {/* Title */}
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--sn-text)', marginBottom: '0.4rem', letterSpacing: '-0.01em' }}>
                    {t(market.labelKey)}
                  </h2>

                  {/* Description */}
                  <p style={{ fontSize: '0.8rem', color: 'var(--sn-muted)', marginBottom: '1.5rem', lineHeight: 1.55 }}>
                    {t(market.descKey)}
                  </p>

                  {/* Footer */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--sn-border)', paddingTop: '0.9rem' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--sn-primary)' }}>
                      {loading || countsError ? '—' : t(count === 1 ? 'market.storeCount' : 'market.storesCount', { count })}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg,#FF0080,#7800FF)', padding: '5px 12px', borderRadius: 999 }}>
                      {t('market.explore')} <ArrowRight size={12} color="#fff" />
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        <section aria-labelledby="home-living-title" style={{ marginTop: '2.5rem' }}>
          <h2 id="home-living-title" style={{ fontSize: '1.15rem', fontWeight: 850, color: 'var(--sn-text)', marginBottom: '0.35rem' }}>Home &amp; Living</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--sn-muted)', margin: '0 0 1rem' }}>Browse products in the categories currently supported by marketplace product records.</p>
          <div className="home-living-grid">
            {HOME_LIVING_CATEGORIES.map(category => (
              <Link key={category} href={`/search?category=${encodeURIComponent(category)}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '12px 14px', border: '1px solid var(--sn-border)', borderRadius: 12, background: 'var(--sn-bg)', color: 'var(--sn-text)', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 650 }}>
                {category}<ArrowRight size={14} color="var(--sn-primary)" />
              </Link>
            ))}
          </div>
        </section>
      </section>

      <style>{`.market-card:hover{border-color:var(--sn-primary);transform:translateY(-2px)}.home-living-grid{display:grid;grid-template-columns:1fr;gap:8px}@media(min-width:768px){.home-living-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}`}</style>
    </main>
  )
}
