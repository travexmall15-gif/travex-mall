'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { sb } from '@/lib/supabase'
import { Heart, MessageCircle, ExternalLink, Store, Loader2 } from 'lucide-react'

type FeedPost = {
  id: string
  store_id: string | null
  shop_name: string | null
  content: string | null
  post_text: string | null
  caption: string | null
  tag: string | null
  category: string | null
  price: number | null
  likes: number | null
  likes_count: number | null
  comments: number | null
  media_url: string | null
  university_abbr: string | null
  created_at: string
}

const SITE = 'https://travex-mall.vercel.app'

function ago(d: string) {
  const diff = Date.now() - new Date(d).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function fmtTZS(n: number) {
  return 'TZS ' + Number(n).toLocaleString('en-US')
}

// Get post text from any field
function getContent(post: FeedPost) {
  return post.content || post.post_text || post.caption || ''
}

// Get likes count from any field
function getLikes(post: FeedPost) {
  return post.likes_count || post.likes || 0
}

export default function VybePage() {
  const [posts, setPosts]   = useState<FeedPost[]>([])
  const [catFilter, setCatFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState<string | null>(null)
  const [liked, setLiked]   = useState<Set<string>>(new Set())

  useEffect(() => { loadPosts() }, [])

  async function loadPosts() {
    setLoading(true)
    setError(null)
    const { data, error: err } = await sb
      .from('feed_posts').select('*')
      .is('university_abbr', null)
      .order('created_at', { ascending: false }).limit(40)
    if (err) { setError('Failed to load posts. Please try again.'); setLoading(false); return }
    setPosts(data || [])
    setLoading(false)
  }

  async function toggleLike(post: FeedPost) {
    const isLiked  = liked.has(post.id)
    const likesNow = getLikes(post)
    const newCount = likesNow + (isLiked ? -1 : 1)
    setLiked(prev => { const n = new Set(prev); isLiked ? n.delete(post.id) : n.add(post.id); return n })
    await sb.from('feed_posts').update({
      likes: newCount,
      likes_count: newCount,
    }).eq('id', post.id)
    setPosts(prev => prev.map(p => p.id === post.id
      ? { ...p, likes: newCount, likes_count: newCount } : p))
  }

  function shareOnWhatsApp(post: FeedPost) {
    const text = encodeURIComponent(
      ` *${post.shop_name || 'Travex Seller'}* on Travex Mall\n\n` +
      `${getContent(post)}\n` +
      (post.price ? ` Price: ${fmtTZS(post.price)}\n` : '') +
      `\n Browse: ${SITE}/vybe`
    )
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  //  Error 
  if (error) return (
    <main style={{ minHeight: '100vh', background: '#07010E', display: 'flex',
      alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: '#fff' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}></div>
        <p style={{ color: 'rgba(255,255,255,0.50)', marginBottom: 16, fontSize: 14 }}>{error}</p>
        <button onClick={loadPosts} style={{
          padding: '10px 24px', background: '#C9A84C', color: '#0F172A',
          border: 'none', borderRadius: 999, fontWeight: 700, cursor: 'pointer',
          fontFamily: 'Inter, sans-serif',
        }}>Retry</button>
      </div>
    </main>
  )

  return (
    <main style={{ minHeight: '100vh', background: '#F8FAFF', fontFamily: "'Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Inter:wght@300;400;500;600;700;800&display=swap');
        *{box-sizing:border-box}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        .post-card{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;break-inside:avoid;margin-bottom:1rem;transition:border-color 0.2s;animation:fadeUp 0.35s ease}
        .post-card:hover{border-color:rgba(201,168,76,0.30)}
        .like-btn{display:flex;align-items:center;gap:5px;background:none;border:none;color:rgba(255,255,255,0.45);cursor:pointer;font-size:13px;font-weight:600;padding:6px 10px;border-radius:999px;transition:all 0.15s;font-family:'Inter',sans-serif}
        .like-btn:hover,.like-btn.liked{color:#EF4444}
        .like-btn.liked svg{fill:#EF4444}
        .share-btn{display:flex;align-items:center;gap:5px;background:none;border:none;color:rgba(255,255,255,0.40);cursor:pointer;font-size:13px;font-weight:600;padding:6px 10px;border-radius:999px;transition:all 0.15s;font-family:'Inter',sans-serif}
        .share-btn:hover{color:#25D366}
        .tab-btn{padding:7px 16px;border-radius:999px;font-size:12px;font-weight:600;cursor:pointer;border:1px solid rgba(255,255,255,0.12);background:transparent;color:rgba(255,255,255,0.50);transition:all 0.15s;font-family:'Inter',sans-serif}
        .tab-btn.active{background:#C9A84C;border-color:#C9A84C;color:#0F172A}
        .view-shop-btn{display:inline-flex;align-items:center;gap:5px;background:rgba(5,11,46,0.8);color:#C9A84C;border:1px solid rgba(201,168,76,0.25);border-radius:999px;padding:5px 12px;font-size:11px;font-weight:700;text-decoration:none;transition:all 0.2s}
        .view-shop-btn:hover{background:#C9A84C;color:#0F172A}
      `}</style>

      <SiteNav />

      {/* ── HERO ── */}
      <section style={{ paddingTop: '64px', position: 'relative', overflow: 'hidden', color: '#fff', background: 'linear-gradient(160deg, #010510 0%, #030920 35%, #050E2E 65%, #071540 100%)' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 60% 80% at 85% 20%, rgba(56,120,255,0.28) 0%, transparent 65%)', zIndex: 0 }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '3rem 5% 0' }}>

          {/* Top row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)', padding: '4px 12px', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.06em' }}>
              Social Vybe
            </div>
            <Link href="/open-store" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#C9A84C', color: '#0F172A', padding: '8px 18px', borderRadius: '999px', fontWeight: 700, fontSize: '0.8rem', textDecoration: 'none', boxShadow: '0 4px 14px rgba(201,168,76,0.28)' }}>
              Open Your Shop
            </Link>
          </div>

          {/* Headline */}
          <div style={{ maxWidth: '560px', marginBottom: '2rem' }}>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem, 4.5vw, 3.4rem)', fontWeight: 900, color: '#fff', lineHeight: 1.08, marginBottom: '0.85rem', letterSpacing: '-0.01em' }}>
              <span style={{ color: '#C9A84C' }}>Social</span> Vybe.
            </h1>
            <p style={{ fontSize: 'clamp(0.82rem,1.5vw,0.92rem)', color: 'rgba(255,255,255,0.45)', lineHeight: 1.8, maxWidth: '440px' }}>
              Products, deals and updates from verified business sellers across Tanzania. Discover, like and visit shops.
            </p>
          </div>

          {/* Stats ticker RTL */}
          <div style={{ overflow: 'hidden', paddingBottom: '1.75rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <style>{`
              @keyframes vybeStats { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
              .vybe-stats { animation: vybeStats 14s linear infinite; }
              .vybe-stats:hover { animation-play-state: paused; }
              @keyframes vybeTicker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
              .vybe-ticker { animation: vybeTicker 18s linear infinite; }
              .vybe-ticker:hover { animation-play-state: paused; }
            `}</style>
            <div className="vybe-stats" style={{ display: 'flex', gap: '0', width: 'max-content' }}>
              {[
                { val: loading ? '...' : String(posts.length), label: 'Posts', color: '#C9A84C' },
                { val: loading ? '...' : String(posts.reduce((s,p) => s + getLikes(p), 0)), label: 'Total Likes', color: 'rgba(255,255,255,0.6)' },
                { val: 'LIVE', label: 'Feed Status', color: '#86EFAC' },
                { val: 'Business', label: 'Market Only', color: 'rgba(255,255,255,0.6)' },
                { val: loading ? '...' : String(posts.length), label: 'Posts', color: '#C9A84C' },
                { val: loading ? '...' : String(posts.reduce((s,p) => s + getLikes(p), 0)), label: 'Total Likes', color: 'rgba(255,255,255,0.6)' },
                { val: 'LIVE', label: 'Feed Status', color: '#86EFAC' },
                { val: 'Business', label: 'Market Only', color: 'rgba(255,255,255,0.6)' },
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
          <div className="vybe-ticker" style={{ display: 'flex', gap: '8px', width: 'max-content', paddingLeft: '5%' }}>
            {[
              { href: '/market', label: 'Business Market', sub: '500+ Shops', bg: '#FEF3C7', border: '#FCD34D', color: '#92400E' },
              { href: '/flash-deals', label: 'Flash Deals', sub: 'Limited Time', bg: '#DBEAFE', border: '#93C5FD', color: '#1E40AF' },
              { href: '/group-buy', label: 'Group Buy', sub: 'Save Together', bg: '#EDE9FE', border: '#C4B5FD', color: '#5B21B6' },
              { href: '/campus', label: 'Campus Market', sub: 'Students', bg: '#ECFDF5', border: '#6EE7B7', color: '#065F46' },
              { href: '/market', label: 'Business Market', sub: '500+ Shops', bg: '#FEF3C7', border: '#FCD34D', color: '#92400E' },
              { href: '/flash-deals', label: 'Flash Deals', sub: 'Limited Time', bg: '#DBEAFE', border: '#93C5FD', color: '#1E40AF' },
              { href: '/group-buy', label: 'Group Buy', sub: 'Save Together', bg: '#EDE9FE', border: '#C4B5FD', color: '#5B21B6' },
              { href: '/campus', label: 'Campus Market', sub: 'Students', bg: '#ECFDF5', border: '#6EE7B7', color: '#065F46' },
            ].map((c, i) => (
              <a key={i} href={c.href} style={{ display: 'inline-flex', flexDirection: 'column' as const, gap: '1px', background: c.bg, border: `1px solid ${c.border}`, color: c.color, padding: '6px 14px', borderRadius: '10px', textDecoration: 'none', whiteSpace: 'nowrap' as const, flexShrink: 0 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{c.label}</span>
                <span style={{ fontSize: '0.58rem', opacity: 0.7 }}>{c.sub}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/*  FEED  */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '1.5rem 5% 5rem' }}>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <Loader2 style={{ width: 32, height: 32, margin: '0 auto 12px',
              animation: 'spin 1s linear infinite', color: '#C9A84C' }} />
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14 }}>Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}></div>
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.3rem',
              color: '#fff', marginBottom: 8 }}>No Posts Yet</h3>
            <p style={{ color: 'rgba(255,255,255,0.40)', fontSize: 14, marginBottom: 20 }}>
              {filter === 'All'
                ? 'Be the first seller to post on Travex Vybe!'
                : `No posts from ${filter} sellers yet.`}
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/market" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: '#C9A84C', color: '#0F172A', padding: '11px 22px',
                borderRadius: 999, fontWeight: 700, fontSize: 13, textDecoration: 'none',
              }}>
                <Store size={14} /> Browse Market
              </Link>
              <Link href="/open-store" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(255,255,255,0.08)', color: '#fff',
                border: '1px solid rgba(255,255,255,0.12)',
                padding: '11px 22px', borderRadius: 999, fontWeight: 600, fontSize: 13, textDecoration: 'none',
              }}>
                Open Your Shop
              </Link>
            </div>
          </div>
        ) : (
          <>
            <p style={{ color: 'rgba(255,255,255,0.30)', fontSize: 12,
              marginBottom: '1.25rem', textAlign: 'center' }}>
              {posts.length} post{posts.length !== 1 ? 's' : ''}  Updated live
            </p>

            {/* Masonry-style grid */}
            <div style={{
              columns: '2', columnGap: '1rem',
            }}>
              {posts.map(post => {
                const content   = getContent(post)
                const likesCount = getLikes(post)
                const isLiked   = liked.has(post.id)
                const initials  = (post.shop_name || '').slice(0, 2).toUpperCase()

                return (
                  <div key={post.id} className="post-card">
                    {/* Media */}
                    {post.media_url && (
                      <div className="relative w-full" style={{maxHeight:220,overflow:'hidden'}}>
                        <Image src={post.media_url!} alt="Post media" width={600} height={220}
                          className="w-full object-cover" style={{maxHeight:220}} />
                      </div>
                    )}

                    <div style={{ padding: '1rem' }}>
                      {/* Header */}
                      <div style={{ display: 'flex', alignItems: 'center',
                        gap: '0.6rem', marginBottom: '0.75rem' }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                          background: 'linear-gradient(135deg, #050B2E, #0A1858)',
                          border: '1px solid rgba(201,168,76,0.30)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 800, color: '#C9A84C',
                        }}>
                          {initials}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#fff',
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {post.shop_name || 'Travex Seller'}
                          </div>
                          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>
                            {ago(post.created_at)}
                            {post.university_abbr && `  ${post.university_abbr}`}
                          </div>
                        </div>
                        {post.tag && (
                          <span style={{
                            fontSize: 10, fontWeight: 700, color: '#C9A84C',
                            background: 'rgba(201,168,76,0.12)',
                            padding: '2px 8px', borderRadius: 999, flexShrink: 0,
                          }}>
                            {post.tag}
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      {content && (
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)',
                          lineHeight: 1.65, marginBottom: '0.75rem' }}>
                          {content}
                        </p>
                      )}

                      {/* Price */}
                      {post.price && (
                        <div style={{
                          display: 'inline-block', marginBottom: '0.75rem',
                          background: 'rgba(201,168,76,0.12)', color: '#C9A84C',
                          padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 800,
                        }}>
                          {fmtTZS(post.price)}
                        </div>
                      )}

                      {/* View shop link */}
                      {post.store_id && (
                        <div style={{ marginBottom: '0.75rem' }}>
                          <Link href={`/store/${post.store_id}`} className="view-shop-btn">
                            <Store size={11} /> View Shop
                          </Link>
                        </div>
                      )}

                      {/* Actions */}
                      <div style={{ display: 'flex', alignItems: 'center',
                        gap: 4, borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '0.6rem' }}>
                        <button className={`like-btn ${isLiked ? 'liked' : ''}`}
                          onClick={() => toggleLike(post)}>
                          <Heart size={14} style={{ fill: isLiked ? '#EF4444' : 'none' }} />
                          {likesCount}
                        </button>
                        <button className="share-btn"
                          onClick={() => shareOnWhatsApp(post)}>
                          <MessageCircle size={14} /> Share
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      <SiteFooter />
    </main>
  )
}
