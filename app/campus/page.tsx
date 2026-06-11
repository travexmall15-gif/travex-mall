import Link from 'next/link'
import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { universities } from '@/lib/data'
import {
  GraduationCap,
  Store,
  Wallet,
  Users,
  ArrowRight,
  FileText,
  ShieldCheck,
  Rocket,
  TrendingUp,
} from 'lucide-react'

const studentBenefits = [
  { icon: Wallet, title: 'Low Cost', desc: 'Just TZS 15,000/month to run a fully featured shop on campus.' },
  { icon: Users, title: 'Campus Reach', desc: 'Sell directly to thousands of students at your university.' },
  { icon: Store, title: 'Your Own Storefront', desc: 'Customizable shop page with products, branding and orders.' },
]

const steps = [
  { icon: FileText, title: 'Apply', desc: 'Pick your university and submit your shop application.' },
  { icon: ShieldCheck, title: 'Get Verified', desc: 'We confirm your student status and approve your slot.' },
  { icon: Rocket, title: 'Set Up Shop', desc: 'Add products, customize your storefront and go live.' },
  { icon: TrendingUp, title: 'Start Earning', desc: 'Receive WhatsApp orders and grow your campus business.' },
]

export default function CampusPage() {
  return (
    <main className="bg-offwhite">
      <SiteNav />

      {/* Hero */}
      <section className="relative overflow-hidden bg-navy pt-16 text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{ backgroundImage: 'url(/campus-hero.png)' }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/90 to-transparent" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 md:px-6 md:py-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-sm font-medium text-gold">
            <GraduationCap className="h-4 w-4" /> For University Students
          </span>
          <h1 className="mt-5 font-heading text-5xl font-black text-balance md:text-6xl">
            Campus Marketplace
          </h1>
          <p className="mt-4 max-w-xl text-lg text-white/70 text-pretty">
            Shop from verified student-run shops or open your own. Choose your
            university to get started.
          </p>
          <div className="mt-8 flex flex-wrap gap-8">
            {[
              { value: '4', label: 'Universities' },
              { value: '155', label: 'Active Shops' },
              { value: '85', label: 'Slots Left' },
            ].map((s) => (
              <div key={s.label}>
                <p style={{  fontFamily: "'Playfair Display', serif" , fontFamily: "Playfair Display, serif" }} className="font-heading_unused text-3xl font-black text-gold">
                  {s.value}
                </p>
                <p className="text-sm text-white/60">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* University grid */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
        <h2 style={{  fontFamily: "'Playfair Display', serif" , fontFamily: "Playfair Display, serif" }} className="font-heading_unused text-3xl font-bold text-navy">
          Select Your University
        </h2>
        <p className="mt-2 text-muted-foreground">
          Browse shops from your campus community.
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {universities.map((uni) => {
            const slotsLeft = uni.totalSlots - uni.activeShops
            return (
              <div
                key={uni.slug}
                className="flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-navy font-heading text-xl font-black text-gold">
                  {uni.abbr}
                </div>
                <h3 className="mt-4 font-heading text-lg font-bold leading-snug text-navy">
                  {uni.name}
                </h3>
                <p className="text-sm text-muted-foreground">{uni.city}</p>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="font-medium text-ink">
                    {uni.activeShops} shops
                  </span>
                  <span
                    className={
                      slotsLeft > 0
                        ? 'font-medium text-success'
                        : 'font-medium text-destructive'
                    }
                  >
                    {slotsLeft > 0 ? `${slotsLeft} slots left` : 'Full'}
                  </span>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-navy/5">
                  <div
                    className="h-full rounded-full bg-gold"
                    style={{
                      width: `${(uni.activeShops / uni.totalSlots) * 100}%`,
                    }}
                  />
                </div>
                <Link
                  href={`/campus/${uni.slug}`}
                  className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-secondary"
                >
                  Browse Shops <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )
          })}
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <h2 className="text-center font-heading text-3xl font-bold text-navy text-balance">
            Why Students Sell on Travex Mall
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {studentBenefits.map((b) => (
              <div
                key={b.title}
                className="rounded-xl border border-border bg-offwhite p-7 shadow-sm"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/15">
                  <b.icon className="h-6 w-6 text-gold" />
                </div>
                <h3 className="mt-5 font-heading text-xl font-bold text-navy">
                  {b.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {b.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
        <h2 className="text-center font-heading text-3xl font-bold text-navy text-balance">
          How Campus Market Works
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-4">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="relative rounded-xl border border-border bg-card p-6 shadow-sm"
            >
              <span style={{  fontFamily: "'Playfair Display', serif" , fontFamily: "Playfair Display, serif" }} className="font-heading_unused text-4xl font-black text-gold/30">
                0{i + 1}
              </span>
              <step.icon className="mt-2 h-7 w-7 text-navy" />
              <h3 className="mt-3 font-heading text-lg font-bold text-navy">
                {step.title}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Apply CTA */}
      <section className="bg-navy py-16 md:py-20">
        <div className="mx-auto flex max-w-3xl flex-col items-center px-4 text-center text-white md:px-6">
          <span className="rounded-full bg-gold px-4 py-1 text-sm font-bold text-navy">
            Only 60 slots per university
          </span>
          <h2 className="mt-5 font-heading text-4xl font-bold text-balance">
            Claim Your Spot Before It&apos;s Gone
          </h2>
          <p className="mt-4 max-w-xl text-white/70 text-pretty">
            Slots are limited to keep the marketplace exclusive and high quality.
            Apply now to secure your campus shop.
          </p>
          <Link
            href="/campus-apply"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gold px-8 py-3.5 font-semibold text-navy transition-colors hover:bg-gold-light"
          >
            Apply Now <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
