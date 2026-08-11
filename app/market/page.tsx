'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'
import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { sb } from '@/lib/supabase'
import { Shirt, Car, Smartphone } from 'lucide-react'

// ── Market definitions ─────────────────────────────────────
const MARKETS = [
  {
    key: 'fashion',
    label: 'Fashion Market',
    icon: Shirt,
    bg: '#FDF2F8',
    iconColor: '#BE185D',
    borderColor: '#FBCFE8',
    categories: ['Fashion & Clothing','Beauty & Health','Sports & Fitness','Arts & Crafts'],
    desc: 'Clothing, shoes, accessories, beauty & more',
  },
  {
    key: 'vehicle',
    label: 'Vehicle Market',
    icon: Car,
    bg: '#EFF6FF',
    iconColor: '#1D4ED8',
    borderColor: '#BFDBFE',
    categories: ['Automotive'],
    desc: 'Cars, motorcycles, spare parts & accessories',
  },
  {
    key: 'electronics',
    label: 'Electronics Market',
    icon: Smartphone,
    bg: '#FFFBEB',
    iconColor: '#D97706',
    borderColor: '#FDE68A',
    categories: ['Electronics','Technology','Books & Stationery'],
    desc: 'Phones, laptops, TVs, audio & appliances',
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
          .select('shop_category,shop_market')
          .eq('status', 'approved')

        if (!data) return

        const result: Record<string, number> = { fashion: 0, vehicle: 0, electronics: 0 }
        for (const shop of data) {
          const m = (shop as any).shop_market
          if (m && result[m] !== undefined) {
            result[m]++
          } else {
            for (const market of MARKETS) {
              if (market.categories.includes(shop.shop_category || '')) {
                result[market.key]++
                break
              }
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
    <main style={{ minHeight: '100vh', background: '#F8FAFC' }}>
      <SiteNav />

      <section style={{ maxWidth: 860, margin: '0 auto', padding: '2.5rem 1rem 5rem' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.75rem' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#C9A84C', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
            ShopNekt
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0F172A', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            Business Marketplaces
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.88rem', maxWidth: 380, margin: '0 auto', lineHeight: 1.6 }}>
            {t('market.gatewayDesc') || 'Select a marketplace to discover verified stores'}
          </p>
        </div>

        {/* Market Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
          {MARKETS.map((market) => {
            const Icon = market.icon
            const count = counts[market.key] ?? 0
            return (
              <Link key={market.key} href={`/market/${market.key}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: market.bg,
                  border: `1.5px solid ${market.borderColor}`,
                  borderRadius: 22,
                  padding: '2rem 1.75rem 1.75rem',
                  height: '100%',
                  boxSizing: 'border-box',
                  cursor: 'pointer',
                }}>
                  {/* Icon container */}
                  <div style={{
                    width: 54, height: 54,
                    borderRadius: 16,
                    background: '#fff',
                    border: `1.5px solid ${market.borderColor}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '1.35rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  }}>
                    <Icon size={26} color={market.iconColor} strokeWidth={1.8} />
                  </div>

                  {/* Title */}
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.4rem', letterSpacing: '-0.01em' }}>
                    {market.label}
                  </h2>

                  {/* Description */}
                  <p style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '1.5rem', lineHeight: 1.55 }}>
                    {market.desc}
                  </p>

                  {/* Footer */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `1px solid ${market.borderColor}`, paddingTop: '0.9rem' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: market.iconColor }}>
                      {loading ? '—' : `${count} ${count === 1 ? 'store' : 'stores'}`}
                    </span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0F172A' }}>
                      Explore →
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
