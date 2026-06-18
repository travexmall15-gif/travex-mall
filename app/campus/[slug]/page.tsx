'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { sb, type CampusStore, fmtTZS } from '@/lib/supabase'
import { getUniversity } from '@/lib/data'
import { MapPin, ArrowLeft, Search, MessageCircle, ExternalLink, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

const CATEGORIES = ['All', 'Fashion', 'Food', 'Electronics', 'Beauty', 'Books', 'Services']

export default function UniversityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const uni = getUniversity(slug)
  const router = useRouter()
  const [stores, setStores] = useState<CampusStore[]>([])
  const [filtered, setFiltered] = useState<CampusStore[]>([])
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await sb.from('campus_stores')
        .select('*')
        .eq('university_abbr', slug.toUpperCase())
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      setStores(data || [])
      setFiltered(data || [])
      setLoading(false)
    }
    load()
  }, [slug])

  useEffect(() => {
    let list = stores
    if (category !== 'All') list = list.filter(s => s.category === category)
    if (search) list = list.filter(s => s.store_name.toLowerCase().includes(search.toLowerCase()))
    setFiltered(list)
  }, [category, search, stores])

  const uniAbbr = slug.toUpperCase()
  const uniName = uni?.name || uniAbbr
  const slotsLeft = 60 - stores.length

  return (
    <main className="bg-offwhite min-h-screen">
      <SiteNav />
      
      {/* Hero */}
      <section className="pt-16" style={{ background: '#0D1B3E' }}>
        <div className="mx-auto max-w-7xl px-4 py-12">
          <Link href="/campus" className="inline-flex items-center gap-2 text-sm mb-6" style={{ color: 'rgba(255,255,255,0.5)' }}>
            <ArrowLeft className="h-4 w-4" /> Back to Campus Market
          </Link>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-3" style={{ background: 'rgba(201,168,76,0.15)', color: '#C9A84C' }}>
                <MapPin className="inline h-3 w-3 mr-1" />{uni?.city || 'Tanzania'}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                {uniAbbr} <span style={{ color: '#C9A84C' }}>Marketplace</span>
              </h1>
              <p className="text-white/50 text-sm">{uniName}</p>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: '#C9A84C' }}>{stores.length}</div>
                <div className="text-xs text-white/40">Active Shops</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{slotsLeft}</div>
                <div className="text-xs text-white/40">Slots Left</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <div className="sticky top-16 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-3 overflow-x-auto">
          <div className="relative flex-shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search shops..." className="pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm outline-none w-48" />
          </div>
          <div className="flex gap-2">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className="px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all"
                style={{ background: category === cat ? '#0D1B3E' : '#F8F9FC', color: category === cat ? '#fff' : '#6B7280', border: '1px solid', borderColor: category === cat ? '#0D1B3E' : '#E5E7EB' }}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Shops Grid */}
      <div className="mx-auto max-w-7xl px-4 py-10">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => <div key={i} className="rounded-xl bg-white animate-pulse h-72" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🏪</div>
            <h3 className="text-xl font-bold text-navy mb-2">No shops yet</h3>
            <p className="text-gray-500 mb-6">Be the first to open a shop at {uniAbbr}!</p>
            <Link href="/campus-apply" className="inline-block px-6 py-3 rounded-lg font-bold text-sm" style={{ background: '#C9A84C', color: '#0D1B3E' }}>
              Apply for a Shop
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map(store => <StoreCard key={store.id} store={store} />)}
          </div>
        )}
      </div>
      <SiteFooter />
    </main>
  )
}

const CAT_COLORS: Record<string, { bg: string; accent: string }> = {
  'Fashion':     { bg: 'linear-gradient(135deg,#7C3009,#B8540A)', accent: '#FB923C' },
  'Food':        { bg: 'linear-gradient(135deg,#14532D,#166534)', accent: '#4ADE80' },
  'Electronics': { bg: 'linear-gradient(135deg,#0D1B3E,#1B3A8A)', accent: '#60A5FA' },
  'Beauty':      { bg: 'linear-gradient(135deg,#831843,#9D174D)', accent: '#F472B6' },
  'Books':       { bg: 'linear-gradient(135deg,#1C1917,#292524)', accent: '#A8A29E' },
  'Services':    { bg: 'linear-gradient(135deg,#4C1D95,#7C3AED)', accent: '#C084FC' },
  'Other':       { bg: 'linear-gradient(135deg,#1E293B,#334155)', accent: '#94A3B8' },
}

function StoreCard({ store }: { store: CampusStore }) {
  const initials = store.store_name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()
  const catStyle = CAT_COLORS[store.category || 'Other'] || CAT_COLORS['Other']
  const color    = store.primary_color || catStyle.accent
  const bannerBg = store.banner ? undefined : catStyle.bg
  const wa = (store.whatsapp_number || '').replace(/\D/g, '')

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1 group">
      {/* Banner */}
      <div className="h-24 relative" style={{ background: bannerBg || `linear-gradient(135deg, ${color}, ${color}88)` }}>
        {store.banner && <img src={store.banner} alt="" className="w-full h-full object-cover absolute inset-0" />}
        {store.is_verified && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" /> Verified
          </div>
        )}
      </div>
      {/* Logo */}
      <div className="px-4 pb-4">
        <div className="w-14 h-14 rounded-xl border-4 border-white -mt-7 mb-3 flex items-center justify-center font-bold text-white text-lg relative z-10"
          style={{ background: color }}>
          {store.logo ? <img src={store.logo} alt="" className="w-full h-full object-cover rounded-lg" /> : initials}
        </div>
        <h3 className="font-bold text-navy text-sm mb-1">{store.store_name}</h3>
        {store.category && (
          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(201,168,76,0.1)', color: '#92741a' }}>
            {store.category}
          </span>
        )}
        {store.description && <p className="text-gray-500 text-xs mt-2 line-clamp-2">{store.description}</p>}
        <div className="flex gap-2 mt-3">
          {wa && (
            <a href={`https://wa.me/${wa}`} target="_blank"
              className="flex-1 py-2 rounded-lg text-xs font-bold text-center text-white transition-all"
              style={{ background: '#25D366' }}>
              <MessageCircle className="inline h-3 w-3 mr-1" /> WhatsApp
            </a>
          )}
          <Link href={`/store/${store.id}`}
            className="flex-1 py-2 rounded-lg text-xs font-bold text-center transition-all"
            style={{ background: '#0D1B3E', color: '#fff' }}>
            <ExternalLink className="inline h-3 w-3 mr-1" /> Visit Shop
          </Link>
        </div>
      </div>
    </div>
  )
}
