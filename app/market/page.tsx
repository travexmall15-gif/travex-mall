'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'
import { sb } from '@/lib/supabase'
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

export default function MarketPage() {
  const { t } = useTranslation()
  const [counts, setCounts] = useState<Record<string, number>>({ fashion: 0, vehicle: 0, electronics: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCounts() {
      try {
        const { data } = await sb
          .from('pending_payments')
          .select('shop_category, shop_market')
          .eq('status', 'approved')

        if (!data) {return}

        const result: Record<string, number> = { fashion: 0, vehicle: 0, electronics: 0 }
        for (const shop of data) {
          // Prefer the explicit shop_market column (set by every application
          // since Batch 1). Fall back to category-inference for older shops
          // that applied before that column existed.
          if (shop.shop_market && result[shop.shop_market] !== undefined) {
            result[shop.shop_market]++
            continue
          }
          for (const market of MARKETS) {
            if (market.categories.includes(shop.shop_category || '')) {
              result[market.key]++
              break
            }
          }
        }
        setCounts(result)
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
                      {loading ? '—' : t(count === 1 ? 'market.storeCount' : 'market.storesCount', { count })}
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
      </section>

      <style>{`.market-card:hover{border-color:var(--sn-primary);transform:translateY(-2px)}`}</style>
    </main>
  )
}
