'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslation } from '@/hooks/useTranslation'
import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { sb } from '@/lib/supabase'
import {
  Users, Clock, Search, Loader2, TrendingUp,
  ShoppingBag, Zap, ArrowRight, CheckCircle2, RefreshCw
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────
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
  product_image?: string | null
}

const fmtTZS = (n: number) => 'TZS ' + Number(n).toLocaleString('en-US')

// ── Live HH:MM:SS countdown ──────────────────────────────────
function useCountdown(endTime: string | null) {
  const calc = useCallback(() => {
    if (!endTime) {return { h: '00', m: '00', s: '00', done: false, ongoing: true }}
    const diff = new Date(endTime).getTime() - Date.now()
    if (diff <= 0) {return { h: '00', m: '00', s: '00', done: true, ongoing: false }}
    const totalH = Math.floor(diff / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    const s = Math.floor((diff % 60000) / 1000)
    return { h: String(totalH).padStart(2, '0'), m: String(m).padStart(2, '0'), s: String(s).padStart(2, '0'), done: false, ongoing: false }
  }, [endTime])
  const [time, setTime] = useState(calc())
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000)
    return () => clearInterval(id)
  }, [calc])
  return time
}

// ── Group Card — has its OWN useTranslation ───────────────────
function GroupCard({ group, featured = false }: { group: Group; featured?: boolean }) {
  const { t } = useTranslation()          // ← critical: own hook

  const price    = group.unit_price    || 0
  const disc     = group.discount_pct  || 0
  const grpPrice = price * (1 - disc / 100)
  const saves    = price - grpPrice
  const curr     = group.current_members || 0
  const min      = group.min_members     || 1
  const pct      = Math.min(Math.round((curr / min) * 100), 100)
  const remaining = Math.max(min - curr, 0)
  const isReady  = curr >= min

  const countdown = useCountdown(group.expires_at)
  const isExpired    = countdown.done && !isReady
  const isEndingSoon = !isExpired && !isReady && !countdown.ongoing && parseInt(countdown.h, 10) < 2

  return (
    <article style={{
      background: featured ? 'linear-gradient(160deg,#0D1B3E,#1B3A8A,#0D1B3E)' : 'var(--sn-bg)',
      border: featured
        ? '2px solid rgba(29,78,216,0.30)'
        : isReady
          ? '1.5px solid rgba(5,150,105,0.30)'
          : '1.5px solid var(--sn-border)',
      borderRadius: featured ? 24 : 18,
      overflow: 'hidden',
      boxShadow: featured
        ? '0 24px 56px rgba(13,27,62,0.28), 0 0 0 1px rgba(29,78,216,0.12)'
        : '0 2px 10px rgba(15,23,42,0.06)',
      transition: 'all .25s',
    }}
    onMouseOver={e => {
      const el = e.currentTarget as HTMLElement
      el.style.transform = 'translateY(-4px)'
      el.style.boxShadow = featured
        ? '0 32px 64px rgba(13,27,62,0.38)'
        : '0 12px 32px rgba(15,23,42,0.12)'
    }}
    onMouseOut={e => {
      const el = e.currentTarget as HTMLElement
      el.style.transform = 'translateY(0)'
      el.style.boxShadow = featured
        ? '0 24px 56px rgba(13,27,62,0.28)'
        : '0 2px 10px rgba(15,23,42,0.06)'
    }}>

      {/* Top banner */}
      <div style={{
        padding: featured ? '1rem 1.25rem' : '0.75rem 1rem',
        background: featured ? 'var(--sn-page)' : 'linear-gradient(135deg,#EFF6FF,#DBEAFE)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
          <ShoppingBag size={10} color="rgba(29,78,216,0.7)" />
          <span style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
            color: featured ? '#1D4ED8' : 'var(--sn-muted)',
            textTransform: 'uppercase' as const,
            whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {group.shop_name || 'ShopNekt Seller'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {disc > 0 && (
            <span style={{
              background: 'linear-gradient(135deg,#EF4444,#DC2626)',
              color: '#fff', fontSize: 10, fontWeight: 900,
              padding: '2px 8px', borderRadius: 999,
              boxShadow: '0 2px 8px rgba(239,68,68,0.35)',
              letterSpacing: '-0.01em',
            }}>
              -{disc}% {t('groupBuy.off')}
            </span>
          )}
          <span style={{
            display: 'flex', alignItems: 'center', gap: 3,
            fontSize: 10, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
            color: isExpired ? '#FCA5A5' : isEndingSoon ? '#FCD34D' : isReady ? '#86EFAC' : (featured ? '#86EFAC' : 'var(--sn-muted)'),
          }}>
            <Clock size={9} />
            {countdown.ongoing ? t('groupBuy.ongoingLabel') : isExpired ? t('groupBuy.expiredLabel') : `${countdown.h}:${countdown.m}:${countdown.s}`}
          </span>
        </div>
      </div>

      {/* Product image */}
      <div style={{ position:'relative', height: featured ? 160 : 120, background: group.product_image ? 'var(--sn-page)' : 'linear-gradient(135deg,#DBEAFE,#EDE9FE)' }}>
        {group.product_image ? (
          <Image src={group.product_image} alt={group.product_name || ''} fill style={{ objectFit:'cover' }} />
        ) : (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', width:'100%', height:'100%' }}>
            <ShoppingBag size={featured ? 40 : 30} color="rgba(29,78,216,0.3)" />
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: featured ? '1.25rem' : '1rem' }}>

        {/* Product name */}
        <div style={{
          fontSize: featured ? '1.05rem' : '0.9rem', fontWeight: 800,
          color: featured ? '#fff' : 'var(--sn-text)',
          lineHeight: 1.3, marginBottom: 6, letterSpacing: '-0.02em',
        }}>
          {group.product_name || t('groupBuy.groupDeal')}
        </div>

        {group.description && (
          <p style={{
            fontSize: 12, color: featured ? '#9CA3AF' : 'var(--sn-muted)',
            lineHeight: 1.5, marginBottom: 10,
            display: '-webkit-box', WebkitLineClamp: 2 as any,
            WebkitBoxOrient: 'vertical' as any, overflow: 'hidden',
          }}>
            {group.description}
          </p>
        )}

        {/* Prices */}
        {price > 0 && (
          <>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: featured ? '#9CA3AF' : 'var(--sn-subtle)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 1 }}>
                  {t('groupBuy.groupPrice')}
                </div>
                <span style={{ fontSize: featured ? 20 : 17, fontWeight: 900, color: isReady ? '#059669' : featured ? '#1D4ED8' : '#0D1B3E', letterSpacing: '-0.02em' }}>
                  {fmtTZS(grpPrice)}
                </span>
              </div>
              {disc > 0 && (
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: featured ? '#9CA3AF' : 'var(--sn-subtle)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 1 }}>
                    {t('groupBuy.originalPrice')}
                  </div>
                  <span style={{ fontSize: 13, textDecoration: 'line-through', color: featured ? '#9CA3AF' : 'var(--sn-subtle)' }}>
                    {fmtTZS(price)}
                  </span>
                </div>
              )}
            </div>
            {saves > 0 && (
              <div style={{
                fontSize: 11, fontWeight: 700, marginBottom: 12,
                color: featured ? 'rgba(134,239,172,0.9)' : '#059669',
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <Zap size={10} />
                {t('groupBuy.saveMoney', { amount: fmtTZS(saves) })}
              </div>
            )}
          </>
        )}

        {/* Progress */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: featured ? '#9CA3AF' : 'var(--sn-muted)', fontWeight: 500 }}>
              <Users size={11} />
              {t('groupBuy.joined', { curr: String(curr), min: String(min) })}
            </div>
            <div style={{ fontSize: 11, fontWeight: 700,
              color: isReady ? '#059669' : remaining <= 2 ? '#EF4444' : featured ? '#9CA3AF' : 'var(--sn-muted)',
            }}>
              {isReady
                ? t('groupBuy.readyLabel')
                : t('groupBuy.moreNeeded', { count: String(remaining) })}
            </div>
          </div>
          <div style={{ height: 7, background: featured ? 'var(--sn-border)' : 'var(--sn-page)', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${pct}%`,
              background: isReady
                ? 'linear-gradient(90deg,#059669,#10B981)'
                : pct >= 70
                  ? 'linear-gradient(90deg,#F59E0B,#059669)'
                  : 'linear-gradient(90deg,#3B82F6,#0D1B3E)',
              borderRadius: 999, transition: 'width .5s ease',
            }} />
          </div>
          {isReady && (
            <div style={{ marginTop: 5, fontSize: 10, fontWeight: 700, color: '#059669', display: 'flex', alignItems: 'center', gap: 3 }}>
              <CheckCircle2 size={10} /> {t('groupBuy.discountUnlocked')}
            </div>
          )}
        </div>

        {/* Actions — Visit Shop + Join Group */}
        <div style={{ display: 'flex', gap: 8 }}>
          {group.store_id && (
            <Link href={`/store/${group.store_id}`}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                flex: '0 0 auto',
                padding: '0.65rem 0.9rem',
                background: featured ? 'rgba(255,255,255,0.08)' : 'var(--sn-page)',
                border: featured ? '1px solid rgba(255,255,255,0.15)' : '1.5px solid var(--sn-border)',
                borderRadius: 10, color: featured ? '#E2E8F0' : 'var(--sn-text)',
                textDecoration: 'none', transition: 'all .2s', flexShrink: 0,
                fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap',
              }}>
              <ShoppingBag size={13} /> {t('groupBuy.visitShop')}
            </Link>
          )}
          <Link href={`/group-buy/${group.id}`}
            style={{
              flex: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              background: isExpired
                ? 'var(--sn-page)'
                : isReady
                  ? 'linear-gradient(135deg,#059669,#10B981)'
                  : featured
                    ? 'linear-gradient(135deg,#1D4ED8,#F0C96B)'
                    : '#0D1B3E',
              color: isExpired
                ? 'var(--sn-subtle)'
                : isReady || featured ? '#0F172A' : '#fff',
              borderRadius: 10, padding: '0.65rem 1rem',
              fontWeight: 700, fontSize: 13,
              textDecoration: 'none', transition: 'all .2s',
              pointerEvents: isExpired ? 'none' : 'auto' as any,
              boxShadow: !isExpired && (isReady || featured)
                ? '0 4px 14px rgba(5,150,105,0.30)' : 'none',
            }}
            onMouseOver={e => { if (!isExpired) {(e.currentTarget as HTMLElement).style.opacity = '0.88'} }}
            onMouseOut={e  => { if (!isExpired) {(e.currentTarget as HTMLElement).style.opacity = '1'} }}>
            <Users size={13} />
            {isExpired ? t('groupBuy.expiredLabel') : t('groupBuy.joinBtn')}
          </Link>
        </div>
      </div>
    </article>
  )
}

// ── Main Page ─────────────────────────────────────────────────
export default function GroupBuyPage() {
  const { t } = useTranslation()
  const [groups, setGroups]     = useState<Group[]>([])
  const [search, setSearch]     = useState('')
  const [filter, setFilter]     = useState<'all' | 'ready' | 'filling'>('all')
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)

  const loadGroups = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const { data, error: err } = await sb
        .from('group_orders').select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
      if (err) {throw err}
      setGroups(data || [])
    } catch {
      setError(t('groupBuy.loadError'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => { loadGroups() }, [loadGroups])

  const filtered = useMemo(() => {
    let list = groups
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(g =>
        (g.product_name||'').toLowerCase().includes(q) ||
        (g.shop_name||'').toLowerCase().includes(q) ||
        (g.category||'').toLowerCase().includes(q)
      )
    }
    if (filter === 'ready')   {list = list.filter(g => (g.current_members||0) >= (g.min_members||1))}
    if (filter === 'filling') {list = list.filter(g => (g.current_members||0) <  (g.min_members||1))}
    return list
  }, [groups, search, filter])

  const readyGroups   = groups.filter(g => (g.current_members||0) >= (g.min_members||1))
  const fillingGroups = filtered.filter(g => (g.current_members||0) <  (g.min_members||1))
  const featured      = readyGroups[0] || filtered[0] || null

  return (
    <main style={{ minHeight:'100vh', background:'var(--sn-page)', paddingTop:68, fontFamily:'var(--sn-font)' }}>
      <style>{`
        @keyframes spin { to{transform:rotate(360deg)} }
        .gb-ticker      { /* ticker animation removed */ }
        .gb-ticker:hover{ animation-play-state:paused; }
        .gb-chips       { /* ticker animation removed */ }
        .gb-chips:hover { animation-play-state:paused; }
        .chip-link      { display:inline-flex; flex-direction:column; gap:1px; padding:6px 14px; border-radius:10px; text-decoration:none; white-space:nowrap; flex-shrink:0; transition:opacity .15s; }
        .chip-link:hover{ opacity:.8; }
        * { box-sizing:border-box; }
        @media (min-width:640px)  { .gb-grid { grid-template-columns:repeat(2,1fr) !important; } }
        @media (min-width:1024px) { .gb-grid { grid-template-columns:repeat(3,1fr) !important; } }
      `}</style>

      <SiteNav />

      {/* ── CONTENT ───────────────────────────────────────────── */}
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'1.5rem 5% 4rem' }}>

        {/* Search + filter */}
        <div style={{ display:'flex', gap:10, marginBottom:'1rem', flexWrap:'wrap' }}>
          <div style={{ position:'relative', flex:1, minWidth:220 }}>
            <Search size={15} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--sn-subtle)' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('groupBuy.searchPlaceholder')}
              style={{ width:'100%', paddingLeft:'2.5rem', paddingRight:'1rem', paddingTop:'0.72rem', paddingBottom:'0.72rem',
                border:'1.5px solid var(--sn-input-border)', borderRadius:12, fontSize:'0.87rem', outline:'none',
                fontFamily:"'Inter',sans-serif", background:'var(--sn-bg)',
                boxShadow:'0 1px 4px rgba(15,23,42,0.05)', transition:'border-color .2s', boxSizing:'border-box' as const }}
              onFocus={e => (e.target.style.borderColor = '#0D1B3E')}
              onBlur={e  => (e.target.style.borderColor = 'var(--sn-border)')}
            />
          </div>
          {/* Filter pills */}
          {[
            { key:'all',     label: t('groupBuy.allGroups') },
            { key:'ready',   label: t('groupBuy.readyGroups') },
            { key:'filling', label: t('groupBuy.fillingGroups') },
          ].map(f => (
            <button key={f.key}
              onClick={() => setFilter(f.key as any)}
              style={{ padding:'0.6rem 1.1rem', borderRadius:999, fontSize:'0.78rem', fontWeight:600,
                cursor:'pointer', fontFamily:"'Inter',sans-serif", transition:'all .15s',
                border: filter===f.key ? 'none' : '1.5px solid var(--sn-border)',
                background: filter===f.key ? '#0D1B3E' : 'var(--sn-bg)',
                color: filter===f.key ? '#fff' : 'var(--sn-muted)',
                boxShadow: filter===f.key ? '0 4px 12px rgba(13,27,62,0.18)' : 'none',
              }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Results count */}
        {!loading && !error && filtered.length > 0 && (
          <div style={{ fontSize:'0.76rem', color:'var(--sn-subtle)', marginBottom:'1.25rem' }}>
            {filtered.length === 1
              ? t('groupBuy.dealFound',  { count: '1' })
              : t('groupBuy.dealsFound', { count: String(filtered.length) })}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign:'center', padding:'5rem 0' }}>
            <Loader2 size={32} style={{ animation:'spin 1s linear infinite', color:'#0D1B3E', margin:'0 auto 12px', display:'block' }} />
            <p style={{ color:'var(--sn-subtle)', fontSize:14 }}>{t('groupBuy.loadingGroups')}</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div style={{ textAlign:'center', padding:'5rem 0' }}>
            <div style={{ width:56, height:56, borderRadius:'50%', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.15)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
              <RefreshCw size={22} color="#EF4444" />
            </div>
            <p style={{ color:'var(--sn-subtle)', fontSize:14, marginBottom:16 }}>{error}</p>
            <button onClick={loadGroups}
              style={{ padding:'10px 24px', background:'var(--sn-bg)', color:'var(--sn-text)', border:'none', borderRadius:999, fontWeight:700, cursor:'pointer', fontFamily:"'Inter',sans-serif", fontSize:13 }}>
              {t('groupBuy.tryAgain')}
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <div style={{ textAlign:'center', padding:'5rem 0' }}>
            <div style={{ width:72, height:72, borderRadius:'20px', background: 'var(--sn-bg)', border: '1.5px solid var(--sn-border)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 18px', boxShadow:'0 8px 24px rgba(59,130,246,0.12)' }}>
              <Users size={32} color="#6366F1" />
            </div>
            <h3 style={{ fontSize:'1.25rem', fontWeight:700, color:'var(--sn-text)', marginBottom:8, letterSpacing:'-0.025em' }}>
              {search ? t('groupBuy.noMatching') : t('groupBuy.noGroups')}
            </h3>
            <p style={{ color:'var(--sn-subtle)', fontSize:14, marginBottom:24 }}>
              {search ? t('groupBuy.noMatchingDesc') : t('groupBuy.noGroupsDesc')}
            </p>
            {search
              ? <button onClick={() => setSearch('')}
                  style={{ padding:'11px 28px', background:'var(--sn-bg)', color:'var(--sn-text)', border:'none', borderRadius:999, fontWeight:700, cursor:'pointer', fontFamily:"'Inter',sans-serif", fontSize:14 }}>
                  {t('groupBuy.allGroups')}
                </button>
              : <Link href="/market"
                  style={{ display:'inline-flex', alignItems:'center', gap:6, background:'var(--sn-bg)', color:'var(--sn-text)', padding:'11px 28px', borderRadius:999, fontWeight:700, textDecoration:'none', fontSize:14 }}>
                  <ShoppingBag size={14} /> {t('groupBuy.browseMarket')}
                </Link>
            }
          </div>
        )}

        {/* Groups */}
        {!loading && !error && filtered.length > 0 && (
          <div style={{ }}>
            {/* Featured */}
            {featured && filter === 'all' && !search && (
              <div style={{ marginBottom:'2rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:'1rem' }}>
                  <TrendingUp size={13} color="#1D4ED8" />
                  <span style={{ fontSize:12, fontWeight:800, color:'#0D1B3E', textTransform:'uppercase' as const, letterSpacing:'0.08em' }}>
                    {featured.current_members! >= featured.min_members!
                      ? t('groupBuy.readyToBuy')
                      : t('groupBuy.allDeals')}
                  </span>
                  <div style={{ flex:1, height:1, background:'linear-gradient(90deg,rgba(29,78,216,0.4),transparent)' }} />
                </div>
                <GroupCard group={featured} featured={true} />
              </div>
            )}

            {/* Ready to Buy section */}
            {filter !== 'filling' && readyGroups.filter(g => !featured || g.id !== featured.id).length > 0 && filter === 'all' && !search && (
              <div style={{ marginBottom:'2rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:'1rem' }}>
                  <CheckCircle2 size={13} color="#059669" />
                  <span style={{ fontSize:12, fontWeight:800, color:'#059669', textTransform:'uppercase' as const, letterSpacing:'0.08em' }}>
                    {t('groupBuy.readyToBuy')}
                  </span>
                  <div style={{ flex:1, height:1, background:'linear-gradient(90deg,rgba(5,150,105,0.3),transparent)' }} />
                </div>
                <div className="gb-grid" style={{ display:'grid', gridTemplateColumns:'1fr', gap:'1rem' }}>
                  {readyGroups.filter(g => !featured || g.id !== featured.id).map(g => (
                    <GroupCard key={g.id} group={g} />
                  ))}
                </div>
              </div>
            )}

            {/* All / Filling */}
            {(filter !== 'all' || search || fillingGroups.length > 0) && (
              <div>
                {filter === 'all' && !search && fillingGroups.length > 0 && (
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:'1rem' }}>
                    <Users size={13} color="#3B82F6" />
                    <span style={{ fontSize:12, fontWeight:800, color:'#3B82F6', textTransform:'uppercase' as const, letterSpacing:'0.08em' }}>
                      {t('groupBuy.fillingUp')}
                    </span>
                    <div style={{ flex:1, height:1, background:'linear-gradient(90deg,rgba(59,130,246,0.3),transparent)' }} />
                  </div>
                )}
                <div className="gb-grid" style={{ display:'grid', gridTemplateColumns:'1fr', gap:'1rem' }}>
                  {(filter === 'all' && !search ? fillingGroups : filtered).map(g => (
                    <GroupCard key={g.id} group={g} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <SiteFooter />
    </main>
  )
}
