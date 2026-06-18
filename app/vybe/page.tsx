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

const UNI_TABS = ['All', 'ARU', 'UDSM', 'UDOM', 'TIA', 'NIT']
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
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState<string | null>(null)
  const [liked, setLiked]   = useState<Set<string>>(new Set())

  useEffect(() => { loadPosts() }, [filter])

  async function loadPosts() {
    setLoading(true)
    setError(null)
    let q = sb.from('feed_posts').select('*')
      .order('created_at', { ascending: false }).limit(30)
    if (filter !== 'All') q = q.eq('university_abbr', filter)
    const { data, error: err } = await q
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
      `✦ *${post.shop_name || 'Travex Seller'}* on Travex Mall\n\n` +
      `${getContent(post)}\n` +
      (post.price ? `💰 Price: ${fmtTZS(post.price)}\n` : '') +
      `\n🛍️ Browse: ${SITE}/vybe`
    )
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  // ── Error ──
  if (error) return (
    <main style={{ minHeight: '100vh', background: '#07010E', display: 'flex',
      alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: '#fff' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
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
    <main style={{ minHeight: '100vh', background: '#07010E', fontFamily: "'Inter',sans-serif" }}>
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
      <div style={{
        paddingTop: '64px', position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(160deg, #030818 0%, #07010E 60%)',
      }}>
        <div style={{
          position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)',
          width: '80%', height: '200%',
          background: 'radial-gradient(ellipse at center, rgba(201,168,76,0.15) 0%, transparent 60%)',
          filter: 'blur(50px)', pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 800, margin: '0 auto',
          padding: '2.5rem 5% 1rem', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12,
            background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.30)',
            color: '#C9A84C', padding: '4px 14px', borderRadius: 999, fontSize: 11, fontWeight: 700,
          }}>
            ✦ Live Feed
          </div>
          <h1 style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 900, color: '#fff',
            lineHeight: 1.1, marginBottom: '0.5rem',
          }}>
            Travex Social Vybe
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, marginBottom: '1.5rem' }}>
            Products, offers and updates from verified Tanzania sellers
          </p>

          {/* University tabs */}
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {UNI_TABS.map(u => (
              <button key={u} className={`tab-btn ${filter === u ? 'active' : ''}`}
                onClick={() => setFilter(u)}>
                {u === 'All' ? '🌍 All' : `🎓 ${u}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── FEED ── */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '1.5rem 5% 5rem' }}>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <Loader2 style={{ width: 32, height: 32, margin: '0 auto 12px',
              animation: 'spin 1s linear infinite', color: '#C9A84C' }} />
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14 }}>Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✦</div>
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
              {posts.length} post{posts.length !== 1 ? 's' : ''} • Updated live
            </p>

            {/* Masonry-style grid */}
            <div style={{
              columns: '2', columnGap: '1rem',
            }}>
              {posts.map(post => {
                const content   = getContent(post)
                const likesCount = getLikes(post)
                const isLiked   = liked.has(post.id)
                const initials  = (post.shop_name || '✦').slice(0, 2).toUpperCase()

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
                            {post.university_abbr && ` · ${post.university_abbr}`}
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
