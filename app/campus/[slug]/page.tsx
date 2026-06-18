'use client'

import { use, useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { sb, type CampusStore, fmtTZS } from '@/lib/supabase'
import { getUniversity } from '@/lib/data'
import { MapPin, ArrowLeft, Search, MessageCircle, ExternalLink, ShieldCheck, Store } from 'lucide-react'

// Distinct color palettes — index-based so every card looks different
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

        {/* Actions */}
        <div className="flex gap-2">
          {wa && (
            <a href={`https://wa.me/${wa}`} target="_blank"
              className="flex-1 py-2 rounded-xl text-xs font-bold text-center text-white flex items-center justify-center gap-1 transition-all"
              style={{ background: '#25D366' }}>
              <MessageCircle className="h-3 w-3" /> Chat
            </a>
          )}
          <Link href={`/store/${store.id}`}
            className="flex-1 py-2 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1 transition-all"
            style={{ background: bg, color: accent }}>
            <Store className="h-3 w-3" /> View Shop
          </Link>
        </div>
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

      {/* Header */}
      <div className="pt-16" style={{ background: 'linear-gradient(135deg,#0D1B3E 0%,#1B3A8A 100%)' }}>
        <div className="max-w-6xl mx-auto px-5 py-8">
          <button onClick={() => router.back()}
            className="flex items-center gap-2 text-sm mb-6 transition-all"
            style={{ color: 'rgba(255,255,255,0.6)' }}>
            <ArrowLeft className="h-4 w-4" /> Back to Campus Market
          </button>

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3"
                style={{ background: 'rgba(201,168,76,0.2)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)' }}>
                🎓 {slug.toUpperCase()}
              </div>
              <h1 className="text-3xl font-black text-white mb-1" style={{ fontFamily: "'Playfair Display',serif" }}>
                {uni?.name || slug.toUpperCase()}
              </h1>
              <div className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                <MapPin className="h-4 w-4" />
                <span>{uni?.city || 'Tanzania'}</span>
                <span>•</span>
                <span>{loading ? '...' : stores.length} active shops</span>
                <span>•</span>
                <span style={{ color: slotsLeft > 10 ? '#4ADE80' : slotsLeft > 0 ? '#FCD34D' : '#F87171' }}>
                  {slotsLeft > 0 ? `${slotsLeft} slots left` : 'Full'}
                </span>
              </div>
            </div>
            <Link href="/campus-apply"
              className="px-5 py-2.5 rounded-full text-sm font-bold transition-all"
              style={{ background: '#C9A84C', color: '#0D1B3E', boxShadow: '0 4px 14px rgba(201,168,76,0.4)' }}>
              Open Your Shop →
            </Link>
          </div>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="max-w-6xl mx-auto px-5 py-6">
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#94A3B8' }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder={`Search shops at ${slug.toUpperCase()}...`}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: '#fff', border: '1.5px solid #E2E8F0', color: '#0F172A' }}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map(c => (
              <button key={c} onClick={() => setCat(c)}
                className="px-4 py-2 rounded-xl text-xs font-bold transition-all"
                style={{
                  background: cat === c ? '#0D1B3E' : '#fff',
                  color: cat === c ? '#fff' : '#64748B',
                  border: `1.5px solid ${cat === c ? '#0D1B3E' : '#E2E8F0'}`,
                }}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">
            <div className="animate-spin text-4xl mb-3">⏳</div>
            <p>Loading shops...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🏪</div>
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
