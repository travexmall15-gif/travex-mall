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
    bg: '#fff',
    iconColor: '#1D4ED8',
    borderColor: 'var(--sn-border)',
    categories: ['Fashion & Clothing','Beauty & Health','Sports & Fitness','Arts & Crafts'],
    desc: 'Clothing, shoes, accessories, beauty & more',
  },
  {
    key: 'vehicle',
    label: 'Vehicle Market',
    icon: Car,
    bg: '#fff',
    iconColor: '#1D4ED8',
    borderColor: 'var(--sn-border)',
    categories: ['Automotive'],
    desc: 'Cars, motorcycles, spare parts & accessories',
  },
  {
    key: 'electronics',
    label: 'Electronics Market',
    icon: Smartphone,
    bg: '#fff',
    iconColor: '#1D4ED8',
    borderColor: 'var(--sn-border)',
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
    <main style={{ minHeight: '100vh', background: 'var(--sn-page)', paddingTop: 68 }}>
      <SiteNav />

      <section style={{ maxWidth: 860, margin: '0 auto', padding: '1.5rem 1rem 4rem' }}>

                {/* Market Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
          {MARKETS.map((market) => {
            const Icon = market.icon
            const count = counts[market.key] ?? 0
            return (
              <Link key={market.key} href={`/market/${market.key}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: 'var(--sn-bg)',
                  border: '1.5px solid var(--sn-border)',
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
                    background: 'var(--sn-bg)',
                    border: '1.5px solid var(--sn-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '1.35rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  }}>
                    <Icon size={26} color={market.iconColor} strokeWidth={1.8} />
                  </div>

                  {/* Title */}
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--sn-text)', marginBottom: '0.4rem', letterSpacing: '-0.01em' }}>
                    {market.label}
                  </h2>

                  {/* Description */}
                  <p style={{ fontSize: '0.8rem', color: 'var(--sn-muted)', marginBottom: '1.5rem', lineHeight: 1.55 }}>
                    {market.desc}
                  </p>

                  {/* Footer */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--sn-border)', paddingTop: '0.9rem' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--sn-primary)' }}>
                      {loading ? '—' : `${count} ${count === 1 ? 'store' : 'stores'}`}
                    </span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--sn-text)' }}>
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
