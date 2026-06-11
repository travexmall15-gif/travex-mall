import Link from 'next/link'
import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { Particles } from '@/components/particles'
import { ShopCard } from '@/components/shop-card'
import { shops, universities } from '@/lib/data'
import {
  Store,
  GraduationCap,
  Briefcase,
  FileText,
  ShieldCheck,
  Rocket,
  TrendingUp,
  Sparkles,
  Heart,
  Zap,
  ArrowRight,
} from 'lucide-react'

const stats = [
  { value: '175+', label: 'Active Shops' },
  { value: '4', label: 'Universities' },
  { value: '12K+', label: 'Monthly Orders' },
  { value: '8', label: 'Cities' },
]

const steps = [
  { icon: FileText, title: 'Apply', desc: 'Submit your shop application with your details and student ID.' },
  { icon: ShieldCheck, title: 'Verify', desc: 'Our team reviews and verifies your application within 48 hours.' },
  { icon: Rocket, title: 'Launch', desc: 'Set up your storefront, add products and go live instantly.' },
  { icon: TrendingUp, title: 'Earn', desc: 'Receive orders, chat on WhatsApp and grow your revenue.' },
]

const benefits = [
  { icon: Zap, title: 'Instant WhatsApp Orders', desc: 'Customers order directly through WhatsApp — no complex checkout.' },
  { icon: Sparkles, title: 'Built-in AI Assistants', desc: 'AI helps with customer care, marketing plans and pricing.' },
  { icon: Heart, title: 'Social Vybe Feed', desc: 'Promote products on a campus social commerce feed and get discovered.' },
]

export default function HomePage() {
  return (
    <main className="bg-offwhite">
      <SiteNav />

      {/* Hero */}
      <section className="relative flex min-h-screen items-center overflow-hidden bg-navy pt-16 text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{ backgroundImage: 'url(/hero-marketplace.png)' }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-gradient-to-br from-navy via-navy/90 to-secondary/80"
          aria-hidden="true"
        />
        <Particles />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-20 md:px-6">
          <div className="max-w-3xl animate-fade-in-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-sm font-medium text-gold">
              <Sparkles className="h-4 w-4" /> Tanzania&apos;s #1 Digital
              Marketplace
            </span>
            <h1 className="mt-6 font-heading text-5xl font-black leading-tight tracking-tight text-balance md:text-7xl">
              Tanzania&apos;s <span className="text-gold">Digital</span>{' '}
              Marketplace
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/70 text-pretty">
              Shop, sell and connect across campuses and businesses. From your
              hostel to nationwide delivery — Travex Mall powers commerce for
              students and SMEs.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/campus"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-7 py-3.5 text-base font-semibold text-navy transition-all hover:bg-gold-light hover:shadow-lg"
              >
                <Store className="h-5 w-5" /> Browse Mall
              </Link>
              <Link
                href="/campus-apply"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/5 px-7 py-3.5 text-base font-semibold text-white backdrop-blur transition-all hover:bg-white/10"
              >
                Open Your Shop <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Two markets */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24">
        <div className="grid gap-6 md:grid-cols-2">
          <Link
            href="/campus"
            className="group relative overflow-hidden rounded-2xl bg-navy p-8 text-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl md:p-10"
          >
            <GraduationCap className="h-12 w-12 text-gold" />
            <h2 className="mt-5 font-heading text-3xl font-bold">
              Campus Market
            </h2>
            <p className="mt-1 text-sm font-medium uppercase tracking-wider text-gold">
              For University Students
            </p>
            <p className="mt-4 text-white/70">
              Shop, sell and connect within your campus. Run your own verified
              student shop with just TZS 15,000/month.
            </p>
            <span className="mt-6 inline-flex items-center gap-2 font-semibold text-gold">
              Explore Campus{' '}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>

          <Link
            href="/market"
            className="group relative overflow-hidden rounded-2xl bg-gold p-8 text-navy shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl md:p-10"
          >
            <Briefcase className="h-12 w-12 text-navy" />
            <h2 className="mt-5 font-heading text-3xl font-bold">
              Business Market
            </h2>
            <p className="mt-1 text-sm font-medium uppercase tracking-wider text-navy/70">
              For Businesses &amp; SMEs
            </p>
            <p className="mt-4 text-navy/80">
              Reach customers across Tanzania. List your products, manage orders
              and scale your business nationwide.
            </p>
            <span className="mt-6 inline-flex items-center gap-2 font-semibold text-navy">
              Explore Business{' '}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-navy py-12">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 md:grid-cols-4 md:px-6">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-heading text-4xl font-black text-gold md:text-5xl">
                {s.value}
              </p>
              <p className="mt-1 text-sm font-medium text-white/60">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-4xl font-bold text-navy text-balance">
            How It Works
          </h2>
          <p className="mt-3 text-muted-foreground">
            Launch your shop in four simple steps.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-4">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="relative rounded-xl border border-border bg-card p-6 text-center shadow-sm"
            >
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-3 py-0.5 text-xs font-bold text-navy">
                Step {i + 1}
              </span>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-navy/5">
                <step.icon className="h-7 w-7 text-navy" />
              </div>
              <h3 className="mt-4 font-heading text-xl font-bold text-navy">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured shops */}
      <section className="bg-white py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-heading text-4xl font-bold text-navy">
                Featured Shops
              </h2>
              <p className="mt-2 text-muted-foreground">
                Discover top-rated shops across campuses.
              </p>
            </div>
            <Link
              href="/campus"
              className="inline-flex items-center gap-1 font-semibold text-secondary hover:text-navy"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {shops.slice(0, 6).map((shop) => (
              <ShopCard key={shop.slug} shop={shop} />
            ))}
          </div>
        </div>
      </section>

      {/* Social Vybe preview */}
      <section className="bg-offwhite py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="overflow-hidden rounded-2xl bg-[#07010E] p-8 text-white md:p-12">
            <div className="grid items-center gap-8 md:grid-cols-2">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-3 py-1 text-sm font-medium text-gold">
                  <Sparkles className="h-4 w-4" /> Social Commerce
                </span>
                <h2 className="mt-4 font-heading text-4xl font-bold text-balance">
                  Social Vybe Feed
                </h2>
                <p className="mt-4 text-white/70 text-pretty">
                  A campus social commerce feed where shops post products,
                  customers like and discover, then order on WhatsApp instantly.
                </p>
                <Link
                  href="/vybe"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gold px-6 py-3 font-semibold text-navy transition-colors hover:bg-gold-light"
                >
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
                  <img
                    key={src}
                    src={src || '/placeholder.svg'}
                    alt="Vybe product"
                    className="aspect-square w-full rounded-lg object-cover"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-navy py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mx-auto max-w-2xl text-center text-white">
            <h2 className="font-heading text-4xl font-bold text-balance">
              Why Sellers Love Travex Mall
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="rounded-xl border border-white/10 bg-white/5 p-7 text-white backdrop-blur"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/15">
                  <b.icon className="h-6 w-6 text-gold" />
                </div>
                <h3 className="mt-5 font-heading text-xl font-bold">
                  {b.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">
                  {b.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gold py-16 md:py-20">
        <div className="mx-auto flex max-w-4xl flex-col items-center px-4 text-center md:px-6">
          <h2 className="font-heading text-4xl font-bold text-navy text-balance md:text-5xl">
            Open Your Shop Today
          </h2>
          <p className="mt-4 max-w-xl text-navy/80 text-pretty">
            Join {universities.length} universities and hundreds of sellers
            already growing on Travex Mall.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/campus-apply"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-navy px-8 py-3.5 font-semibold text-white transition-colors hover:bg-secondary"
            >
              <GraduationCap className="h-5 w-5" /> Open Campus Shop
            </Link>
            <Link
              href="/open-store-b2c"
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-navy px-8 py-3.5 font-semibold text-navy transition-colors hover:bg-navy hover:text-white"
            >
              <Briefcase className="h-5 w-5" /> Open Business Store
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
