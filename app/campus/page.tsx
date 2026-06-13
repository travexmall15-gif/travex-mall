'use client'

import Link from 'next/link'
import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { universities } from '@/lib/data'
import {
  GraduationCap, Store, Wallet, Users, ArrowRight,
  FileText, ShieldCheck, Rocket, TrendingUp,
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
    <main style={{ background: '#EEF1F8', overflowX: 'hidden' }}>
      
      <style>{`
        .uni-card-hover { transition: all 0.25s ease; }
        .uni-card-hover:hover { transform: translateY(-4px); box-shadow: 0 14px 36px rgba(13,27,62,0.10) !important; }
      `}</style>
      <SiteNav />

      {/* ══ HERO ══ */}
      <section style={{
        position: 'relative', overflow: 'hidden', paddingTop: '64px', color: '#fff',
        background: 'linear-gradient(150deg, #080F24 0%, #0D1B3E 50%, #16306B 100%)',
      }}>
        {/* Beam */}
        <div style={{
          position: 'absolute', inset: '-30%', pointerEvents: 'none', zIndex: 0,
          background: 'linear-gradient(112deg, transparent 30%, rgba(66,99,235,0.28) 46%, rgba(201,168,76,0.14) 56%, transparent 72%)',
          filter: 'blur(48px)',
        }} />
        {/* Grid */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.05,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }} />
        {/* BG image */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(/campus-hero.png)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.12, zIndex: 0 }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '5rem 5% 4.5rem' }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.35)', color: '#C9A84C', padding: '0.35rem 1rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '1.5rem' }}>
            <GraduationCap style={{ width: '14px', height: '14px' }} /> For University Students
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(2.4rem,6vw,4rem)', fontWeight: 900, lineHeight: 1.08, color: '#fff', marginBottom: '1rem', letterSpacing: '-0.01em' }}>
            Campus <span style={{ color: '#C9A84C' }}>Marketplace</span>
          </h1>
          <p style={{ fontSize: 'clamp(0.88rem,1.8vw,1.05rem)', lineHeight: 1.75, color: 'rgba(255,255,255,0.65)', marginBottom: '2.2rem', maxWidth: '520px' }}>
            Shop from verified student-run shops or open your own. Choose your university to get started.
          </p>
          {/* Stats */}
          <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
            {[['4', 'Universities'], ['155', 'Active Shops'], ['85', 'Slots Left']].map(([v, l]) => (
              <div key={l}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 900, color: '#C9A84C' }}>{v}</div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)', marginTop: '2px' }}>{l}</div>
              </div>
            ))}
          </div>
          {/* CTAs */}
          <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
            <Link href="/campus-apply" style={{ background: '#C9A84C', color: '#0D1B3E', padding: '0.9rem 2.2rem', borderRadius: '999px', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 8px 22px rgba(201,168,76,0.30)' }}>
              Open Your Shop →
            </Link>
            <Link href="#universities" style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.22)', padding: '0.9rem 2.2rem', borderRadius: '999px', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>
              Browse Universities
            </Link>
          </div>
        </div>
      </section>

      {/* ══ UNIVERSITY GRID ══ */}
      <section id="universities" style={{ maxWidth: '1200px', margin: '0 auto', padding: '5rem 5%' }}>
        <div style={{ marginBottom: '0.4rem', fontSize: '0.68rem', fontWeight: 700, color: '#C9A84C', textTransform: 'uppercase', letterSpacing: '0.18em' }}>// Select Campus</div>
        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(1.5rem,3vw,2.2rem)', fontWeight: 800, color: '#0D1B3E', marginBottom: '0.5rem' }}>Choose Your University</h2>
        <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '2.5rem' }}>Browse shops from your campus community.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {universities.map((uni) => {
            const slotsLeft = uni.totalSlots - uni.activeShops
            const pct = (uni.activeShops / uni.totalSlots) * 100
            return (
              <div key={uni.slug} style={{ background: '#fff', border: '1px solid #E9ECF3', borderRadius: '20px', padding: '1.5rem', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 18px rgba(13,27,62,0.05)', transition: 'all 0.25s' }}
                className="uni-card-hover" 
              >
                {/* Abbr badge */}
                <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg, #0D1B3E, #1B3A6B)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Playfair Display', serif", fontSize: '1rem', fontWeight: 900, color: '#C9A84C', marginBottom: '1rem' }}>
                  {uni.abbr}
                </div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1rem', fontWeight: 700, color: '#0D1B3E', marginBottom: '0.2rem', lineHeight: 1.3 }}>{uni.name}</h3>
                <p style={{ fontSize: '0.78rem', color: '#94A3B8', marginBottom: '1rem' }}>{uni.city}</p>
                {/* Slots */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 600, color: '#374151' }}>{uni.activeShops} shops</span>
                  <span style={{ fontWeight: 600, color: slotsLeft > 0 ? '#059669' : '#DC2626' }}>{slotsLeft > 0 ? `${slotsLeft} slots left` : 'Full'}</span>
                </div>
                {/* Progress */}
                <div style={{ height: '6px', background: '#F3F4F6', borderRadius: '999px', overflow: 'hidden', marginBottom: '1.25rem' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #C9A84C, #F0C96B)', borderRadius: '999px' }} />
                </div>
                <Link href={`/campus/${uni.slug}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', background: '#0D1B3E', color: '#fff', borderRadius: '999px', padding: '0.7rem 1rem', fontSize: '0.84rem', fontWeight: 700, textDecoration: 'none', boxShadow: '0 6px 16px rgba(13,27,62,0.22)', transition: 'all 0.2s', marginTop: 'auto' }}>
                  Browse Shops <ArrowRight style={{ width: '14px', height: '14px' }} />
                </Link>
              </div>
            )
          })}
        </div>
      </section>

      {/* ══ BENEFITS ══ */}
      <section style={{ background: '#fff', padding: '5rem 5%', borderTop: '1px solid #E9ECF3', borderBottom: '1px solid #E9ECF3' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#C9A84C', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '0.5rem' }}>// Why Choose Us</div>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(1.5rem,3vw,2.2rem)', fontWeight: 800, color: '#0D1B3E' }}>Why Students Sell on Travex Mall</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {studentBenefits.map((b) => (
              <div key={b.title} style={{ background: '#EEF1F8', border: '1px solid #E9ECF3', borderRadius: '20px', padding: '1.8rem', boxShadow: '0 2px 12px rgba(55,83,160,0.055)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(201,168,76,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <b.icon style={{ width: '22px', height: '22px', color: '#C9A84C' }} />
                </div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 700, color: '#0D1B3E', marginBottom: '0.5rem' }}>{b.title}</h3>
                <p style={{ fontSize: '0.84rem', color: '#64748B', lineHeight: 1.7 }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '5rem 5%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#C9A84C', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '0.5rem' }}>// Simple Process</div>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(1.5rem,3vw,2.2rem)', fontWeight: 800, color: '#0D1B3E' }}>How Campus Market Works</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          {steps.map((step, i) => (
            <div key={step.title} style={{ background: '#fff', border: '1px solid #E9ECF3', borderRadius: '20px', padding: '1.8rem', boxShadow: '0 4px 18px rgba(13,27,62,0.05)', position: 'relative' }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', fontWeight: 900, color: 'rgba(201,168,76,0.20)', lineHeight: 1, marginBottom: '0.75rem' }}>0{i + 1}</div>
              <step.icon style={{ width: '26px', height: '26px', color: '#0D1B3E', marginBottom: '0.75rem' }} />
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.05rem', fontWeight: 700, color: '#0D1B3E', marginBottom: '0.4rem' }}>{step.title}</h3>
              <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.65 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ CTA BANNER ══ */}
      <section style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(150deg, #080F24 0%, #0D1B3E 55%, #16306B 100%)', padding: '5rem 5%', textAlign: 'center' }}>
        <div style={{ position: 'absolute', inset: '-30%', pointerEvents: 'none', background: 'linear-gradient(112deg, transparent 30%, rgba(201,168,76,0.10) 50%, transparent 70%)', filter: 'blur(48px)' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '640px', margin: '0 auto' }}>
          <div style={{ display: 'inline-block', background: '#C9A84C', color: '#0D1B3E', padding: '0.35rem 1.2rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 700, marginBottom: '1.5rem' }}>Only 60 slots per university</div>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 900, color: '#fff', marginBottom: '1rem', lineHeight: 1.1 }}>Claim Your Spot Before It&apos;s Gone</h2>
          <p style={{ color: 'rgba(255,255,255,0.60)', fontSize: '0.95rem', lineHeight: 1.75, marginBottom: '2rem', maxWidth: '480px', margin: '0 auto 2rem' }}>Slots are limited to keep the marketplace exclusive and high quality. Apply now to secure your campus shop.</p>
          <Link href="/campus-apply" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#C9A84C', color: '#0D1B3E', padding: '1rem 2.4rem', borderRadius: '999px', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none', boxShadow: '0 8px 24px rgba(201,168,76,0.35)' }}>
            Apply Now <ArrowRight style={{ width: '16px', height: '16px' }} />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
