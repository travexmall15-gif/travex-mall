'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { sb } from '@/lib/supabase'
import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { Users, Clock, Search, Loader2 } from 'lucide-react'

type Group = {
  id: string
  store_id: string | null
  shop_name: string | null
  product_name: string | null
  unit_price: number | null
  discount_pct: number | null
  min_members: number | null
  current_members: number | null
  expires_at: string | null
  status: string | null
  category: string | null
  description: string | null
}

const fmt = (n: number) => 'TZS ' + Number(n).toLocaleString('en-US')

function timeLeft(exp: string | null) {
  if (!exp) return 'Ongoing'
  const diff = new Date(exp).getTime() - Date.now()
  if (diff <= 0) return 'Expired'
  const h = Math.floor(diff / 3600000)
  if (h < 24) return `${h}h left`
  return `${Math.floor(h / 24)}d left`
}

function GroupCard({ group }: { group: Group }) {
  const price    = group.unit_price || 0
  const disc     = group.discount_pct || 0
  const discPrice = price * (1 - disc / 100)
  const save      = price - discPrice
  const curr      = group.current_members || 0
  const min       = group.min_members || 1
  const pct       = Math.min(Math.round((curr / min) * 100), 100)
  const remaining = Math.max(min - curr, 0)
  const tl        = timeLeft(group.expires_at)
  const expired   = tl === 'Expired'

  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 2px 10px rgba(15,23,42,0.06)', transition: 'transform 0.2s, box-shadow 0.2s' }}
      onMouseOver={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 28px rgba(15,23,42,0.10)' }}
      onMouseOut={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 10px rgba(15,23,42,0.06)' }}>

      {/* Top strip */}
      <div style={{ background: 'linear-gradient(135deg, #0D1B3E, #1B3A8A)', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>
          {group.shop_name || 'Travex Seller'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {disc > 0 && (
            <span style={{ background: '#C9A84C', color: '#0F172A', fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 999 }}>
              -{disc}%
            </span>
          )}
          <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 600, color: expired ? '#FCA5A5' : tl.includes('h') ? '#FCD34D' : '#86EFAC' }}>
            <Clock size={10} /> {tl}
          </span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '1rem' }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', marginBottom: 4, lineHeight: 1.3 }}>
          {group.product_name || 'Group Deal'}
        </div>

        {group.description && (
          <p style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5, marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2 as any, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden' }}>
            {group.description}
          </p>
        )}

        {/* Price row */}
        {price > 0 && (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 18, fontWeight: 900, color: '#0D1B3E' }}>{fmt(discPrice)}</span>
            {disc > 0 && <span style={{ fontSize: 11, color: '#94A3B8', textDecoration: 'line-through' }}>{fmt(price)}</span>}
            {save > 0 && <span style={{ fontSize: 11, color: '#059669', fontWeight: 700 }}>Save {fmt(save)}</span>}
          </div>
        )}

        {/* Progress */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748B', marginBottom: 5 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Users size={11} /> {curr} / {min} joined
            </span>
            <span style={{ color: remaining <= 2 ? '#EF4444' : '#64748B', fontWeight: 600 }}>
              {remaining > 0 ? `${remaining} more needed` : 'Ready!'}
            </span>
          </div>
          <div style={{ height: 6, background: '#F1F5F9', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: pct >= 100 ? '#059669' : 'linear-gradient(90deg,#3B82F6,#0D1B3E)', borderRadius: 999, transition: 'width 0.5s ease' }} />
          </div>
        </div>

        {/* Join button */}
        <Link href={`/group-buy/${group.id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: expired ? '#F1F5F9' : '#0D1B3E', color: expired ? '#94A3B8' : '#fff', borderRadius: 10, padding: '0.6rem', fontWeight: 700, fontSize: 13, textDecoration: 'none', transition: 'opacity 0.2s', pointerEvents: expired ? 'none' : 'auto' as any }}
          onMouseOver={e => !expired && ((e.currentTarget as HTMLElement).style.opacity = '0.85')}
          onMouseOut={e => !expired && ((e.currentTarget as HTMLElement).style.opacity = '1')}>
          <Users size={13} /> {expired ? 'Expired' : 'Join Group'}
        </Link>
      </div>
    </div>
  )
}

export default function GroupBuyPage() {
  const [groups, setGroups]   = useState<Group[]>([])
  const [search, setSearch]   = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  const loadGroups = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await sb
        .from('group_orders')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
      if (err) throw err
      setGroups(data || [])
    } catch {
      setError('Could not load group deals. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadGroups() }, [loadGroups])

  const filtered = groups.filter(g => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      (g.product_name || '').toLowerCase().includes(q) ||
      (g.shop_name || '').toLowerCase().includes(q) ||
      (g.category || '').toLowerCase().includes(q)
    )
  })

  return (
    <main style={{ minHeight: '100vh', background: '#F8FAFF', fontFamily: "'Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Inter:wght@300;400;500;600;700;800&display=swap');
        *{box-sizing:border-box}
        @keyframes gbTicker{0%{transform:translateX(0)}100%{transform:translateX(-33.33%)}}
        .gb-ticker{animation:gbTicker 36s linear infinite}
        .gb-ticker:hover{animation-play-state:paused}
      `}</style>

      <SiteNav />

      {/* HERO */}
      <section style={{ paddingTop: 64, position: 'relative', overflow: 'hidden', color: '#fff', background: 'linear-gradient(160deg,#010510 0%,#030920 35%,#050E2E 65%,#071540 100%)' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 60% 80% at 85% 20%,rgba(56,120,255,0.28) 0%,transparent 65%)', zIndex: 0 }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: '3rem 5% 0' }}>

          {/* Top row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)', padding: '4px 12px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.06em' }}>
              <Users size={11} /> Group Buy
            </div>
            <Link href="/open-store" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#C9A84C', color: '#0F172A', padding: '8px 18px', borderRadius: 999, fontWeight: 700, fontSize: '0.8rem', textDecoration: 'none', boxShadow: '0 4px 14px rgba(201,168,76,0.28)' }}>
              Open Your Shop
            </Link>
          </div>

          {/* Headline */}
          <div style={{ maxWidth: 560, marginBottom: '2rem' }}>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(2rem,4.5vw,3.4rem)', fontWeight: 900, color: '#fff', lineHeight: 1.08, marginBottom: '0.85rem', letterSpacing: '-0.01em' }}>
              <span style={{ color: '#C9A84C' }}>Buy Together,</span> Save More.
            </h1>
            <p style={{ fontSize: 'clamp(0.82rem,1.5vw,0.92rem)', color: 'rgba(255,255,255,0.45)', lineHeight: 1.8, maxWidth: 440 }}>
              Join a group with other buyers and unlock discounts up to 20%. The more people join, the bigger the saving.
            </p>
          </div>

          {/* Stats ticker RTL */}
          <div style={{ overflow: 'hidden', paddingBottom: '1.75rem', borderBottom: '1px solid rgba(255,255,255,0.06)', marginLeft: '-5%', marginRight: '-5%' }}>
            <div className="gb-ticker" style={{ display: 'flex', gap: 0, width: 'max-content', paddingLeft: '8px' }}>
              {[
                { val: loading ? '...' : String(groups.length), label: 'Active Groups', color: '#C9A84C' },
                { val: loading ? '...' : String(groups.filter(g => (g.current_members || 0) >= (g.min_members || 1)).length), label: 'Groups Ready', color: '#86EFAC' },
                { val: 'UP TO 20%', label: 'Max Discount', color: 'rgba(255,255,255,0.6)' },
                { val: 'OPEN', label: 'Registration', color: '#86EFAC' },
                { val: loading ? '...' : String(groups.length), label: 'Active Groups', color: '#C9A84C' },
                { val: loading ? '...' : String(groups.filter(g => (g.current_members || 0) >= (g.min_members || 1)).length), label: 'Groups Ready', color: '#86EFAC' },
                { val: 'UP TO 20%', label: 'Max Discount', color: 'rgba(255,255,255,0.6)' },
                { val: 'OPEN', label: 'Registration', color: '#86EFAC' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', paddingRight: '2.5rem' }}>
                  <div style={{ paddingRight: '2.5rem', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontSize: 'clamp(0.9rem,2vw,1.1rem)', fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: 3 }}>{s.val}</div>
                    <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', whiteSpace: 'nowrap' as const }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* QUICK TICKER */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <div style={{ padding: '10px 0' }}>
          <div className="gb-ticker" style={{ display: 'flex', gap: 8, width: 'max-content', paddingLeft: '5%', animationDuration: '20s' }}>
            {[
              { href: '/market', label: 'Business Market', sub: '500+ Shops', bg: '#FEF3C7', border: '#FCD34D', color: '#92400E' },
              { href: '/flash-deals', label: 'Flash Deals', sub: 'Limited Time', bg: '#DBEAFE', border: '#93C5FD', color: '#1E40AF' },
              { href: '/vybe', label: 'Social Vybe', sub: 'Community', bg: '#EDE9FE', border: '#C4B5FD', color: '#5B21B6' },
              { href: '/campus', label: 'Campus Market', sub: 'Students', bg: '#ECFDF5', border: '#6EE7B7', color: '#065F46' },
              { href: '/market', label: 'Business Market', sub: '500+ Shops', bg: '#FEF3C7', border: '#FCD34D', color: '#92400E' },
              { href: '/flash-deals', label: 'Flash Deals', sub: 'Limited Time', bg: '#DBEAFE', border: '#93C5FD', color: '#1E40AF' },
              { href: '/vybe', label: 'Social Vybe', sub: 'Community', bg: '#EDE9FE', border: '#C4B5FD', color: '#5B21B6' },
              { href: '/campus', label: 'Campus Market', sub: 'Students', bg: '#ECFDF5', border: '#6EE7B7', color: '#065F46' },
            ].map((c, i) => (
              <a key={i} href={c.href} style={{ display: 'inline-flex', flexDirection: 'column' as const, gap: 1, background: c.bg, border: `1px solid ${c.border}`, color: c.color, padding: '6px 14px', borderRadius: 10, textDecoration: 'none', whiteSpace: 'nowrap' as const, flexShrink: 0 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{c.label}</span>
                <span style={{ fontSize: '0.58rem', opacity: 0.7 }}>{c.sub}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* SEARCH + GROUPS */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1.5rem 5% 4rem' }}>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
          <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search group deals, products, sellers..."
            style={{ width: '100%', paddingLeft: '2.75rem', paddingRight: '1rem', paddingTop: '0.75rem', paddingBottom: '0.75rem', border: '1.5px solid #E2E8F0', borderRadius: 12, fontSize: '0.88rem', outline: 'none', fontFamily: "'Inter',sans-serif", background: '#fff', boxShadow: '0 1px 4px rgba(15,23,42,0.05)', transition: 'border-color 0.2s' }}
            onFocus={e => (e.target.style.borderColor = '#0D1B3E')}
            onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
          />
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#0D1B3E', margin: '0 auto 12px', display: 'block' }} />
            <p style={{ color: '#94A3B8', fontSize: 14 }}>Loading group deals...</p>
          </div>

        ) : error ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <p style={{ color: '#94A3B8', fontSize: 14, marginBottom: 16 }}>{error}</p>
            <button onClick={loadGroups} style={{ padding: '10px 24px', background: '#0D1B3E', color: '#fff', border: 'none', borderRadius: 999, fontWeight: 700, cursor: 'pointer', fontFamily: "'Inter',sans-serif", fontSize: 13 }}>
              Try Again
            </button>
          </div>

        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 0' }}>
            <Users size={40} style={{ color: '#CBD5E1', margin: '0 auto 1rem', display: 'block' }} />
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>
              {search ? 'No matching groups' : 'No Active Group Deals'}
            </h3>
            <p style={{ color: '#94A3B8', fontSize: 14, marginBottom: 24 }}>
              {search ? 'Try a different search term.' : 'Sellers will post group deals soon. Check back!'}
            </p>
            <Link href="/market" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#0D1B3E', color: '#fff', padding: '12px 28px', borderRadius: 999, fontWeight: 700, textDecoration: 'none', fontSize: 13 }}>
              Browse Market
            </Link>
          </div>

        ) : (
          <>
            <div style={{ fontSize: '0.76rem', color: '#94A3B8', marginBottom: '1.25rem' }}>
              {filtered.length} group deal{filtered.length !== 1 ? 's' : ''} available
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '1rem' }}>
              {filtered.map(g => <GroupCard key={g.id} group={g} />)}
            </div>
          </>
        )}
      </div>

      <SiteFooter />
    </main>
  )
}
