'use client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { SiteNav } from '@/components/site-nav'
import { ArrowLeft, Package, Heart, MapPin, ChevronRight } from 'lucide-react'

export default function ShoppingPage() {
  const router = useRouter()
  const items = [
    { icon: Package,  label: 'Order History',    sub: 'View all your orders',       href: '/orders'     },
    { icon: Heart,    label: 'Saved Items',       sub: 'Products you liked',         href: '/saved'      },
    { icon: MapPin,   label: 'Saved Addresses',   sub: 'Delivery addresses',         href: '/addresses'  },
  ]

  return (
    <main style={{ minHeight: '100vh', background: '#F8FAFF', paddingTop: '108px', fontFamily: "'Inter',sans-serif" }}>
      <SiteNav />
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '1.5rem 5% 4rem' }}>
        <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', fontSize: '0.82rem', fontWeight: 600, fontFamily: "'Inter',sans-serif", marginBottom: '1.5rem', padding: 0 }}>
          <ArrowLeft size={15} /> Back
        </button>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0D1B3E', marginBottom: '1.75rem', letterSpacing: '-0.025em' }}>Shopping Preferences</h1>
        <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #E2E8F0', overflow: 'hidden' }}>
          {items.map((item, i) => (
            <Link key={i} href={item.href} style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: i < items.length-1 ? '1px solid #F1F5F9' : 'none', transition: 'background .15s' }}
                onMouseOver={e => (e.currentTarget as HTMLElement).style.background = '#F8FAFF'}
                onMouseOut={e  => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(201,168,76,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <item.icon size={16} color="#C9A84C" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0F172A' }}>{item.label}</div>
                  <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: 2 }}>{item.sub}</div>
                </div>
                <ChevronRight size={14} color="#CBD5E1" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
