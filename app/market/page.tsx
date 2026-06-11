import Link from 'next/link'
import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import {
  Store, ShieldCheck, TrendingUp, Zap, Users, Globe,
  ArrowRight, Briefcase, Package, Star
} from 'lucide-react'

const categories = [
  { icon: '👗', name: 'Fashion & Clothing', count: 24 },
  { icon: '📱', name: 'Electronics', count: 18 },
  { icon: '🍔', name: 'Food & Groceries', count: 31 },
  { icon: '💄', name: 'Beauty & Health', count: 22 },
  { icon: '🔧', name: 'Services', count: 15 },
  { icon: '🌾', name: 'Agriculture', count: 9 },
]

const plans = [
  {
    name: 'B2C Basic',
    price: 'TZS 25,000',
    period: '/month',
    desc: 'For individual sellers',
    features: ['1 shop page', 'Unlimited products', 'WhatsApp orders', 'AI Customer Care', 'Social Vybe posting'],
    cta: '/open-store-b2c',
    highlight: false,
  },
  {
    name: 'B2C Premium',
    price: 'TZS 45,000',
    period: '/month',
    desc: 'For growing sellers',
    features: ['Everything in Basic', 'Priority listing', 'Marketing AI tools', 'Accounting dashboard', 'Leaderboard ranking'],
    cta: '/open-store-b2c',
    highlight: true,
  },
  {
    name: 'B2B Basic',
    price: 'TZS 75,000',
    period: '/month',
    desc: 'For businesses',
    features: ['Business verification', 'Multiple products', 'Bulk order management', 'Business analytics', 'Dedicated support'],
    cta: '/open-store-b2b',
    highlight: false,
  },
  {
    name: 'B2B Premium',
    price: 'TZS 110,000',
    period: '/month',
    desc: 'For large businesses',
    features: ['Everything in B2B Basic', 'Featured placement', 'API access', 'Custom branding', 'Account manager'],
    cta: '/open-store-b2b',
    highlight: false,
  },
]

const benefits = [
  { icon: Globe, title: 'Nationwide Reach', desc: 'Reach customers across all 8 regions of Tanzania.' },
  { icon: Zap, title: 'WhatsApp Orders', desc: 'Customers order via WhatsApp — no complex checkout.' },
  { icon: Zap, title: 'AI Tools', desc: 'Built-in AI for customer care, marketing and pricing.' },
  { icon: ShieldCheck, title: 'Verified Badge', desc: 'Get a verified badge to build customer trust.' },
  { icon: TrendingUp, title: 'Analytics', desc: 'Track revenue, orders and growth in real-time.' },
  { icon: Users, title: 'Community', desc: 'Join thousands of sellers already growing on Travex.' },
]

export default function MarketPage() {
  return (
    <main className="bg-offwhite min-h-screen">
      <SiteNav />

      {/* Hero */}
      <section className="relative bg-navy pt-16 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'url(/business-market-hero.png)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy/90 to-blue-900/80" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 md:py-28">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-sm font-semibold text-gold mb-6">
              <Briefcase className="h-4 w-4" /> Business Marketplace
            </span>
            <h1 className="font-heading text-5xl font-black leading-tight md:text-6xl mb-6"
              style={{ fontFamily: 'Playfair Display, serif' }}>
              Grow Your Business <span className="text-gold">Across Tanzania</span>
            </h1>
            <p className="text-lg text-white/70 mb-8 max-w-2xl">
              List your products, reach customers nationwide, manage orders and scale your business — all from one platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/open-store-b2c"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-7 py-3.5 text-base font-bold text-navy hover:bg-gold-light transition-all">
                <Store className="h-5 w-5" /> Open B2C Shop
              </Link>
              <Link href="/open-store-b2b"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/5 px-7 py-3.5 text-base font-semibold text-white hover:bg-white/10 transition-all">
                <Briefcase className="h-5 w-5" /> Open B2B Shop <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-navy py-10">
        <div className="mx-auto max-w-7xl px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[['500+','Active Sellers'],['8','Regions'],['50K+','Monthly Orders'],['4.8★','Avg Rating']].map(([v,l]) => (
            <div key={l} className="text-center">
              <div className="text-3xl font-black text-gold" style={{ fontFamily: 'Playfair Display, serif' }}>{v}</div>
              <div className="text-sm text-white/50 mt-1">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-navy mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Browse Categories</h2>
          <p className="text-gray-500">Find products and services across Tanzania</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {categories.map(cat => (
            <div key={cat.name}
              className="bg-white rounded-xl p-5 text-center border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer">
              <div className="text-3xl mb-2">{cat.icon}</div>
              <div className="text-sm font-bold text-navy">{cat.name}</div>
              <div className="text-xs text-gray-400 mt-1">{cat.count} shops</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Choose Your Plan</h2>
            <p className="text-gray-500">Start selling in minutes — no setup fees</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map(plan => (
              <div key={plan.name}
                className={`rounded-2xl p-6 border-2 transition-all hover:-translate-y-1 hover:shadow-lg ${plan.highlight ? 'border-gold bg-navy text-white' : 'border-gray-100 bg-white'}`}>
                {plan.highlight && (
                  <div className="text-xs font-bold text-navy bg-gold px-3 py-1 rounded-full inline-block mb-4">Most Popular</div>
                )}
                <div className={`text-sm font-semibold mb-1 ${plan.highlight ? 'text-gold' : 'text-gray-500'}`}>{plan.desc}</div>
                <div className={`text-2xl font-black mb-1 ${plan.highlight ? 'text-white' : 'text-navy'}`}
                  style={{ fontFamily: 'Playfair Display, serif' }}>{plan.price}</div>
                <div className={`text-sm mb-4 ${plan.highlight ? 'text-white/50' : 'text-gray-400'}`}>{plan.period}</div>
                <div className={`text-lg font-bold mb-4 ${plan.highlight ? 'text-white' : 'text-navy'}`}>{plan.name}</div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className={`flex items-center gap-2 text-sm ${plan.highlight ? 'text-white/80' : 'text-gray-600'}`}>
                      <ShieldCheck className="h-4 w-4 flex-shrink-0 text-gold" /> {f}
                    </li>
                  ))}
                </ul>
                <Link href={plan.cta}
                  className={`block text-center py-3 rounded-xl font-bold text-sm transition-all ${plan.highlight ? 'bg-gold text-navy hover:bg-gold-light' : 'bg-navy text-white hover:bg-blue-900'}`}>
                  Get Started →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-navy py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center text-white mb-12">
            <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Why Sell on Travex Business Market?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {benefits.map(b => (
              <div key={b.title} className="rounded-xl border border-white/10 bg-white/5 p-6">
                <div className="w-12 h-12 rounded-xl bg-gold/15 flex items-center justify-center mb-4">
                  <b.icon className="h-6 w-6 text-gold" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{b.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gold py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-4xl font-black text-navy mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Ready to Start Selling?
          </h2>
          <p className="text-navy/70 mb-8">Join thousands of sellers growing their business on Travex Mall.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/open-store-b2c"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-navy px-8 py-4 font-bold text-white hover:bg-blue-900 transition-all">
              <Package className="h-5 w-5" /> Open B2C Shop — TZS 25,000/mo
            </Link>
            <Link href="/open-store-b2b"
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-navy px-8 py-4 font-bold text-navy hover:bg-navy hover:text-white transition-all">
              <Briefcase className="h-5 w-5" /> Open B2B Shop — TZS 75,000/mo
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
