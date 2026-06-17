'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { sb } from '@/lib/supabase'
import { universities } from '@/lib/data'
import {
  GraduationCap, Store, Wallet, Users, ArrowRight,
  FileText, ShieldCheck, Rocket, TrendingUp,
} from 'lucide-react'

const studentBenefits = [
  { icon: Wallet, title: 'Low Cost', desc: 'Just TZS 10,000/month to run a fully featured shop on campus.' },
  { icon: Users, title: 'Campus Reach', desc: 'Sell directly to thousands of students at your university.' },
  { icon: Store, title: 'Your Own Storefront', desc: 'Customizable shop page with products, branding and orders.' },
]

const steps = [
  { icon: FileText, title: 'Apply', desc: 'Pick your university and submit your shop application.' },
  { icon: ShieldCheck, title: 'Get Verified', desc: 'We confirm your student status and approve your slot.' },
  { icon: Rocket, title: 'Set Up Shop', desc: 'Add products, customize your storefront and go live.' },
  { icon: TrendingUp, title: 'Start Earning', desc: 'Receive WhatsApp orders and grow your campus business.' },
]

type UniStats = { abbr: string; count: number }

export default function CampusPage() {
  const [uniStats, setUniStats] = useState<UniStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      // Fetch real active store counts per university from Supabase
      const { data } = await sb
        .from('campus_stores')
        .select('university_abbr')
        .eq('is_active', true)

      if (data) {
        const counts: Record<string, number> = {}
        data.forEach((s: { university_abbr: string }) => {
          counts[s.university_abbr] = (counts[s.university_abbr] || 0) + 1
        })
        setUniStats(Object.entries(counts).map(([abbr, count]) => ({ abbr, count })))
      }
      setLoading(false)
    }
    loadStats()
  }, [])

  // Merge real counts with static university data
  const uniData = universities.map(uni => {
    const real = uniStats.find(s => s.abbr === uni.abbr)
    return {
      ...uni,
      activeShops: real ? real.count : 0,
      slotsLeft: uni.totalSlots - (real ? real.count : 0),
    }
  })

  const totalActive = uniData.reduce((sum, u) => sum + u.activeShops, 0)
  const totalSlots = uniData.reduce((sum, u) => sum + u.totalSlots, 0)
  const totalLeft = totalSlots - totalActive

  return (
    <main style={{ background: '#F8FAFF', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        .uni-card { transition: all 0.25s ease; }
        .uni-card:hover { transform: translateY(-4px); box-shadow: 0 14px 36px rgba(15,23,42,0.10) !important; border-color: #BFDBFE !important; }
        .benefit-card { transition: all 0.25s; }
        .benefit-card:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(15,23,42,0.08); }
        @media (max-width: 768px) {
          .hero-h1 { font-size: clamp(2rem, 8vw, 3rem) !important; }
          .uni-grid { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)) !important; }
        }
      `}</style>

      <SiteNav />

      {/* ══ HERO ══ */}
      <section style={{
        position: 'relative', overflow: 'hidden', color: '#fff', paddingTop: '64px',
        background: 'linear-gradient(160deg, #010510 0%, #030920 30%, #050E2E 60%, #071540 100%)',
      }}>
        <div style={{ position: 'absolute', top: '-25%', right: '-8%', width: '65%', height: '115%', pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(ellipse 55% 55% at 62% 28%, rgba(56,120,255,0.65) 0%, rgba(35,80,220,0.35) 30%, rgba(20,55,180,0.12) 55%, transparent 75%)', filter: 'blur(22px)' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '5rem 5% 4.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.35)', color: '#C9A84C', padding: '0.35rem 1rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '1.5rem' }}>
            <GraduationCap style={{ width: '14px', height: '14px' }} /> For University Students
          </div>
          <h1 className="hero-h1" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(2.4rem, 6vw, 4rem)', fontWeight: 900, lineHeight: 1.08, color: '#fff', marginBottom: '1rem', letterSpacing: '-0.01em' }}>
            Campus <span style={{ color: '#C9A84C' }}>Marketplace</span>
          </h1>
          <p style={{ fontSize: 'clamp(0.88rem, 1.8vw, 1.05rem)', lineHeight: 1.75, color: 'rgba(255,255,255,0.55)', marginBottom: '2.2rem', maxWidth: '520px' }}>
            Shop from verified student-run shops or open your own. Choose your university to browse.
          </p>

          {/* Live stats */}
          <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
            {[
              [loading ? '...' : String(uniData.length), 'Universities'],
              [loading ? '...' : String(totalActive), 'Active Shops'],
              [loading ? '...' : String(totalLeft), 'Slots Left'],
            ].map(([v, l]) => (
              <div key={l}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 900, color: '#C9A84C' }}>{v}</div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.38)', marginTop: '2px' }}>{l}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
            <Link href="/campus-apply" style={{ background: '#C9A84C', color: '#0F172A', padding: '0.9rem 2.2rem', borderRadius: '999px', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 8px 22px rgba(201,168,76,0.30)' }}>
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
        <div style={{ marginBottom: '0.4rem', fontSize: '0.68rem', fontWeight: 700, color: '#3B82F6', textTransform: 'uppercase', letterSpacing: '0.18em' }}>// Select Campus</div>
        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>Choose Your University</h2>
        <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '2.5rem' }}>Browse shops from your campus community. Slot counts are live from Supabase.</p>

        <div className="uni-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.25rem' }}>
          {uniData.map((uni) => {
            const pct = (uni.activeShops / uni.totalSlots) * 100
            return (
              <div key={uni.slug} className="uni-card" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '20px', padding: '1.5rem', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 18px rgba(15,23,42,0.05)' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', marginBottom: '1rem', flexShrink: 0, background: 'linear-gradient(135deg, #050B2E 0%, #0A1858 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(5,11,46,0.25)' }}>
                  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                    <rect width="36" height="36" rx="10" fill="url(#uniGrad)"/>
                    <defs>
                      <linearGradient id="uniGrad" x1="0" y1="0" x2="36" y2="36">
                        <stop offset="0%" stopColor="#0A1858"/>
                        <stop offset="100%" stopColor="#050B2E"/>
                      </linearGradient>
                    </defs>
                    <text x="18" y="23" textAnchor="middle" fontSize="11" fontWeight="900"
                      fontFamily="'Playfair Display', serif" fill="#C9A84C" letterSpacing="-0.5">
                      {uni.abbr}
                    </text>
                  </svg>
                </div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.2rem', lineHeight: 1.3 }}>{uni.name}</h3>
                <p style={{ fontSize: '0.78rem', color: '#94A3B8', marginBottom: '1rem' }}>{uni.city}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 600, color: '#374151' }}>{loading ? '...' : uni.activeShops} shops</span>
                  <span style={{ fontWeight: 600, color: uni.slotsLeft > 10 ? '#059669' : uni.slotsLeft > 0 ? '#D97706' : '#DC2626' }}>
                    {loading ? '...' : uni.slotsLeft > 0 ? `${uni.slotsLeft} slots left` : 'Full'}
                  </span>
                </div>
                <div style={{ height: '6px', background: '#F1F5F9', borderRadius: '999px', overflow: 'hidden', marginBottom: '1.25rem' }}>
                  <div style={{ height: '100%', width: loading ? '0%' : `${pct}%`, background: 'linear-gradient(90deg, #C9A84C, #F0C96B)', borderRadius: '999px', transition: 'width 0.6s ease' }} />
                </div>
                <Link href={`/campus/${uni.slug}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', background: '#050B2E', color: '#fff', borderRadius: '999px', padding: '0.7rem 1rem', fontSize: '0.84rem', fontWeight: 700, textDecoration: 'none', boxShadow: '0 6px 16px rgba(5,11,46,0.22)', marginTop: 'auto' }}>
                  Browse Shops <ArrowRight style={{ width: '14px', height: '14px' }} />
                </Link>
              </div>
            )
          })}
        </div>
      </section>

      {/* ══ BENEFITS ══ */}
      <section style={{ background: '#FFFFFF', padding: '5rem 5%', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#3B82F6', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '0.5rem' }}>// Why Choose Us</div>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800, color: '#0F172A' }}>Why Students Sell on Travex</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {studentBenefits.map((b) => (
              <div key={b.title} className="benefit-card" style={{ background: '#F8FAFF', border: '1px solid #E2E8F0', borderRadius: '20px', padding: '1.8rem', boxShadow: '0 2px 12px rgba(15,23,42,0.04)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(37,99,235,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <b.icon style={{ width: '22px', height: '22px', color: '#C9A84C' }} />
                </div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.4rem' }}>{b.title}</h3>
                <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.7 }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '5rem 5%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#3B82F6', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '0.5rem' }}>// Simple Process</div>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800, color: '#0F172A' }}>How Campus Market Works</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          {steps.map((step, i) => (
            <div key={step.title} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '20px', padding: '1.8rem', boxShadow: '0 4px 18px rgba(15,23,42,0.05)' }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', fontWeight: 900, color: 'rgba(201,168,76,0.22)', lineHeight: 1, marginBottom: '0.75rem' }}>0{i + 1}</div>
              <step.icon style={{ width: '26px', height: '26px', color: '#050B2E', marginBottom: '0.75rem' }} />
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.4rem' }}>{step.title}</h3>
              <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.65 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(160deg, #010510 0%, #050E2E 55%, #071540 100%)', padding: '5rem 5%', textAlign: 'center' }}>
        <div style={{ position: 'absolute', top: '-25%', right: '-8%', width: '55%', height: '120%', background: 'radial-gradient(ellipse 55% 55% at 65% 30%, rgba(56,120,255,0.40) 0%, transparent 70%)', filter: 'blur(30px)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '640px', margin: '0 auto' }}>
          <div style={{ display: 'inline-block', background: '#C9A84C', color: '#0F172A', padding: '0.35rem 1.2rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 700, marginBottom: '1.5rem' }}>
            Only 60 slots per university
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 900, color: '#fff', marginBottom: '1rem', lineHeight: 1.1 }}>
            Claim Your Spot Before It&apos;s Gone
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.92rem', lineHeight: 1.75, marginBottom: '2rem', maxWidth: '480px', margin: '0 auto 2rem' }}>
            Slots are limited to keep the marketplace exclusive and high quality.
          </p>
          <Link href="/campus-apply" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#C9A84C', color: '#0F172A', padding: '1rem 2.4rem', borderRadius: '999px', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none', boxShadow: '0 8px 24px rgba(201,168,76,0.35)' }}>
            Apply Now <ArrowRight style={{ width: '16px', height: '16px' }} />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
