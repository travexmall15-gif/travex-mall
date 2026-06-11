'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { Particles } from '@/components/particles'
import { sb, type CampusStore, fmtTZS } from '@/lib/supabase'
import {
  Store, GraduationCap, Briefcase, FileText, ShieldCheck,
  Rocket, TrendingUp, Sparkles, Heart, Zap, ArrowRight,
  Search, MapPin, Star, MessageCircle, ExternalLink,
  ChevronDown, ChevronUp,
} from 'lucide-react'

// ── STATIC DATA ──
const stats = [
  { value: '3M+', label: 'Tanzania SMEs' },
  { value: '$75B', label: 'Africa Market' },
  { value: '30%+', label: 'Annual Growth' },
  { value: '200', label: 'Founding Shops' },
]

const categories = [
  { icon: '👗', name: 'Fashion', slug: 'Fashion' },
  { icon: '📱', name: 'Electronics', slug: 'Electronics' },
  { icon: '🌾', name: 'Food', slug: 'Food' },
  { icon: '💄', name: 'Beauty', slug: 'Beauty' },
  { icon: '🔧', name: 'Services', slug: 'Services' },
  { icon: '🏠', name: 'Home', slug: 'Home' },
  { icon: '📚', name: 'Books', slug: 'Books' },
  { icon: '🛒', name: 'All', slug: '' },
]

const regions = [
  { label: '🇹🇿 All Tanzania', value: '' },
  { label: '🌊 Dar es Salaam', value: 'Dar es Salaam' },
  { label: '🏔️ Arusha', value: 'Arusha' },
  { label: '🏛️ Dodoma', value: 'Dodoma' },
]

const steps = [
  { icon: FileText, title: 'Apply', desc: 'Submit your shop application with your details.' },
  { icon: ShieldCheck, title: 'Verify', desc: 'Our team reviews and verifies within 48 hours.' },
  { icon: Rocket, title: 'Launch', desc: 'Set up your storefront, add products and go live.' },
  { icon: TrendingUp, title: 'Earn', desc: 'Receive orders via WhatsApp and grow your revenue.' },
]

const benefits = [
  { icon: Zap, title: 'Instant WhatsApp Orders', desc: 'Customers order directly through WhatsApp — no complex checkout.' },
  { icon: Sparkles, title: 'Built-in AI Assistants', desc: 'AI helps with customer care, marketing plans and pricing.' },
  { icon: Heart, title: 'Social Vybe Feed', desc: 'Promote products on campus social commerce feed.' },
  { icon: ShieldCheck, title: 'Verified Badges', desc: 'Build trust with customers through our verification system.' },
  { icon: TrendingUp, title: 'Real-time Analytics', desc: 'Track revenue, orders and growth in your dashboard.' },
  { icon: MapPin, title: 'Nationwide Reach', desc: 'Reach customers across all 8 regions of Tanzania.' },
]

const faqs = [
  { q: 'How much does it cost to open a campus shop?', a: 'Campus shops cost TZS 15,000/month. Business shops start at TZS 25,000/month for B2C and TZS 75,000/month for B2B.' },
  { q: 'How do I receive orders?', a: 'Customers place orders through your shop page and you receive a WhatsApp message with full order details instantly.' },
  { q: 'How long does approval take?', a: 'Applications are reviewed within 24-48 hours. You will receive an email notification once approved.' },
  { q: 'Can I sell any product?', a: 'Yes, as long as it is legal. Our categories include Fashion, Electronics, Food, Beauty, Services, Books and more.' },
  { q: 'Is there a limit on products I can list?', a: 'No limit. You can list as many products as you want with images, descriptions and pricing.' },
  { q: 'How does the AI assistant work?', a: 'Your shop gets a built-in AI customer care assistant that answers customer questions about your products automatically.' },
]

const universities = [
  { slug: 'udsm', name: 'University of Dar es Salaam', abbr: 'UDSM', city: 'Dar es Salaam' },
  { slug: 'aru', name: 'Ardhi University', abbr: 'ARU', city: 'Dar es Salaam' },
  { slug: 'udom', name: 'University of Dodoma', abbr: 'UDOM', city: 'Dodoma' },
  { slug: 'tia', name: 'Tanzania Institute of Accountancy', abbr: 'TIA', city: 'Dar es Salaam' },
]

// ── STORE CARD ──
function StoreCard({ store }: { store: CampusStore }) {
  const initials = store.store_name.split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase()
  const color = store.primary_color || '#0D1B3E'
  const wa = (store.whatsapp_number || '').replace(/\D/g, '')
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-200 group">
      <div className="h-28 relative" style={{ background: `linear-gradient(135deg, ${color}, #1B3A6B)` }}>
        {store.banner && <img src={store.banner} alt="" className="absolute inset-0 w-full h-full object-cover opacity-50" />}
        {store.is_verified && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" /> Verified
          </div>
        )}
      </div>
      <div className="px-4 pb-5">
        <div className="w-16 h-16 rounded-xl border-4 border-white shadow-lg flex items-center justify-center font-bold text-white text-lg -mt-8 mb-3"
          style={{ background: color }}>
          {store.logo ? <img src={store.logo} alt="" className="w-full h-full object-cover rounded-lg" /> : initials}
        </div>
        <h3 className="font-bold text-navy text-sm mb-1">{store.store_name}</h3>
        <div className="flex gap-2 flex-wrap mb-2">
          {store.category && (
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(201,168,76,0.1)', color: '#92741a' }}>
              {store.category}
            </span>
          )}
          {store.university_abbr && (
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(124,58,237,0.1)', color: '#7C3AED' }}>
              🎓 {store.university_abbr}
            </span>
          )}
        </div>
        {store.description && <p className="text-gray-400 text-xs line-clamp-2 mb-3">{store.description}</p>}
        <div className="flex gap-2">
          {wa && (
            <a href={`https://wa.me/${wa}`} target="_blank"
              className="flex-1 py-2 rounded-xl text-xs font-bold text-center text-white flex items-center justify-center gap-1"
              style={{ background: '#25D366' }}>
              <MessageCircle className="h-3 w-3" /> WhatsApp
            </a>
          )}
          <Link href={`/store/${store.id}`}
            className="flex-1 py-2 rounded-xl text-xs font-bold text-center text-white flex items-center justify-center gap-1"
            style={{ background: '#0D1B3E' }}>
            <ExternalLink className="h-3 w-3" /> Visit
          </Link>
        </div>
      </div>
    </div>
  )
}

// ── MAIN PAGE ──
export default function HomePage() {
  const [stores, setStores] = useState<CampusStore[]>([])
  const [topStores, setTopStores] = useState<CampusStore[]>([])
  const [filteredStores, setFilteredStores] = useState<CampusStore[]>([])
  const [category, setCategory] = useState('')
  const [region, setRegion] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    async function load() {
      // Load all active stores
      const { data } = await sb.from('campus_stores')
        .select('*').eq('is_active', true)
        .order('created_at', { ascending: false })
      setStores(data || [])
      setFilteredStores(data || [])

      // Top rated = verified stores first
      const top = (data || [])
        .filter((s: CampusStore) => s.is_verified)
        .slice(0, 6)
      setTopStores(top)
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    let list = stores
    if (category) list = list.filter(s => s.category === category)
    if (region) list = list.filter(s => s.university?.includes(region) || s.description?.includes(region))
    if (search) list = list.filter(s =>
      s.store_name.toLowerCase().includes(search.toLowerCase()) ||
      s.description?.toLowerCase().includes(search.toLowerCase()) ||
      s.category?.toLowerCase().includes(search.toLowerCase())
    )
    setFilteredStores(list)
  }, [category, region, search, stores])

  const displayStores = showAll ? filteredStores : filteredStores.slice(0, 12)

  return (
    <main className="bg-offwhite">
      <SiteNav />

      {/* ── HERO ── */}
      <section className="relative flex min-h-screen items-center overflow-hidden bg-navy pt-16 text-white">
        <div className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: 'url(/hero-marketplace.png)' }} />
        <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy/90 to-blue-900/80" />
        <Particles />
        <div className="relative mx-auto max-w-7xl px-4 py-20 md:px-6">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-sm font-semibold text-gold mb-6">
              <Sparkles className="h-4 w-4" /> Africa's Intelligent Digital Marketplace
            </span>
            <h1 className="text-5xl font-black leading-tight md:text-7xl mb-6"
              style={{ fontFamily: 'Playfair Display, serif' }}>
              Tanzania's <span className="text-gold">Digital</span> Marketplace
            </h1>
            <p className="text-lg text-white/70 mb-8 max-w-2xl leading-relaxed">
              Shop from verified businesses and student entrepreneurs across Tanzania. 
              Fast WhatsApp ordering, AI-powered customer care, and campus-to-nationwide delivery.
            </p>
            {/* Live stats */}
            <div className="flex gap-6 mb-8 flex-wrap">
              {[
                [`${stores.length || '200'}+`, 'Active Shops'],
                ['4', 'Universities'],
                ['8', 'Regions'],
              ].map(([v, l]) => (
                <div key={l}>
                  <div className="text-2xl font-black text-gold">{v}</div>
                  <div className="text-xs text-white/50">{l}</div>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#stores"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-7 py-3.5 text-base font-bold text-navy hover:bg-gold-light transition-all">
                <Store className="h-5 w-5" /> Browse Shops
              </a>
              <Link href="/campus-apply"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/5 px-7 py-3.5 text-base font-semibold text-white hover:bg-white/10 transition-all">
                Open Your Shop <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── TWO MARKETS ── */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:py-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-navy mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            What Kind of Shop Are You Looking For?
          </h2>
          <p className="text-gray-500">Choose your marketplace</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Link href="/campus"
            className="group relative overflow-hidden rounded-2xl bg-navy p-8 text-white shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all md:p-10">
            <GraduationCap className="h-12 w-12 text-gold mb-5" />
            <h2 className="text-3xl font-bold mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>Campus Market</h2>
            <p className="text-sm font-semibold uppercase tracking-wider text-gold mb-4">For University Students</p>
            <p className="text-white/70 mb-6">Shop from verified student entrepreneurs at your campus. TZS 15,000/month to open your shop.</p>
            <span className="inline-flex items-center gap-2 font-semibold text-gold">
              Explore Campus <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
          <Link href="/market"
            className="group relative overflow-hidden rounded-2xl bg-gold p-8 text-navy shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all md:p-10">
            <Briefcase className="h-12 w-12 text-navy mb-5" />
            <h2 className="text-3xl font-bold mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>Business Market</h2>
            <p className="text-sm font-semibold uppercase tracking-wider text-navy/60 mb-4">For Businesses &amp; SMEs</p>
            <p className="text-navy/80 mb-6">Reach customers across Tanzania. Manage orders, scale nationwide and grow your revenue.</p>
            <span className="inline-flex items-center gap-2 font-semibold text-navy">
              Explore Business <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="bg-navy py-12">
        <div className="mx-auto max-w-7xl px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(s => (
            <div key={s.label} className="text-center">
              <p className="text-4xl font-black text-gold md:text-5xl" style={{ fontFamily: 'Playfair Display, serif' }}>{s.value}</p>
              <p className="mt-1 text-sm text-white/60">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SHOP BY CATEGORY ── */}
      <section id="categories" className="mx-auto max-w-7xl px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-navy mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            What Are You Looking For?
          </h2>
          <p className="text-gray-500">Browse categories of verified businesses across Tanzania</p>
        </div>
        <div className="flex flex-wrap gap-3 justify-center mb-6">
          {categories.map(cat => (
            <button key={cat.name} onClick={() => setCategory(cat.slug)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 font-semibold text-sm transition-all"
              style={{
                background: category === cat.slug ? '#0D1B3E' : '#fff',
                color: category === cat.slug ? '#fff' : '#0D1B3E',
                borderColor: category === cat.slug ? '#0D1B3E' : '#E5E7EB',
              }}>
              <span>{cat.icon}</span> {cat.name}
            </button>
          ))}
        </div>
        {/* Region filter */}
        <div className="flex flex-wrap gap-2 justify-center">
          <span className="text-sm text-gray-500 flex items-center gap-1"><MapPin className="h-4 w-4" /> Region:</span>
          {regions.map(r => (
            <button key={r.value} onClick={() => setRegion(r.value)}
              className="px-3 py-1.5 rounded-full text-sm font-medium transition-all border"
              style={{
                background: region === r.value ? '#C9A84C' : '#fff',
                color: region === r.value ? '#0D1B3E' : '#6B7280',
                borderColor: region === r.value ? '#C9A84C' : '#E5E7EB',
              }}>
              {r.label}
            </button>
          ))}
        </div>
      </section>

      {/* ── ALL STORES ── */}
      <section id="stores" className="mx-auto max-w-7xl px-4 pb-16">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-bold text-navy" style={{ fontFamily: 'Playfair Display, serif' }}>
              All Stores
            </h2>
            <p className="text-gray-500 mt-1">{filteredStores.length} shops found</p>
          </div>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search shops..."
              className="pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-navy w-56" />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-72 animate-pulse" />
            ))}
          </div>
        ) : filteredStores.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <Store className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-navy mb-2">No shops found</h3>
            <p className="text-gray-500 mb-6">Try a different category or search term</p>
            <button onClick={() => { setCategory(''); setRegion(''); setSearch('') }}
              className="px-6 py-2.5 rounded-xl bg-gold text-navy font-bold text-sm">
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {displayStores.map(store => <StoreCard key={store.id} store={store} />)}
            </div>
            {filteredStores.length > 12 && (
              <div className="text-center mt-10">
                <button onClick={() => setShowAll(!showAll)}
                  className="px-8 py-3 rounded-xl border-2 border-navy text-navy font-bold text-sm hover:bg-navy hover:text-white transition-all">
                  {showAll ? 'Show Less' : `View All ${filteredStores.length} Shops`}
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* ── TOP RATED ── */}
      {topStores.length > 0 && (
        <section id="top-rated" className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
              <div>
                <h2 className="text-3xl font-bold text-navy" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Top Rated Stores ⭐⭐⭐⭐⭐
                </h2>
                <p className="text-gray-500 mt-1">Highest rated verified stores — selected by real customer reviews</p>
              </div>
              <Link href="/campus" className="text-sm font-semibold text-navy hover:text-gold transition-colors flex items-center gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {topStores.map(store => <StoreCard key={store.id} store={store} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── UNIVERSITY MARKET ── */}
      <section id="uni" className="bg-navy py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center text-white mb-12">
            <span className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-3 py-1 text-sm font-semibold text-gold mb-4">
              <GraduationCap className="h-4 w-4" /> Exclusively For University Students
            </span>
            <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Travex Uni-Student Market
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto mb-8">
              Tanzania's first verified student marketplace. Buy from trusted student entrepreneurs 
              at your own university — same campus, fast delivery, affordable prices.
            </p>
            <div className="flex gap-8 justify-center mb-10 flex-wrap">
              {[['200', 'Founding Shops'], ['5', 'Universities'], ['TZS 15K', 'Per Month']].map(([v, l]) => (
                <div key={l} className="text-center">
                  <div className="text-3xl font-black text-gold">{v}</div>
                  <div className="text-sm text-white/50">{l}</div>
                </div>
              ))}
            </div>
            <Link href="/campus-apply"
              className="inline-flex items-center gap-2 rounded-xl bg-gold px-8 py-3.5 font-bold text-navy hover:bg-gold-light transition-all">
              Apply for Early Access <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {/* University cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {universities.map(uni => (
              <Link key={uni.slug} href={`/campus/${uni.slug}`}
                className="bg-white/5 border border-white/10 rounded-xl p-5 text-center hover:bg-white/10 transition-all hover:-translate-y-1">
                <div className="text-3xl font-black text-gold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>{uni.abbr}</div>
                <div className="text-xs text-white/60 mb-1">{uni.name}</div>
                <div className="text-xs text-white/40 flex items-center justify-center gap-1">
                  <MapPin className="h-3 w-3" /> {uni.city}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-navy mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            How It Works
          </h2>
          <p className="text-gray-500">Launch your shop in four simple steps.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-4">
          {steps.map((step, i) => (
            <div key={step.title} className="relative rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm hover:shadow-md transition-all">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-3 py-0.5 text-xs font-bold text-navy">
                Step {i + 1}
              </span>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-navy/5 mb-4 mt-2">
                <step.icon className="h-7 w-7 text-navy" />
              </div>
              <h3 className="text-lg font-bold text-navy mb-2">{step.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SOCIAL VYBE PREVIEW ── */}
      <section className="bg-offwhite py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="overflow-hidden rounded-2xl bg-[#07010E] p-8 md:p-12">
            <div className="grid items-center gap-8 md:grid-cols-2">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-3 py-1 text-sm font-semibold text-gold mb-4">
                  <Sparkles className="h-4 w-4" /> Social Commerce
                </span>
                <h2 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Social Vybe Feed
                </h2>
                <p className="text-white/70 mb-6 leading-relaxed">
                  A campus social commerce feed where shops post products, customers discover and order on WhatsApp instantly.
                </p>
                <Link href="/vybe"
                  className="inline-flex items-center gap-2 rounded-xl bg-gold px-6 py-3 font-bold text-navy hover:bg-gold-light transition-all">
                  Open Social Vybe <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  '/social-vybe-ankara-fashion-flatlay.png',
                  '/clean-white-sneakers-product-shot.png',
                  '/skincare-cosmetics-flatlay-beauty.png',
                  '/tanzanian-pilau-rice-meal.png',
                  '/wireless-earbuds-product-photo.png',
                  '/smoothie-bowl-healthy-breakfast.png',
                ].map((src) => (
                  <img key={src} src={src} alt="Vybe" className="aspect-square w-full rounded-xl object-cover opacity-80 hover:opacity-100 transition-all" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BENEFITS ── */}
      <section className="bg-navy py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center text-white mb-12">
            <h2 className="text-3xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
              Why Sellers Love Travex Mall
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {benefits.map(b => (
              <div key={b.title} className="rounded-xl border border-white/10 bg-white/5 p-7">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/15 mb-5">
                  <b.icon className="h-6 w-6 text-gold" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{b.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="mx-auto max-w-3xl px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-navy mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            Frequently Asked Questions
          </h2>
          <p className="text-gray-500">Everything you need to know about Travex Mall</p>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-all">
                <span className="font-semibold text-navy text-sm pr-4">{faq.q}</span>
                {openFaq === i
                  ? <ChevronUp className="h-5 w-5 text-gold flex-shrink-0" />
                  : <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />}
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5 text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-gold py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-4xl font-black text-navy mb-4 md:text-5xl" style={{ fontFamily: 'Playfair Display, serif' }}>
            Open Your Shop Today
          </h2>
          <p className="text-navy/80 mb-8 max-w-xl mx-auto">
            Join {stores.length || '200'}+ sellers already growing on Travex Mall across Tanzania.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/campus-apply"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-navy px-8 py-4 font-bold text-white hover:bg-blue-900 transition-all">
              <GraduationCap className="h-5 w-5" /> Open Campus Shop
            </Link>
            <Link href="/open-store-b2c"
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-navy px-8 py-4 font-bold text-navy hover:bg-navy hover:text-white transition-all">
              <Briefcase className="h-5 w-5" /> Open Business Store
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
