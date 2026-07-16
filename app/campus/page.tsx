'use client'
import { T } from '@/components/T'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { sb } from '@/lib/supabase'
import { universities } from '@/lib/data'
import { GraduationCap, ArrowRight, Search } from 'lucide-react'

type UniStats = { abbr: string; count: number }

const CAMPUS_CATEGORIES = [
  'All', 'Fashion & Clothing', 'Food & Drinks', 'Electronics',
  'Beauty & Health', 'Books & Stationery', 'Services', 'Arts & Crafts',
]

export default function CampusPage() {
  const [uniStats, setUniStats] = useState<UniStats[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [selectedUni, setSelectedUni] = useState('All')

  useEffect(() => {
    async function loadStats() {
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
  const totalLeft  = totalSlots - totalActive

  const uniOptions = ['All', ...uniData.map(u => u.abbr)]
  const filteredUnis = uniData.filter(u =>
    (selectedUni === 'All' || u.abbr === selectedUni) &&
    (!search || u.name.toLowerCase().includes(search.toLowerCase()) || u.abbr.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <main style={{ background: '#F8FAFF', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        @keyframes campusTicker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        .campus-ticker { animation: campusTicker 32s linear infinite; will-change: transform; }
        .campus-ticker:hover { animation-play-state: paused; }
        @keyframes campusStats { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        .campus-stats-ticker { animation: campusStats 28s linear infinite; will-change: transform; }
        .campus-stats-ticker:hover { animation-play-state: paused; }
        .uni-card { transition: transform 0.2s, box-shadow 0.2s; }
        .uni-card:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(15,23,42,0.10) !important; }
      `}</style>

      <SiteNav />

      {/* ── HERO ── */}
      <section style={{
        position: 'relative', overflow: 'hidden', paddingTop: '64px', color: '#fff',
        background: 'linear-gradient(160deg, #010510 0%, #030920 35%, #050E2E 65%, #071540 100%)',
      }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 55% 70% at 85% 20%, rgba(56,120,255,0.32) 0%, transparent 65%)', zIndex: 0 }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '3rem 5% 0' }}>

          {/* Top row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)', padding: '4px 12px', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.06em' }}>
              <GraduationCap size={12} /> <T en="Campus Market" sw="Soko la Vyuo" />
            </div>
            <Link href="/campus-apply" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#C9A84C', color: '#0F172A', padding: '8px 18px', borderRadius: '999px', fontWeight: 700, fontSize: '0.8rem', textDecoration: 'none', boxShadow: '0 4px 14px rgba(201,168,76,0.28)' }}>
              <GraduationCap size={13} /> <T en="Open Your Shop" sw="Fungua Duka Lako" />
            </Link>
          </div>

          {/* Headline */}
          <div style={{ maxWidth: '560px', marginBottom: '2rem' }}>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem, 4.5vw, 3.4rem)', fontWeight: 900, color: '#fff', lineHeight: 1.08, marginBottom: '0.85rem', letterSpacing: '-0.01em' }}>
              <span style={{ color: '#C9A84C' }}><T en="Campus" sw="Vyuo" /></span> <T en="Marketplace." sw="Soko." />
            </h1>
            <p style={{ fontSize: 'clamp(0.82rem,1.5vw,0.92rem)', color: 'rgba(255,255,255,0.45)', lineHeight: 1.8, maxWidth: '440px' }}>
              <T en="Buy and sell within your university community." sw="Nunua na uza ndani ya jamii ya chuo chako." /> Verified student sellers. {loading ? '...' : totalActive} <T en="active shops" sw="maduka yanayofanya kazi" /> across {uniData.length} universities.
            </p>
          </div>

          {/* Plan pill */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fff', borderRadius: '12px', padding: '10px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.14)' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#059669' }} />
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0F172A', lineHeight: 1 }}>Student Plan</div>
                <div style={{ fontSize: '0.63rem', color: '#64748B', marginTop: '2px' }}>TZS 10,000 / month</div>
              </div>
            </div>
          </div>

          {/* Stats ticker — RTL */}
          <div style={{ overflow: 'hidden', paddingBottom: '1.75rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="campus-stats-ticker" style={{ display: 'flex', gap: '0', width: 'max-content' }}>
              {[
                ...uniData.map(u => ({ val: loading ? '...' : String(u.slotsLeft), label: `${u.abbr} Slots Left`, color: u.slotsLeft > 10 ? '#86EFAC' : '#FCA5A5' })),
                { val: loading ? '...' : String(totalLeft), label: 'Total Slots Left', color: '#C9A84C' },
                { val: loading ? '...' : String(totalActive), label: 'Active Shops', color: 'rgba(255,255,255,0.6)' },
                ...uniData.map(u => ({ val: loading ? '...' : String(u.slotsLeft), label: `${u.abbr} Slots Left`, color: u.slotsLeft > 10 ? '#86EFAC' : '#FCA5A5' })),
                { val: loading ? '...' : String(totalLeft), label: 'Total Slots Left', color: '#C9A84C' },
                { val: loading ? '...' : String(totalActive), label: 'Active Shops', color: 'rgba(255,255,255,0.6)' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', paddingRight: '2.5rem' }}>
                  <div style={{ paddingRight: '2.5rem', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontSize: 'clamp(0.9rem,2vw,1.1rem)', fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: '3px' }}>{s.val}</div>
                    <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', whiteSpace: 'nowrap' as const }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── QUICK TICKER ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <div style={{ padding: '10px 0' }}>
          <div className="campus-ticker" style={{ display: 'flex', gap: '8px', width: 'max-content', paddingLeft: '24px' }}>
            {[
              { href: '/market', label: 'Business Market', sub: '500+ Shops', bg: '#FEF3C7', border: '#FCD34D', color: '#92400E' },
              { href: '/flash-deals', label: 'Flash Deals', sub: 'Limited Time', bg: '#DBEAFE', border: '#93C5FD', color: '#1E40AF' },
              { href: '/group-buy', label: 'Group Buy', sub: 'Save Together', bg: '#EDE9FE', border: '#C4B5FD', color: '#5B21B6' },
              { href: '/vybe', label: 'Social Vybe', sub: 'Community', bg: '#ECFDF5', border: '#6EE7B7', color: '#065F46' },
              { href: '/market', label: 'Business Market', sub: '500+ Shops', bg: '#FEF3C7', border: '#FCD34D', color: '#92400E' },
              { href: '/flash-deals', label: 'Flash Deals', sub: 'Limited Time', bg: '#DBEAFE', border: '#93C5FD', color: '#1E40AF' },
              { href: '/group-buy', label: 'Group Buy', sub: 'Save Together', bg: '#EDE9FE', border: '#C4B5FD', color: '#5B21B6' },
              { href: '/vybe', label: 'Social Vybe', sub: 'Community', bg: '#ECFDF5', border: '#6EE7B7', color: '#065F46' },
            ].map((c, i) => (
              <a key={i} href={c.href} style={{ display: 'inline-flex', flexDirection: 'column' as const, gap: '1px', background: c.bg, border: `1px solid ${c.border}`, color: c.color, padding: '6px 14px', borderRadius: '10px', textDecoration: 'none', whiteSpace: 'nowrap' as const, flexShrink: 0, transition: 'opacity 0.2s' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{c.label}</span>
                <span style={{ fontSize: '0.58rem', opacity: 0.7 }}>{c.sub}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── SEARCH + FILTERS + UNIVERSITY CARDS ── */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 5% 2rem' }}>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '1rem' }}>
          <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search / Tafuta..."
            style={{ width: '100%', paddingLeft: '2.75rem', paddingRight: '1rem', paddingTop: '0.75rem', paddingBottom: '0.75rem', border: '1.5px solid #E2E8F0', borderRadius: '12px', fontSize: '0.88rem', outline: 'none', fontFamily: "'Inter', sans-serif", background: '#fff', boxShadow: '0 1px 4px rgba(15,23,42,0.05)', transition: 'border-color 0.2s' }}
            onFocus={e => (e.target.style.borderColor = '#0D1B3E')}
            onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
          />
        </div>

        {/* University filter */}
        <div style={{ marginBottom: '0.75rem', overflowX: 'auto', scrollbarWidth: 'none' as const }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingBottom: '2px', minWidth: 'max-content' }}>
            <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' as const, letterSpacing: '0.08em', flexShrink: 0, minWidth: '52px' }}>University</span>
            {uniOptions.map(u => (
              <button key={u} onClick={() => setSelectedUni(u)} style={{ padding: '5px 14px', borderRadius: '8px', border: '1.5px solid', borderColor: selectedUni === u ? '#0D1B3E' : '#E2E8F0', background: selectedUni === u ? '#0D1B3E' : '#fff', color: selectedUni === u ? '#fff' : '#475569', fontSize: '0.74rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' as const, flexShrink: 0, transition: 'all 0.15s' }}>
                {u}
              </button>
            ))}
          </div>
        </div>



        {/* Results count */}
        <div style={{ fontSize: '0.76rem', color: '#94A3B8', marginBottom: '1.25rem' }}>
          {filteredUnis.length} {filteredUnis.length === 1 ? 'university' : 'universities'} found
        </div>

        {/* University cards — horizontal auto-scroll */}
        <style>{`
          @keyframes uniScroll { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
          .uni-scroll-track { animation: uniScroll 40s linear infinite; will-change: transform; }
          .uni-scroll-track:hover { animation-play-state: paused; }
          .uni-card:hover { transform: translateY(-3px) !important; box-shadow: 0 12px 28px rgba(15,23,42,0.12) !important; }
        `}</style>
        <div style={{ overflow: 'hidden' }}>
          <div className="uni-scroll-track" style={{ display: 'flex', gap: '12px', width: 'max-content' }}>
            {[...filteredUnis, ...filteredUnis].map((uni, idx) => {
              const pct = Math.min((uni.activeShops / uni.totalSlots) * 100, 100)
              return (
                <div key={`${uni.slug}-${idx}`} className="uni-card" style={{ background: '#fff', border: `1.5px solid ${uni.color}25`, borderRadius: '16px', overflow: 'hidden', boxShadow: `0 2px 10px ${uni.color}14`, cursor: 'pointer', flexShrink: 0, width: '170px', transition: 'all 0.2s' }}>
                  {/* Banner */}
                  <div style={{ height: '68px', background: uni.bgGradient, position: 'relative', display: 'flex', alignItems: 'center', padding: '0 0.85rem' }}>
                    <div>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.05rem', fontWeight: 900, color: uni.color, letterSpacing: '0.04em', lineHeight: 1 }}>{uni.abbr}</div>
                      <div style={{ fontSize: '0.56rem', color: uni.color, opacity: 0.6, marginTop: '2px' }}>{uni.city}</div>
                    </div>
                    <div style={{ position: 'absolute', top: '6px', right: '7px', background: uni.slotsLeft > 0 ? 'rgba(5,150,105,0.15)' : 'rgba(220,38,38,0.12)', color: uni.slotsLeft > 0 ? '#059669' : '#DC2626', fontSize: '0.5rem', fontWeight: 800, padding: '2px 6px', borderRadius: '999px' }}>
                      {uni.slotsLeft > 0 ? `${loading ? '...' : uni.slotsLeft} left` : 'Full'}
                    </div>
                  </div>
                  {/* Body */}
                  <div style={{ padding: '0.6rem 0.7rem 0.7rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.72rem', color: '#0F172A', marginBottom: '0.25rem', lineHeight: 1.2 }}>{uni.name}</div>
                    <div style={{ fontSize: '0.6rem', color: '#94A3B8', marginBottom: '0.45rem' }}>{loading ? '...' : uni.activeShops} active shops</div>
                    <div style={{ height: '3px', background: '#F1F5F9', borderRadius: '999px', overflow: 'hidden', marginBottom: '0.55rem' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${uni.color}, ${uni.color}88)`, borderRadius: '999px' }} />
                    </div>
                    <Link href={`/campus/${uni.slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '3px 10px', background: uni.bgGradient, color: uni.color, border: `1px solid ${uni.color}35`, borderRadius: '6px', fontSize: '0.62rem', fontWeight: 700, textDecoration: 'none' }}>
                      Browse <ArrowRight size={9} />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
