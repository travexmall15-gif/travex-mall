'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { sb } from '@/lib/supabase'
import { getUniversity } from '@/lib/data'
import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { ArrowLeft, Search, MapPin, Store, MessageCircle, ShieldCheck, Package, Loader2 } from 'lucide-react'

type CampusStore = {
  id: string
  store_name: string
  owner_name: string
  phone: string | null
  whatsapp: string | null
  category: string | null
  description: string | null
  university_abbr: string
  is_active: boolean
  created_at: string
}

const CATS = ['All','Fashion','Food','Electronics','Beauty','Books','Services','Other']

export default function UniversityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const uni = getUniversity(slug)
  const [stores, setStores]   = useState<CampusStore[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [cat, setCat]         = useState('All')

  useEffect(() => {
    async function load() {
      const { data } = await sb
        .from('campus_stores')
        .select('*')
        .eq('university_abbr', slug.toUpperCase())
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      setStores(data || [])
      setLoading(false)
    }
    load()
  }, [slug])

  const filtered = stores.filter(s => {
    const matchQ = !search || s.store_name.toLowerCase().includes(search.toLowerCase())
    const matchC = cat === 'All' || s.category === cat
    return matchQ && matchC
  })

  const slotsLeft = 60 - stores.length
  const uniName   = uni?.name || slug.toUpperCase()
  const uniCity   = uni?.city || 'Tanzania'

  return (
    <main style={{ minHeight: '100vh', background: '#060C1A', fontFamily: "'Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Inter:wght@300;400;500;600;700;800&display=swap');
        *{box-sizing:border-box}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .shop-card{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:1.25rem;transition:all 0.25s;animation:fadeUp 0.4s ease}
        .shop-card:hover{transform:translateY(-4px);border-color:rgba(201,168,76,0.45);box-shadow:0 16px 40px rgba(0,0,0,0.4)}
        .cat-btn{padding:6px 14px;border-radius:999px;font-size:12px;font-weight:600;cursor:pointer;border:1px solid rgba(255,255,255,0.12);background:transparent;color:rgba(255,255,255,0.55);transition:all 0.15s;font-family:'Inter',sans-serif}
        .cat-btn.active{background:#C9A84C;border-color:#C9A84C;color:#0F172A}
        .search-inp{width:100%;padding:10px 16px 10px 42px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.10);border-radius:999px;color:#fff;font-size:13px;outline:none;font-family:'Inter',sans-serif}
        .search-inp::placeholder{color:rgba(255,255,255,0.30)}
        .search-inp:focus{border-color:#C9A84C;background:rgba(255,255,255,0.10)}
        .view-btn{display:flex;align-items:center;justify-content:center;gap:6px;background:#050B2E;color:#fff;border-radius:999px;padding:8px 16px;font-size:12px;font-weight:700;text-decoration:none;transition:all 0.2s;border:1px solid rgba(255,255,255,0.10)}
        .view-btn:hover{background:#C9A84C;color:#0F172A;border-color:#C9A84C}
        @media(max-width:640px){.shops-grid{grid-template-columns:1fr!important}}
      `}</style>

      <SiteNav />

      {/* ── HERO ── */}
      <div style={{
        position: 'relative', overflow: 'hidden', paddingTop: '64px',
        background: 'linear-gradient(160deg, #030818 0%, #060C1A 40%, #0A1228 100%)',
      }}>
        <div style={{
          position: 'absolute', top: '-30%', right: '-10%', width: '60%', height: '120%',
          background: 'radial-gradient(ellipse at center, rgba(201,168,76,0.25) 0%, transparent 65%)',
          filter: 'blur(40px)', pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: '1.25rem 5% 0' }}>
          <Link href="/campus" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.55)',
            textDecoration: 'none', fontSize: 13, fontWeight: 600,
            padding: '8px 16px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.10)',
            background: 'rgba(255,255,255,0.05)',
          }}>
            <ArrowLeft size={14} /> Campus Market
          </Link>
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: '2rem 5% 0' }}>
          {/* Uni badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12,
            background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.35)',
            color: '#C9A84C', padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700,
          }}>
            🎓 {slug.toUpperCase()}
          </div>
          <h1 style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 900, color: '#fff',
            lineHeight: 1.1, marginBottom: '0.5rem',
          }}>
            {uniName}
          </h1>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.5rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'rgba(255,255,255,0.50)' }}>
              <MapPin size={12} /> {uniCity}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'rgba(255,255,255,0.50)' }}>
              <Store size={12} /> {loading ? '...' : stores.length} active shops
            </span>
            <span style={{
              fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 999,
              background: slotsLeft > 10 ? 'rgba(5,150,105,0.15)' : slotsLeft > 0 ? 'rgba(217,119,6,0.15)' : 'rgba(220,38,38,0.15)',
              color: slotsLeft > 10 ? '#34D399' : slotsLeft > 0 ? '#FCD34D' : '#F87171',
            }}>
              {slotsLeft > 0 ? `${slotsLeft} slots remaining` : 'Fully booked'}
            </span>
          </div>

          {/* Stats strip */}
          <div style={{
            display: 'flex', gap: 0, background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14,
            overflow: 'hidden', flexWrap: 'wrap', marginBottom: '2.5rem',
          }}>
            {[
              ['🏪', String(loading ? '...' : stores.length), 'Active Shops'],
              ['🎓', '60', 'Total Slots'],
              ['✅', 'Verified', 'Students Only'],
              ['💰', 'TZS 10K/mo', 'Subscription'],
            ].map(([icon, val, label], i, arr) => (
              <div key={label} style={{
                flex: 1, minWidth: 100, padding: '12px 16px', textAlign: 'center',
                borderRight: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none',
              }}>
                <div style={{ fontSize: 14, marginBottom: 2 }}>{icon}</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{val}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── SHOPS ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 5% 4rem' }}>

        {/* Search + Filter */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)', fontSize: 16 }}>🔍</span>
            <input className="search-inp" value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={`Search shops at ${slug.toUpperCase()}...`} />
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {CATS.map(c => (
              <button key={c} className={`cat-btn ${cat === c ? 'active' : ''}`}
                onClick={() => setCat(c)}>{c}</button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <Loader2 style={{ width: 32, height: 32, margin: '0 auto 12px', animation: 'spin 1s linear infinite', color: '#C9A84C' }} />
            <p style={{ color: 'rgba(255,255,255,0.40)', fontSize: 14 }}>Loading shops...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🏪</div>
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.3rem', color: '#fff', marginBottom: 8 }}>
              {stores.length === 0 ? 'No Shops Yet' : 'No Shops Found'}
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.40)', fontSize: 14, marginBottom: 20 }}>
              {stores.length === 0
                ? 'Be the first student entrepreneur at this university!'
                : 'Try a different search or category.'}
            </p>
            {stores.length === 0 && (
              <Link href="/campus-apply" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: '#C9A84C', color: '#0F172A', padding: '12px 24px',
                borderRadius: 999, fontWeight: 700, fontSize: 14, textDecoration: 'none',
              }}>
                Open Your Shop →
              </Link>
            )}
          </div>
        ) : (
          <>
            <p style={{ color: 'rgba(255,255,255,0.40)', fontSize: 13, marginBottom: '1.25rem' }}>
              {filtered.length} shop{filtered.length !== 1 ? 's' : ''} found
            </p>
            <div className="shops-grid" style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1rem',
            }}>
              {filtered.map(store => {
                const initials = store.store_name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
                const wa = (store.whatsapp || store.phone || '').replace(/\D/g, '')
                return (
                  <div key={store.id} className="shop-card">
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.9rem' }}>
                      <div style={{
                        width: 46, height: 46, borderRadius: 12, flexShrink: 0,
                        background: 'linear-gradient(135deg, #C9A84C, #F0C96B)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 900, color: '#0F172A',
                      }}>
                        {initials}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: '#fff', marginBottom: 2,
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {store.store_name}
                        </div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.40)' }}>
                          {store.owner_name}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11,
                        color: '#34D399', fontWeight: 600, flexShrink: 0 }}>
                        <ShieldCheck size={11} /> Verified
                      </div>
                    </div>

                    {/* Category */}
                    {store.category && (
                      <span style={{
                        display: 'inline-block', background: 'rgba(201,168,76,0.12)',
                        color: '#C9A84C', fontSize: 11, fontWeight: 600,
                        padding: '2px 9px', borderRadius: 999, marginBottom: '0.75rem',
                      }}>
                        {store.category}
                      </span>
                    )}

                    {/* Description */}
                    {store.description && (
                      <p style={{
                        fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6,
                        marginBottom: '0.9rem',
                        display: '-webkit-box', WebkitLineClamp: 2 as any,
                        WebkitBoxOrient: 'vertical' as any, overflow: 'hidden',
                      }}>
                        {store.description}
                      </p>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                      <Link href={`/store/${store.id}`} className="view-btn" style={{ flex: 2 }}>
                        <Store size={13} /> View Shop
                      </Link>
                      {wa && (
                        <a href={`https://wa.me/${wa}`} target="_blank"
                          style={{
                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            gap: 5, background: '#25D366', color: '#fff', borderRadius: 999,
                            padding: '8px', fontSize: 12, fontWeight: 700, textDecoration: 'none',
                          }}>
                          <MessageCircle size={13} /> Chat
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* Open shop CTA */}
        {!loading && slotsLeft > 0 && (
          <div style={{
            marginTop: '3rem', padding: '2rem', textAlign: 'center',
            background: 'rgba(201,168,76,0.06)', border: '1px dashed rgba(201,168,76,0.25)',
            borderRadius: 16,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#C9A84C',
              textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
              {slotsLeft} slots remaining at {slug.toUpperCase()}
            </div>
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.2rem',
              color: '#fff', marginBottom: 8 }}>Are You a Student at {uniName.split(' ')[0]}?</h3>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, marginBottom: 16 }}>
              Open your campus shop for just TZS 10,000/month
            </p>
            <Link href="/campus-apply" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#C9A84C', color: '#0F172A', padding: '11px 24px',
              borderRadius: 999, fontWeight: 700, fontSize: 13, textDecoration: 'none',
            }}>
              Apply Now →
            </Link>
          </div>
        )}
      </div>

      <SiteFooter />
    </main>
  )
}
