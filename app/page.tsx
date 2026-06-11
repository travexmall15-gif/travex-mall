import Link from 'next/link'
import Image from 'next/image'
import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { Particles } from '@/components/particles'
import { ShopCard } from '@/components/shop-card'
import { shops, universities } from '@/lib/data'
import {
  Store, GraduationCap, Briefcase, FileText, ShieldCheck,
  Rocket, TrendingUp, Sparkles, Heart, Zap, ArrowRight,
  Star, Phone, Download, Users, Globe, Package,
} from 'lucide-react'

// ── DATA ──
const stats = [
  { value: '175+', label: 'Active Shops' },
  { value: '4', label: 'Universities' },
  { value: '12K+', label: 'Monthly Orders' },
  { value: '8', label: 'Cities' },
]

const steps = [
  { icon: FileText,    title: 'Apply',   desc: 'Submit your shop application with student ID.' },
  { icon: ShieldCheck, title: 'Verify',  desc: 'Our team reviews and approves within 48 hours.' },
  { icon: Rocket,      title: 'Launch',  desc: 'Add products and go live instantly.' },
  { icon: TrendingUp,  title: 'Earn',    desc: 'Receive WhatsApp orders and grow your revenue.' },
]

const benefits = [
  { icon: Zap,      title: 'Instant WhatsApp Orders', desc: 'Customers order via WhatsApp — no complex checkout.' },
  { icon: Sparkles, title: 'Built-in AI Assistants',  desc: 'AI for customer care, marketing and pricing.' },
  { icon: Heart,    title: 'Social Vybe Feed',         desc: 'Promote products on campus social commerce feed.' },
  { icon: TrendingUp, title: 'Sales Analytics',       desc: 'Track revenue and orders in real-time.' },
  { icon: ShieldCheck, title: 'Verified Badge',        desc: 'Build trust with a verified shop badge.' },
  { icon: Globe,    title: 'Nationwide Reach',         desc: 'Reach customers across all of Tanzania.' },
]

const b2cFeatures = ['Personal shop page', 'Unlimited products', 'WhatsApp orders', 'AI Customer Care', 'Social Vybe posting', 'Sales dashboard']
const b2bFeatures = ['Business verification', 'Multiple products', 'Bulk orders', 'Business analytics', 'Priority listing', 'Dedicated support']

const testimonials = [
  { name: 'Amina Hassan', role: 'Fashion Seller, UDSM', text: 'I went from selling at the hostel gate to getting 50+ orders a week on Travex. The WhatsApp integration is genius!', rating: 5 },
  { name: 'John Mushi', role: 'Electronics, ARU', text: 'The AI assistant answers my customers even when I am in class. My revenue doubled in 2 months.', rating: 5 },
  { name: 'Grace Temba', role: 'Food Vendor, UDOM', text: 'Setting up my shop took 5 minutes. Now I get lunch orders every day before 10am.', rating: 5 },
]

export default function HomePage() {
  return (
    <main className="bg-offwhite">
      <SiteNav />

      {/* ── HERO ── */}
      <section className="relative flex min-h-screen items-center overflow-hidden bg-navy pt-16 text-white">
        <div className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{ backgroundImage: 'url(/hero-marketplace.png)' }} aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy/90 to-blue-900/80" aria-hidden />
        <Particles />
        <div className="relative mx-auto max-w-7xl px-4 py-20 md:px-6">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-sm font-semibold text-gold mb-6">
              <Sparkles className="h-4 w-4" /> Tanzania's #1 Digital Marketplace
            </span>
            <h1 className="mt-2 text-5xl font-black leading-tight md:text-7xl mb-6"
              style={{ fontFamily: 'Playfair Display, serif' }}>
              Tanzania's <span className="text-gold">Digital</span> Marketplace
            </h1>
            <p className="text-lg text-white/70 mb-8 max-w-2xl leading-relaxed">
              Shop, sell and connect across campuses and businesses. From your hostel to nationwide delivery — Travex Mall powers commerce for students and SMEs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Link href="/campus"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-7 py-3.5 text-base font-bold text-navy hover:bg-gold-light transition-all hover:shadow-lg">
                <Store className="h-5 w-5" /> Browse Mall
              </Link>
              <Link href="/campus-apply"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/5 px-7 py-3.5 text-base font-semibold text-white hover:bg-white/10 backdrop-blur transition-all">
                Open Your Shop <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
            {/* Hero stats */}
            <div className="flex flex-wrap gap-8">
              {stats.map(s => (
                <div key={s.label}>
                  <div className="text-2xl font-black text-gold" style={{ fontFamily: 'Playfair Display, serif' }}>{s.value}</div>
                  <div className="text-sm text-white/50">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TWO MARKETS ── */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:py-24 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-navy mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
            One Mall. Two Markets.
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">Whether you are a student or a business owner, Travex Mall has the right marketplace for you.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Campus Market */}
          <Link href="/campus"
            className="group relative overflow-hidden rounded-2xl bg-navy p-8 text-white shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all md:p-10">
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-gold/5 -translate-y-16 translate-x-16" />
            <GraduationCap className="h-12 w-12 text-gold" />
            <h2 className="mt-5 text-3xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>Campus Market</h2>
            <p className="mt-1 text-sm font-semibold uppercase tracking-wider text-gold">For University Students</p>
            <p className="mt-4 text-white/70">Shop, sell and connect within your campus. Run your verified student shop for just TZS 15,000/month.</p>
            <ul className="mt-6 space-y-2">
              {['ARU · UDSM · UDOM · TIA', '60 slots per university', 'WhatsApp orders + AI'].map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-white/60">
                  <ShieldCheck className="h-4 w-4 text-gold flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <span className="mt-6 inline-flex items-center gap-2 font-semibold text-gold">
              Explore Campus <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>

          {/* Business Market */}
          <Link href="/market"
            className="group relative overflow-hidden rounded-2xl bg-gold p-8 text-navy shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all md:p-10">
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-navy/5 -translate-y-16 translate-x-16" />
            <Briefcase className="h-12 w-12 text-navy" />
            <h2 className="mt-5 text-3xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>Business Market</h2>
            <p className="mt-1 text-sm font-semibold uppercase tracking-wider text-navy/60">For Businesses & SMEs</p>
            <p className="mt-4 text-navy/80">Reach customers across Tanzania. List products, manage orders and scale your business nationwide.</p>
            <ul className="mt-6 space-y-2">
              {['B2C from TZS 25,000/month', 'B2B from TZS 75,000/month', 'Nationwide delivery'].map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-navy/70">
                  <ShieldCheck className="h-4 w-4 text-navy flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <span className="mt-6 inline-flex items-center gap-2 font-bold text-navy">
              Explore Business <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="bg-navy py-14">
        <div className="mx-auto max-w-7xl px-4 grid grid-cols-2 gap-8 md:grid-cols-4 md:px-6">
          {stats.map(s => (
            <div key={s.label} className="text-center">
              <p className="text-5xl font-black text-gold" style={{ fontFamily: 'Playfair Display, serif' }}>{s.value}</p>
              <p className="mt-1 text-sm font-medium text-white/60">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:py-24 md:px-6">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <h2 className="text-4xl font-bold text-navy mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>How It Works</h2>
          <p className="text-gray-500">Launch your shop in four simple steps.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-4">
          {steps.map((step, i) => (
            <div key={step.title}
              className="relative rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm hover:shadow-md transition-all">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-3 py-0.5 text-xs font-bold text-navy">
                Step {i + 1}
              </span>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-navy/5 mb-4">
                <step.icon className="h-7 w-7 text-navy" />
              </div>
              <h3 className="font-bold text-navy text-lg mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>{step.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TOP RATED SHOPS CAROUSEL ── */}
      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <div>
              <div className="text-xs font-bold text-gold uppercase tracking-widest mb-2">Editor's Choice</div>
              <h2 className="text-4xl font-bold text-navy" style={{ fontFamily: 'Playfair Display, serif' }}>
                Top Rated Shops ⭐⭐⭐⭐⭐
              </h2>
              <p className="text-gray-500 mt-2">Discover highest-rated shops across all campuses.</p>
            </div>
            <Link href="/campus" className="inline-flex items-center gap-1 font-semibold text-navy hover:text-gold transition-colors">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {/* Horizontal scroll on mobile, grid on desktop */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {shops.slice(0, 6).map(shop => (
              <ShopCard key={shop.slug} shop={shop} />
            ))}
          </div>
        </div>
      </section>

      {/* ── B2C SECTION ── */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:py-24 md:px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-xs font-bold text-gold uppercase tracking-widest mb-3">For Individual Sellers</div>
            <h2 className="text-4xl font-bold text-navy mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Sell Anything. <br />Reach Everyone.
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Whether you sell fashion, food, electronics or services — open your B2C shop and start receiving WhatsApp orders from customers across Tanzania.
            </p>
            <ul className="space-y-3 mb-8">
              {b2cFeatures.map(f => (
                <li key={f} className="flex items-center gap-3 text-sm text-gray-700">
                  <div className="w-5 h-5 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="h-3 w-3 text-gold" />
                  </div>
                  {f}
                </li>
              ))}
            </ul>
            <div className="flex gap-3">
              <Link href="/open-store-b2c"
                className="inline-flex items-center gap-2 rounded-xl bg-navy px-6 py-3 font-bold text-white hover:bg-blue-900 transition-all">
                <Store className="h-4 w-4" /> Open B2C Shop
              </Link>
              <Link href="/market"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-6 py-3 font-semibold text-navy hover:bg-gray-50 transition-all">
                Learn More <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden bg-navy p-8 text-white">
            <div className="text-gold font-bold text-sm uppercase tracking-wider mb-2">B2C Pricing</div>
            <div className="text-5xl font-black mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>TZS 25,000</div>
            <div className="text-white/50 text-sm mb-6">per month · Basic Plan</div>
            <div className="text-3xl font-bold mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>TZS 45,000</div>
            <div className="text-white/50 text-sm mb-6">per month · Premium Plan</div>
            <Link href="/open-store-b2c"
              className="block text-center bg-gold text-navy font-bold py-3 rounded-xl hover:bg-gold-light transition-all">
              Start Selling Today →
            </Link>
          </div>
        </div>
      </section>

      {/* ── B2B SECTION ── */}
      <section className="bg-white py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="rounded-2xl overflow-hidden bg-gold p-8 text-navy order-2 md:order-1">
              <div className="font-bold text-sm uppercase tracking-wider mb-2 text-navy/60">B2B Pricing</div>
              <div className="text-5xl font-black mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>TZS 75,000</div>
              <div className="text-navy/50 text-sm mb-6">per month · Basic Plan</div>
              <div className="text-3xl font-bold mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>TZS 110,000</div>
              <div className="text-navy/50 text-sm mb-6">per month · Premium Plan</div>
              <Link href="/open-store-b2b"
                className="block text-center bg-navy text-white font-bold py-3 rounded-xl hover:bg-blue-900 transition-all">
                Open Business Shop →
              </Link>
            </div>
            <div className="order-1 md:order-2">
              <div className="text-xs font-bold text-gold uppercase tracking-widest mb-3">For Businesses & SMEs</div>
              <h2 className="text-4xl font-bold text-navy mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                Scale Your Business <br />Across Tanzania.
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                Get a verified business shop, manage bulk orders, track analytics and reach customers in every region of Tanzania.
              </p>
              <ul className="space-y-3 mb-8">
                {b2bFeatures.map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm text-gray-700">
                    <div className="w-5 h-5 rounded-full bg-navy/10 flex items-center justify-center flex-shrink-0">
                      <ShieldCheck className="h-3 w-3 text-navy" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/open-store-b2b"
                className="inline-flex items-center gap-2 rounded-xl bg-navy px-6 py-3 font-bold text-white hover:bg-blue-900 transition-all">
                <Briefcase className="h-4 w-4" /> Open B2B Shop
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── SOCIAL VYBE SECTION ── */}
      <section className="bg-offwhite py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
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
                  A campus social commerce feed where shops post products, customers like and discover, then order on WhatsApp instantly. Campus TikTok — but for business.
                </p>
                <div className="flex gap-3">
                  <Link href="/vybe"
                    className="inline-flex items-center gap-2 rounded-xl bg-gold px-6 py-3 font-bold text-navy hover:bg-gold-light transition-all">
                    Open Social Vybe <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href="/campus-dashboard"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3 font-semibold text-white hover:bg-white/10 transition-all">
                    Post from Dashboard
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  '/social-vybe-ankara-fashion-flatlay.png',
                  '/clean-white-sneakers-product-shot.png',
                  '/skincare-cosmetics-flatlay-beauty.png',
                  '/tanzanian-pilau-rice-meal.png',
                  '/wireless-earbuds-product-photo.png',
                  '/smoothie-bowl-healthy-breakfast.png',
                ].map(src => (
                  <img key={src} src={src} alt="Vybe post"
                    className="aspect-square w-full rounded-xl object-cover" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── UNIVERSITY CAMPUS MARKET ── */}
      <section className="bg-white py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <div className="text-xs font-bold text-gold uppercase tracking-widest mb-3">Campus Marketplace</div>
            <h2 className="text-4xl font-bold text-navy mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
              Your University. Your Market.
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">Each university has its own dedicated marketplace. 60 seller slots — apply before they fill up.</p>
          </div>
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            {universities.map(uni => (
              <Link key={uni.slug} href={`/campus/${uni.slug}`}
                className="group rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all">
                <div className="h-28 bg-navy flex flex-col items-center justify-center p-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 to-transparent" />
                  <div className="relative text-3xl font-black text-gold mb-1"
                    style={{ fontFamily: 'Playfair Display, serif' }}>{uni.abbr}</div>
                  <div className="relative text-xs text-white/60 text-center">{uni.city}</div>
                </div>
                <div className="p-4 bg-white">
                  <div className="text-sm font-bold text-navy mb-2 line-clamp-1">{uni.name}</div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">{uni.activeShops} shops</span>
                    <span className={`font-bold ${(uni.totalSlots - uni.activeShops) < 10 ? 'text-red-500' : 'text-green-600'}`}>
                      {uni.totalSlots - uni.activeShops} left
                    </span>
                  </div>
                  <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full bg-gold"
                      style={{ width: `${(uni.activeShops / uni.totalSlots) * 100}%` }} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/campus-apply"
              className="inline-flex items-center gap-2 rounded-xl bg-gold px-8 py-3.5 font-bold text-navy hover:bg-gold-light transition-all">
              <GraduationCap className="h-5 w-5" /> Apply for a Campus Shop
            </Link>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="bg-navy py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center text-white mb-12">
            <div className="text-xs font-bold text-gold uppercase tracking-widest mb-3">Success Stories</div>
            <h2 className="text-4xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
              What Our Sellers Say
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map(t => (
              <div key={t.name} className="rounded-2xl border border-white/10 bg-white/5 p-7">
                <div className="flex mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-gold fill-gold" />
                  ))}
                </div>
                <p className="text-white/80 text-sm leading-relaxed mb-6 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center font-bold text-navy text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">{t.name}</div>
                    <div className="text-white/40 text-xs">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENEFITS ── */}
      <section className="bg-offwhite py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-navy mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
              Why Sellers Love Travex Mall
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {benefits.map(b => (
              <div key={b.title}
                className="rounded-2xl border border-gray-100 bg-white p-7 hover:shadow-md transition-all">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy/5 mb-5">
                  <b.icon className="h-6 w-6 text-navy" />
                </div>
                <h3 className="font-bold text-navy text-lg mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>{b.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-gold py-16 md:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-4xl font-black text-navy mb-4 md:text-5xl"
            style={{ fontFamily: 'Playfair Display, serif' }}>
            Open Your Shop Today
          </h2>
          <p className="text-navy/70 mb-8 max-w-xl mx-auto">
            Join {universities.length} universities and hundreds of sellers already growing on Travex Mall.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/campus-apply"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-navy px-8 py-4 font-bold text-white hover:bg-blue-900 transition-all">
              <GraduationCap className="h-5 w-5" /> Open Campus Shop — TZS 15,000/mo
            </Link>
            <Link href="/open-store-b2c"
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-navy px-8 py-4 font-bold text-navy hover:bg-navy hover:text-white transition-all">
              <Briefcase className="h-5 w-5" /> Open Business Shop
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
