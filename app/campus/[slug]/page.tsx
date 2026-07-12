'use client'

import { use, useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { sb, type CampusStore, fmtTZS } from '@/lib/supabase'
import { getUniversity } from '@/lib/data'
import { MapPin, ArrowLeft, Search, ShieldCheck, Store } from 'lucide-react'

// Distinct color palettes, index-based so every card looks different
const CARD_PALETTES = [
  { bg: 'linear-gradient(135deg,#0D1B3E,#1B3A8A)', accent: '#60A5FA', text: '#fff' },
  { bg: 'linear-gradient(135deg,#7C2D12,#C2410C)', accent: '#FB923C', text: '#fff' },
  { bg: 'linear-gradient(135deg,#14532D,#166534)', accent: '#4ADE80', text: '#fff' },
  { bg: 'linear-gradient(135deg,#4C1D95,#7C3AED)', accent: '#C084FC', text: '#fff' },
  { bg: 'linear-gradient(135deg,#831843,#9D174D)', accent: '#F472B6', text: '#fff' },
  { bg: 'linear-gradient(135deg,#713F12,#A16207)', accent: '#FCD34D', text: '#fff' },
  { bg: 'linear-gradient(135deg,#0C4A6E,#0369A1)', accent: '#38BDF8', text: '#fff' },
  { bg: 'linear-gradient(135deg,#1C1917,#44403C)', accent: '#A8A29E', text: '#fff' },
]

const CAT_COLORS: Record<string, { bg: string; accent: string }> = {
  'Fashion':     { bg: 'linear-gradient(135deg,#7C3009,#B8540A)', accent: '#FB923C' },
  'Food':        { bg: 'linear-gradient(135deg,#14532D,#166534)', accent: '#4ADE80' },
  'Electronics': { bg: 'linear-gradient(135deg,#0D1B3E,#1B3A8A)', accent: '#60A5FA' },
  'Beauty':      { bg: 'linear-gradient(135deg,#831843,#9D174D)', accent: '#F472B6' },
  'Books':       { bg: 'linear-gradient(135deg,#1C1917,#292524)', accent: '#A8A29E' },
  'Services':    { bg: 'linear-gradient(135deg,#4C1D95,#7C3AED)', accent: '#C084FC' },
  'Other':       { bg: 'linear-gradient(135deg,#0C4A6E,#0369A1)', accent: '#38BDF8' },
}

function StoreCard({ store, index }: { store: CampusStore; index: number }) {
  const initials  = store.store_name.split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase()
  // Use category color if available, otherwise use index-based palette
  const catStyle  = store.category ? (CAT_COLORS[store.category] || CAT_COLORS['Other']) : null
  const palette   = CARD_PALETTES[index % CARD_PALETTES.length]
  const bg        = store.primary_color ? `linear-gradient(135deg,${store.primary_color},${store.primary_color}88)` : (catStyle?.bg || palette.bg)
  const accent    = store.primary_color || catStyle?.accent || palette.accent
  const wa        = (store.whatsapp_number || '').replace(/\D/g, '')

  return (
    <div className="rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
      style={{ background: '#fff', border: `2px solid ${accent}30`, boxShadow: `0 4px 20px ${accent}15` }}>

      {/* Colored Banner */}
      <div className="relative h-28" style={{ background: bg }}>
        {store.banner && (
          <Image src={store.banner} alt={store.store_name} fill className="object-cover" />
        )}
        {/* Verified badge */}
        {store.is_verified && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold"
            style={{ background: 'rgba(34,197,94,0.9)', color: '#fff' }}>
            <ShieldCheck className="h-3 w-3" /> Verified
          </div>
        )}
        {/* Category pill */}
        {store.category && (
          <div className="absolute bottom-2 left-3 px-2 py-0.5 rounded-full text-xs font-bold"
            style={{ background: 'rgba(0,0,0,0.45)', color: '#fff', backdropFilter: 'blur(4px)' }}>
            {store.category}
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4">
        {/* Logo + Name row */}
        <div className="flex items-center gap-3 mb-3 -mt-8">
          <div className="w-14 h-14 rounded-xl border-4 border-white shadow-md flex items-center justify-center font-bold text-base flex-shrink-0 relative z-10"
            style={{ background: bg, color: accent, fontSize: '1.1rem' }}>
            {store.logo
              ? <Image src={store.logo} alt="" fill className="object-cover rounded-lg" />
              : initials}
          </div>
          <div style={{ marginTop: '16px' }}>
            <h3 className="font-bold text-sm leading-tight" style={{ color: '#0D1B3E' }}>
              {store.store_name}
            </h3>
            <p className="text-xs" style={{ color: '#64748B' }}>{store.university_abbr}</p>
          </div>
        </div>

        {/* Description */}
        {store.description && (
          <p className="text-xs leading-relaxed mb-3 line-clamp-2" style={{ color: '#64748B' }}>
            {store.description}
          </p>
        )}

        {/* Accent bar */}
        <div className="h-0.5 w-full rounded mb-3" style={{ background: `linear-gradient(90deg,${accent},${accent}33)` }} />

        {/* Visit Shop only */}
        <Link href={`/store/${store.id}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 12px', background: '#0D1B3E', color: '#fff', borderRadius: '7px', fontSize: '0.65rem', fontWeight: 700, textDecoration: 'none' }}>
          <Store className="h-3 w-3" /> Visit Shop
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
              <ArrowLeft size={12} /> Back
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
            <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' as const, letterSpacing: '0.08em', flexShrink: 0, minWidth: '52px' }}>Category</span>
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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((store, i) => (
                <StoreCard key={store.id} store={store} index={i} />
              ))}
            </div>
          </>
        )}
      </div>

      <SiteFooter />
    </main>
  )
}
