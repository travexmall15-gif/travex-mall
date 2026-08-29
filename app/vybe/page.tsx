'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'
import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { sb } from '@/lib/supabase'
import {
  Heart, Store, Loader2, Image as ImageIcon,
  Play, Search, Zap, TrendingUp, Star, RefreshCw,
  ShieldCheck, Tag, Clock, Share2, ShoppingBag
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────
type FeedPost = {
  id: string
  store_id: string | null
  shop_name: string | null
  shop_logo: string | null
  content: string | null
  post_text: string | null
  caption: string | null
  tag: string | null
  category: string | null
  price: number | null
  likes: number | null
  likes_count: number | null
  media_url: string | null
  media_type: string | null
  university_abbr: string | null
  is_verified?: boolean | null
  product_id?: string | null
  created_at: string
}

// ── Helpers ───────────────────────────────────────────────────
function fmtTZS(n: number) {
  return 'TZS ' + Number(n).toLocaleString('en-US')
}
function getContent(p: FeedPost) {
  return p.content || p.post_text || p.caption || ''
}
function getLikes(p: FeedPost) {
  return p.likes_count ?? p.likes ?? 0
}
function isVideo(p: FeedPost) {
  if (p.media_type?.includes('video')) {return true}
  const u = (p.media_url || '').toLowerCase()
  return u.includes('.mp4') || u.includes('.mov') || u.includes('.webm') || u.includes('video')
}

// ── Main Page ─────────────────────────────────────────────────
export default function VybePage() {
  const { t } = useTranslation()

  const [posts, setPosts]         = useState<FeedPost[]>([])
  const [filter, setFilter]       = useState<'all' | 'photo' | 'video'>('all')
  const [search, setSearch]       = useState('')
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState<string | null>(null)
  const [liked, setLiked]         = useState<Set<string>>(new Set())
  const [visible, setVisible]     = useState(12)

  // Time formatter — uses t() from closure — re-runs on lang change
  const ago = useCallback((d: string) => {
    const diff = Date.now() - new Date(d).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1)  {return t('vybe.justNow')}
    if (m < 60) {return t('vybe.minAgo', { n: String(m) })}
    const h = Math.floor(m / 60)
    if (h < 24) {return t('vybe.hrAgo', { n: String(h) })}
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }, [t])

  const loadPosts = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const { data, error: err } = await sb
        .from('feed_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)
      if (err) {throw err}
      setPosts(data || [])
    } catch {
      setError(t('vybe.couldNotLoad'))
    } finally {
      setLoading(false)
    }
  }, [t])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadPosts() }, [])

  const toggleLike = async (post: FeedPost) => {
    const isLiked = liked.has(post.id)
    const n = getLikes(post) + (isLiked ? -1 : 1)
    setLiked(prev => { const s = new Set(prev); isLiked ? s.delete(post.id) : s.add(post.id); return s })
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, likes: n, likes_count: n } : p))
    await sb.from('feed_posts').update({ likes: n, likes_count: n }).eq('id', post.id)
  }

  const [copiedId, setCopiedId] = useState<string | null>(null)
  const sharePost = async (post: FeedPost) => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/vybe#${post.id}` : ''
    const text = getContent(post) || post.shop_name || 'ShopNekt'
    if (typeof navigator !== 'undefined' && navigator.share) {
      try { await navigator.share({ title: post.shop_name || 'ShopNekt', text, url }); return } catch { /* user cancelled */ }
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopiedId(post.id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {}
  }

  const filtered = useMemo(() => {
    let list = posts
    if (filter === 'photo') {list = list.filter(p => p.media_url && !isVideo(p))}
    if (filter === 'video') {list = list.filter(p => p.media_url &&  isVideo(p))}
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p =>
        (p.shop_name||'').toLowerCase().includes(q) ||
        getContent(p).toLowerCase().includes(q) ||
        (p.tag||'').toLowerCase().includes(q) ||
        (p.category||'').toLowerCase().includes(q)
      )
    }
    return list
  }, [posts, filter, search])

  // Stats
  const totalLikes = posts.reduce((a, p) => a + getLikes(p), 0)
  const categories = [...new Set(posts.map(p => p.category).filter(Boolean))] as string[]

  return (
    <main style={{ minHeight: '100vh', background: 'var(--sn-page)', paddingTop: 118, fontFamily: 'var(--sn-font)' }}>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg) } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        @keyframes pulse   { 0%,100% { opacity:.5 } 50% { opacity:1 } }

        .vybe-card {
          background: #fff;
          border: 1px solid #E5E7EB;
          border-radius: 20px;
          overflow: hidden;
          transition: border-color .22s, box-shadow .22s, transform .22s;
        }
        .vybe-card:hover {
          border-color: #D1D5DB;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          transform: translateY(-2px);
        }

        .like-btn {
          display:inline-flex; align-items:center; gap:5px;
          background: #F3F4F6;
          border: 1px solid #E5E7EB;
          border-radius: 999px;
          color: #6B7280;
          cursor:pointer; font-size:13px; font-weight:600;
          padding: 7px 14px;
          transition: all .18s;
          font-family: var(--sn-font);
        }
        .like-btn:hover { background:rgba(239,68,68,.12); border-color:rgba(239,68,68,.3); color:#EF4444; }
        .like-btn.liked { background:rgba(239,68,68,.15); border-color:rgba(239,68,68,.4); color:#EF4444; }

        .visit-btn {
          display:inline-flex; align-items:center; gap:6px;
          background: linear-gradient(135deg, #EFF6FF, #1B3A8A);
          border: 1px solid rgba(29,78,216,.30);
          color: #1D4ED8;
          border-radius: 999px;
          padding: 7px 18px;
          font-size:13px; font-weight:700;
          text-decoration:none;
          transition: all .18s;
        }
        .visit-btn:hover {
          background: #1D4ED8;
          color: #0F172A;
          border-color: #1D4ED8;
          box-shadow: 0 4px 16px rgba(29,78,216,.35);
        }

        .filter-pill {
          display:inline-flex; align-items:center; gap:5px;
          padding: 7px 18px; border-radius:999px;
          font-size:13px; font-weight:600; cursor:pointer;
          border: 1.5px solid #E5E7EB;
          background: transparent;
          color: #9CA3AF;
          transition: all .18s;
          font-family: var(--sn-font);
          white-space: nowrap;
        }
        .filter-pill:hover  { border-color:#D1D5DB; color:#374151; }
        .filter-pill.active { background:#1D4ED8; border-color:#1D4ED8; color:#0F172A; }

        .cat-chip {
          display:inline-flex; align-items:center; gap:4px;
          padding:5px 14px; border-radius:999px;
          font-size:12px; font-weight:600; cursor:pointer;
          border:1px solid #E5E7EB;
          background:#F9FAFB;
          color:#6B7280;
          text-decoration:none;
          transition:all .15s;
          white-space:nowrap;
        }
        .cat-chip:hover { border-color:rgba(29,78,216,.4); color:#1D4ED8; background:rgba(29,78,216,.08); }

        .search-input {
          width:100%; padding:11px 16px 11px 42px;
          background:#F3F4F6;
          border:1.5px solid #E5E7EB;
          border-radius:14px; font-size:14px;
          color:#fff; outline:none;
          font-family: var(--sn-font);
          transition:all .2s; box-sizing:border-box;
        }
        .search-input::placeholder { color:#9CA3AF; }
        .search-input:focus { border-color:rgba(29,78,216,.45); background:#E5E7EB; }

        .live-dot { width:7px; height:7px; border-radius:50%; background:#22C55E; animation:pulse 1.8s ease-in-out infinite; }
        .price-badge { background:rgba(29,78,216,.12); color:#1D4ED8; padding:3px 11px; border-radius:999px; font-size:12px; font-weight:800; border:1px solid rgba(29,78,216,.2); }

        @media (max-width:480px) {
          .vybe-actions { flex-wrap:wrap; gap:8px !important; }
          .visit-btn, .like-btn { flex:1; justify-content:center; }
        }
      
        .filter-pill { display:inline-flex; align-items:center; gap:5px; padding:6px 14px; border-radius:999px; font-size:0.73rem; font-weight:700; cursor:pointer; border:1.5px solid var(--sn-border); background:var(--sn-bg); color:var(--sn-muted); transition:all 0.18s; font-family:var(--sn-font); }
        .filter-pill.active { background:var(--sn-primary); color:var(--sn-primary-fg); border-color:var(--sn-primary); }
        .filter-pill:hover:not(.active) { border-color:var(--sn-border-strong); background:var(--sn-page); }
      `}</style>

      <SiteNav />

      {/* ── SEARCH + FILTER ─────────────────────────────────── */}
      <div style={{ background:'var(--sn-bg)', borderBottom:'1px solid var(--sn-border)', position:'sticky', top:60, zIndex:90 }}>
        <div style={{ maxWidth:680, margin:'0 auto', padding:'0.75rem 4%' }}>

          {/* Search */}
          <div style={{ position:'relative', marginBottom:'0.6rem' }}>
            <Search size={15} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--sn-subtle)' }} />
            <input
              className="search-input"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('vybe.searchPlaceholder')}
              style={{ width:'100%', boxSizing:'border-box', paddingLeft:36, paddingRight:16, paddingTop:9, paddingBottom:9,
                border:'1.5px solid var(--sn-border)', borderRadius:12, fontSize:'0.85rem',
                background:'var(--sn-page)', color:'var(--sn-text)', outline:'none', fontFamily:'var(--sn-font)' }}
            />
          </div>

          {/* Filter tabs — All / Photos / Reels */}
          <div style={{ display:'flex', gap:6 }}>
            <button className={`filter-pill ${filter==='all'   ? 'active' : ''}`} onClick={() => setFilter('all')}>
              <TrendingUp size={12} /> {t('vybe.allPosts')}
            </button>
            <button className={`filter-pill ${filter==='photo' ? 'active' : ''}`} onClick={() => setFilter('photo')}>
              <ImageIcon size={12} /> {t('vybe.photos')}
            </button>
            <button className={`filter-pill ${filter==='video' ? 'active' : ''}`} onClick={() => setFilter('video')}>
              <Play size={12} /> {t('vybe.reels')}
            </button>
          </div>
        </div>
      </div>

      {/* ── FEED ──────────────────────────────────────────────── */}
      <div style={{ maxWidth:680, margin:'0 auto', padding:'0.75rem 4% 5rem' }}>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign:'center', padding:'5rem 0' }}>
            <Loader2 style={{ width:32, height:32, margin:'0 auto 12px', animation:'spin 1s linear infinite', color:'var(--sn-text)' }} />
            <p style={{ color:'var(--sn-subtle)', fontSize:14 }}>{t('vybe.loading')}</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div style={{ textAlign:'center', padding:'5rem 0' }}>
            <div style={{ width:56, height:56, borderRadius:'50%', background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.2)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
              <RefreshCw size={22} color="#EF4444" />
            </div>
            <p style={{ color:'var(--sn-subtle)', fontSize:14, marginBottom:16 }}>{error}</p>
            <button onClick={loadPosts} style={{ padding:'10px 24px', background:'var(--sn-primary)', color:'var(--sn-primary-fg)', border:'none', borderRadius:999, fontWeight:700, cursor:'pointer', fontFamily:'Inter,sans-serif', fontSize:14 }}>
              {t('vybe.retry')}
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <div style={{ textAlign:'center', padding:'5rem 0' }}>
            <div style={{ width:64, height:64, borderRadius:'20px', background:'rgba(29,78,216,0.08)', border:'1px solid rgba(29,78,216,0.15)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
              <Star size={28} color="rgba(29,78,216,0.4)" />
            </div>
            <p style={{ color:'var(--sn-subtle)', fontSize:14 }}>
              {search ? t('vybe.noResults') : t('vybe.noPosts')}
            </p>
            {search && (
              <button onClick={() => setSearch('')} style={{ marginTop:12, padding:'8px 20px', background:'var(--sn-bg)', border:'1px solid rgba(255,255,255,0.1)', color:'var(--sn-muted)', borderRadius:999, cursor:'pointer', fontFamily:'Inter,sans-serif', fontSize:13 }}>
                {t('vybe.allPosts')}
              </button>
            )}
          </div>
        )}

        {/* Posts */}
        {!loading && !error && filtered.length > 0 && (
          <>
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              {filtered.slice(0, visible).map(post => (
                <PostCard key={post.id} post={post} liked={liked.has(post.id)} onLike={() => toggleLike(post)}
                  onShare={() => sharePost(post)} copied={copiedId === post.id} ago={ago} t={t} />
              ))}
            </div>

            {/* Load more */}
            {visible < filtered.length && (
              <div style={{ textAlign:'center', marginTop:'1.5rem' }}>
                <button onClick={() => setVisible(v => v + 12)}
                  style={{ padding:'11px 32px', background:'var(--sn-bg)', border:'1.5px solid #E2E8F0', color:'var(--sn-muted)', borderRadius:999, cursor:'pointer', fontFamily:'Inter,sans-serif', fontSize:14, fontWeight:600, transition:'all .2s' }}
                  onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor='rgba(29,78,216,.4)'; (e.currentTarget as HTMLElement).style.color='#1D4ED8' }}
                  onMouseOut={e  => { (e.currentTarget as HTMLElement).style.borderColor='var(--sn-border)'; (e.currentTarget as HTMLElement).style.color='#6B7280' }}>
                  {t('vybe.loadMore')} · {filtered.length - visible} {t('vybe.totalPosts').toLowerCase()}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <SiteFooter />
    </main>
  )
}

// ── POST CARD ─────────────────────────────────────────────────
type PostCardProps = {
  post: FeedPost
  liked: boolean
  onLike: () => void
  onShare: () => void
  copied: boolean
  ago: (d: string) => string
  t: (k: string, vars?: Record<string, string | number>) => string
}

function PostCard({ post, liked, onLike, onShare, copied, ago, t }: PostCardProps) {
  const content  = getContent(post)
  const likes    = getLikes(post)
  const initials = (post.shop_name || 'TX').split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase()
  const video    = isVideo(post)
  const isNew    = (Date.now() - new Date(post.created_at).getTime()) < 3600000 * 6

  return (
    <article className="vybe-card">

      {/* ── Shop header ── */}
      <div style={{ display:'flex', alignItems:'center', gap:'0.7rem', padding:'0.9rem 1rem 0' }}>

        {/* Logo */}
        <div style={{ width:42, height:42, borderRadius:12, flexShrink:0, overflow:'hidden',
          background:'var(--sn-bg)',
          border:'1.5px solid rgba(29,78,216,0.2)',
          display:'flex', alignItems:'center', justifyContent:'center' }}>
          {post.shop_logo ? (
            <Image src={post.shop_logo} alt={initials} width={42} height={42} style={{ objectFit:'cover', width:'100%', height:'100%' }} />
          ) : (
            <span style={{ fontSize:13, fontWeight:800, color:'var(--sn-text)', letterSpacing:'-0.02em' }}>{initials}</span>
          )}
        </div>

        {/* Name + meta */}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
            <span style={{ fontSize:14, fontWeight:700, color:'var(--sn-text)', letterSpacing:'-0.01em' }}>
              {post.shop_name || t('vybe.seller')}
            </span>
            {/* Verified badge */}
            {post.is_verified !== false && (
              <span style={{ display:'inline-flex', alignItems:'center', gap:2, background:'rgba(5,150,105,0.12)', border:'1px solid rgba(5,150,105,0.2)', color:'#10B981', fontSize:'0.58rem', fontWeight:700, padding:'1px 6px', borderRadius:999, letterSpacing:'0.04em' }}>
                <ShieldCheck size={8} /> {t('vybe.verified')}
              </span>
            )}
            {/* New badge */}
            {isNew && (
              <span style={{ background:'rgba(29,78,216,0.15)', color:'var(--sn-text)', fontSize:'0.55rem', fontWeight:800, padding:'1px 6px', borderRadius:999, letterSpacing:'0.06em', border:'1px solid rgba(29,78,216,0.2)' }}>
                {t('vybe.newPost')}
              </span>
            )}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:2 }}>
            <Clock size={9} color="#9CA3AF" />
            <span style={{ fontSize:11, color:'var(--sn-subtle)' }}>{ago(post.created_at)}</span>
            {post.category && (
              <><span style={{ color:'var(--sn-border-strong)' }}>·</span>
              <span style={{ fontSize:11, color:'var(--sn-subtle)' }}>{post.category}</span></>
            )}
          </div>
        </div>

        {/* Tag */}
        {post.tag && (
          <span style={{ fontSize:10, fontWeight:700, color:'var(--sn-text)', background:'rgba(29,78,216,0.10)', padding:'3px 9px', borderRadius:999, flexShrink:0, border:'1px solid rgba(29,78,216,0.15)', letterSpacing:'0.02em' }}>
            #{post.tag}
          </span>
        )}
      </div>

      {/* ── Caption ── */}
      {content && (
        <div style={{ padding:'0.65rem 1rem 0' }}>
          <p style={{ fontSize:14, color:'var(--sn-muted)', lineHeight:1.65, margin:0, letterSpacing:'-0.005em' }}>
            {content}
          </p>
        </div>
      )}

      {/* ── Price ── */}
      {post.price && post.price > 0 && (
        <div style={{ padding:'0.5rem 1rem 0' }}>
          <span className="price-badge">{fmtTZS(post.price)}</span>
        </div>
      )}

      {/* ── Media ── */}
      {post.media_url && (
        <div style={{ marginTop:'0.75rem', position:'relative', background:'var(--sn-page)', borderRadius:12, overflow:'hidden' }}>
          {video ? (
            <video src={post.media_url} controls playsInline muted style={{ width:'100%', maxHeight:520, display:'block', borderRadius:12 }} />
          ) : (
            <Image src={post.media_url} alt={content || t('vybe.noImage')} width={680} height={680}
              style={{ width:'100%', height:'auto', maxHeight:520, objectFit:'contain', display:'block', borderRadius:12 }} />
          )}
        </div>
      )}

      {/* ── Actions — Like + Share + Visit Shop + View Product ── */}
      <div className="vybe-actions" style={{ display:'flex', alignItems:'center', gap:10, padding:'0.75rem 1rem 0.9rem', marginTop:'0.6rem', borderTop:'1px solid var(--sn-border)' }}>

        {/* Like button */}
        <button className={`like-btn ${liked ? 'liked' : ''}`} onClick={onLike} aria-label={liked ? t('vybe.liked') : t('vybe.like')}>
          <Heart size={14} style={{ fill: liked ? '#EF4444' : 'none', transition:'fill .15s' }} />
          <span>{likes > 0 ? likes : t('vybe.like')}</span>
        </button>

        {/* Share button */}
        <button className="like-btn" onClick={onShare} aria-label={t('vybe.sharePost')}>
          <Share2 size={13} />
          <span>{copied ? t('vybe.linkCopied') : t('vybe.sharePost')}</span>
        </button>

        {/* Spacer */}
        <div style={{ flex:1 }} />

        {/* View Product — only when this post is linked to a specific product */}
        {post.product_id && post.store_id && (
          <Link href={`/store/${post.store_id}?product=${post.product_id}`} className="visit-btn" aria-label={t('vybe.viewProduct')}>
            <ShoppingBag size={12} />
            {t('vybe.viewProduct')}
          </Link>
        )}

        {/* Visit Shop — only if store exists */}
        {post.store_id && (
          <Link href={`/store/${post.store_id}`} className="visit-btn" aria-label={`${t('vybe.visitShop')}: ${post.shop_name}`}>
            <Store size={12} />
            {t('vybe.visitShop')}
          </Link>
        )}
      </div>

    </article>
  )
}
