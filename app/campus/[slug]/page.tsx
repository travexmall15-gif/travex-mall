'use client'
import { T, useT } from '@/components/T'

import { use, useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { sb, type CampusStore, fmtTZS } from '@/lib/supabase'
import { getUniversity } from '@/lib/data'
import { MapPin, ArrowLeft, Search, ShieldCheck, Store } from 'lucide-react'

function StoreCard({ store }: { store: CampusStore; index?: number }) {
  const initials = store.store_name.split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase()
  const color = store.primary_color || '#0D1B3E'

  return (
    <div style={{ background: '#fff', border: '1.5px solid #EEF0F6', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 6px rgba(15,23,42,0.06)', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }}
      onMouseOver={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 24px rgba(15,23,42,0.10)' }}
      onMouseOut={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 6px rgba(15,23,42,0.06)' }}>

      {/* Banner */}
      <div style={{ height: '70px', position: 'relative', overflow: 'hidden' }}>
        {store.banner ? (
          <Image src={store.banner} alt={store.store_name} fill style={{ objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${color}55, #0D1B3E)` }} />
        )}
        {store.is_verified && (
          <div style={{ position: 'absolute', top: 6, right: 8, display: 'flex', alignItems: 'center', gap: 3, background: 'rgba(5,150,105,0.9)', color: '#fff', fontSize: '0.52rem', fontWeight: 800, padding: '2px 7px', borderRadius: 999 }}>
            <ShieldCheck style={{ width: 9, height: 9 }} /> Verified
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '0.5rem 0.7rem 0.65rem' }}>
        {/* Logo left + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
          <div style={{ width: 28, height: 28, borderRadius: '7px', border: '1.5px solid #E8ECF4', overflow: 'hidden', background: `linear-gradient(135deg, ${color}, #050B2E)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {store.logo ? (
              <Image src={store.logo} alt={initials} width={28} height={28} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
            ) : (
              <span style={{ fontSize: '0.6rem', fontWeight: 900, color: '#fff' }}>{initials}</span>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: '0.76rem', color: '#0F172A', lineHeight: 1.2, whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis' }}>{store.store_name}</div>
            <div style={{ fontSize: '0.58rem', color: '#94A3B8', marginTop: 1 }}>{store.university_abbr}</div>
          </div>
        </div>

        {/* Category */}
        {store.category && (
          <div style={{ marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.58rem', background: `${accent}18`, color: accent, padding: '2px 7px', borderRadius: 999, fontWeight: 700 }}>{store.category}</span>
          </div>
        )}

        {/* Description */}
        {store.description && (
          <p style={{ fontSize: '0.68rem', color: '#94A3B8', lineHeight: 1.5, marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: 2 as any, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden' }}>
            {store.description}
          </p>
        )}

        {/* Visit Shop */}
        <Link href={`/store/${store.id}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 12px', background: '#0D1B3E', color: '#fff', borderRadius: 7, fontSize: '0.62rem', fontWeight: 700, textDecoration: 'none' }}>
          <Store style={{ width: 10, height: 10 }} /> Visit Shop
        </Link>
      </div>
    </div>
  )
}

export default function UniversityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const router = useRouter()
  const uni = getUniversity(slug)
  const [stores, setStores]     = useState<CampusStore[]>([])
  const [filtered, setFiltered] = useState<CampusStore[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [cat, setCat]           = useState('All')

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(
      stores.filter(s =>
        (cat === 'All' || s.category === cat) &&
        (!q || s.store_name.toLowerCase().includes(q) || (s.description||'').toLowerCase().includes(q))
      )
    )
  }, [search, cat, stores])

  useEffect(() => {
    sb.from('campus_stores')
      .select('*')
      .eq('university_abbr', slug.toUpperCase())
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setStores(data || []); setLoading(false) })
  }, [slug])

  const categories = ['All', ...Array.from(new Set(stores.map(s => s.category).filter(Boolean) as string[]))]
  const slotsLeft  = 60 - stores.length

  return (
    <main className="min-h-screen" style={{ background: '#F8FAFF' }}>
      <SiteNav />

      {/* Hero */}
      <section style={{ paddingTop: '64px', background: 'linear-gradient(160deg, #010510 0%, #030920 35%, #050E2E 65%, #071540 100%)', color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 55% 70% at 85% 20%, rgba(56,120,255,0.28) 0%, transparent 65%)', zIndex: 0 }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 5% 0' }}>

          {/* Top row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <button onClick={() => router.back()} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)', padding: '5px 12px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}>
              <ArrowLeft size={12} /> {<T en="Browse" sw="Vinjari" />}
            </button>
            <Link href="/campus-apply" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#C9A84C', color: '#0F172A', padding: '8px 18px', borderRadius: '999px', fontWeight: 700, fontSize: '0.8rem', textDecoration: 'none', boxShadow: '0 4px 14px rgba(201,168,76,0.28)' }}>
              Open Your Shop
            </Link>
          </div>

          {/* University info */}
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.25)', color: '#C9A84C', padding: '4px 12px', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700, marginBottom: '0.85rem' }}>
              Campus Market · {slug.toUpperCase()}
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: '0.5rem' }}>
              {uni?.name || slug.toUpperCase()}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>
                <MapPin size={12} /> {uni?.city || 'Tanzania'}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
              <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>{loading ? '...' : stores.length} shops</span>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: slotsLeft > 10 ? '#86EFAC' : slotsLeft > 0 ? '#FCD34D' : '#FCA5A5' }}>
                {slotsLeft > 0 ? `${slotsLeft} slots left` : 'Full'}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', marginBottom: '0' }} />
        </div>
      </section>

      {/* Search + Filters */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 5% 0' }}>
        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '1rem' }}>
          <Search size={15} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder={`Search shops at ${slug.toUpperCase()}...`}
            style={{ width: '100%', paddingLeft: '2.75rem', paddingRight: '1rem', paddingTop: '0.75rem', paddingBottom: '0.75rem', border: '1.5px solid #E2E8F0', borderRadius: '12px', fontSize: '0.85rem', outline: 'none', fontFamily: "'Inter', sans-serif", background: '#fff', transition: 'border-color 0.2s' }}
            onFocus={e => (e.target.style.borderColor = '#0D1B3E')}
            onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
          />
        </div>
        {/* Category filter */}
        <div style={{ overflowX: 'auto', scrollbarWidth: 'none' as const, marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 'max-content', paddingBottom: '2px' }}>
            <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' as const, letterSpacing: '0.08em', flexShrink: 0, minWidth: '52px' }}>{<T en="Category" sw="Aina" />}</span>
            {categories.map(c => (
              <button key={c} onClick={() => setCat(c)} style={{ padding: '5px 14px', borderRadius: '8px', border: '1.5px solid', borderColor: cat === c ? '#C9A84C' : '#E2E8F0', background: cat === c ? '#C9A84C' : '#fff', color: cat === c ? '#0F172A' : '#475569', fontSize: '0.74rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' as const, flexShrink: 0, transition: 'all 0.15s' }}>
                {c}
              </button>
            ))}
          </div>
        </div>
        {filtered.length > 0 && (
          <div style={{ fontSize: '0.76rem', color: '#94A3B8', marginBottom: '1rem' }}>{filtered.length} shop{filtered.length !== 1 ? 's' : ''} found</div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">
            <div style={{ width: '32px', height: '32px', border: '3px solid #E2E8F0', borderTopColor: '#0D1B3E', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
            <p>Loading shops...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Store size={40} style={{ color: '#CBD5E1', margin: '0 auto 1rem', display: 'block' }} />
            <h3 className="text-xl font-bold mb-2" style={{ color: '#0D1B3E', fontFamily: "'Playfair Display',serif" }}>
              {stores.length === 0 ? 'No Shops Yet' : 'No shops match your search'}
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              {stores.length === 0 ? 'Be the first student seller at this university!' : 'Try a different search.'}
            </p>
            {stores.length === 0 && (
              <Link href="/campus-apply"
                className="inline-flex px-6 py-3 rounded-full text-sm font-bold"
                style={{ background: '#C9A84C', color: '#0D1B3E' }}>
                Apply Now →
              </Link>
            )}
          </div>
        ) : (
          <>
            <p className="text-sm mb-4" style={{ color: '#94A3B8' }}>
              {filtered.length} shop{filtered.length !== 1 ? 's' : ''} found
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(170px,1fr))", gap: "0.85rem" }}>
              {filtered.map((store, i) => (
                <StoreCard key={store.id} store={store} />
              ))}
            </div>
          </>
        )}
      </div>

      <SiteFooter />
    </main>
  )
}
