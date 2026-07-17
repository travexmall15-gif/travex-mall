'use client'
import { T, useT } from '@/components/T'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { sb } from '@/lib/supabase'
import { Heart, Store, Loader2, Image as ImageIcon, Play } from 'lucide-react'

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

function getContent(post: FeedPost) {
  return post.content || post.post_text || post.caption || ''
}

function getLikes(post: FeedPost) {
  return post.likes_count || post.likes || 0
}

function isVideo(post: FeedPost) {
  if (post.media_type && post.media_type.includes('video')) return true
  if (post.media_url) {
    const url = post.media_url.toLowerCase()
    return url.includes('.mp4') || url.includes('.mov') || url.includes('.webm') || url.includes('video')
  }
  return false
}

export default function VybePage() {
  const [posts, setPosts]     = useState<FeedPost[]>([])
  const [mediaFilter, setMediaFilter] = useState<'all' | 'photo' | 'video'>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const [liked, setLiked]     = useState<Set<string>>(new Set())

  useEffect(() => { loadPosts() }, [])

  async function loadPosts() {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await sb
        .from('feed_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
      if (err) throw err
      setPosts(data || [])
    } catch {
      setError("Could not load posts.")
    } finally {
      setLoading(false)
    }
  }

  async function toggleLike(post: FeedPost) {
    const isLiked = liked.has(post.id)
    const newCount = getLikes(post) + (isLiked ? -1 : 1)
    setLiked(prev => { const n = new Set(prev); isLiked ? n.delete(post.id) : n.add(post.id); return n })
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, likes: newCount, likes_count: newCount } : p))
    await sb.from('feed_posts').update({ likes: newCount, likes_count: newCount }).eq('id', post.id)
  }

  const filtered = posts.filter(p => {
    if (mediaFilter === 'photo') return p.media_url && !isVideo(p)
    if (mediaFilter === 'video') return p.media_url && isVideo(p)
    return true
  })

  return (
    <main style={{ minHeight: '100vh', background: '#07010E', fontFamily: "'Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Inter:wght@300;400;500;600;700;800&display=swap');
        *{box-sizing:border-box}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .post-card{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;transition:border-color 0.2s;animation:fadeUp 0.3s ease}
        .post-card:hover{border-color:rgba(201,168,76,0.25)}
        .like-btn{display:flex;align-items:center;gap:5px;background:none;border:none;color:rgba(255,255,255,0.45);cursor:pointer;font-size:13px;font-weight:600;padding:6px 10px;border-radius:999px;transition:all 0.15s;font-family:'Inter',sans-serif}
        .like-btn:hover,.like-btn.liked{color:#EF4444}
        .like-btn.liked svg{fill:#EF4444}
        .filter-btn{padding:6px 16px;border-radius:999px;font-size:12px;font-weight:600;cursor:pointer;border:1px solid rgba(255,255,255,0.12);background:transparent;color:rgba(255,255,255,0.50);transition:all 0.15s;font-family:'Inter',sans-serif;display:inline-flex;align-items:center;gap:5px}
        .filter-btn.active{background:#C9A84C;border-color:#C9A84C;color:#0F172A}
        .visit-btn{display:inline-flex;align-items:center;gap:5px;background:#0D1B3E;color:#C9A84C;border:1px solid rgba(201,168,76,0.25);border-radius:8px;padding:5px 14px;font-size:11px;font-weight:700;text-decoration:none;transition:all 0.2s}
        .visit-btn:hover{background:#C9A84C;color:#0F172A}
      `}</style>

      <SiteNav />

      {/* HERO */}
      <div style={{ paddingTop: '64px', position: 'relative', overflow: 'hidden', background: 'linear-gradient(160deg, #030818 0%, #07010E 60%)' }}>
        <div style={{ position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: '80%', height: '200%', background: 'radial-gradient(ellipse at center, rgba(201,168,76,0.15) 0%, transparent 60%)', filter: 'blur(50px)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 800, margin: '0 auto', padding: '2.5rem 5% 1.5rem', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12, background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.30)', color: '#C9A84C', padding: '4px 14px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
            Live Feed
          </div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: '0.5rem' }}>
            Travex Social Vybe
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, marginBottom: '1.5rem' }}>
            {<T en="Products, offers and updates from verified Tanzania sellers" sw="Bidhaa, ofa na habari kutoka wauzaji waliohakikishwa Tanzania" />}
          </p>

          {/* Media type filter */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className={`filter-btn ${mediaFilter === 'all' ? 'active' : ''}`} onClick={() => setMediaFilter('all')}>
              All Posts
            </button>
            <button className={`filter-btn ${mediaFilter === 'photo' ? 'active' : ''}`} onClick={() => setMediaFilter('photo')}>
              <ImageIcon size={12} /> Photos
            </button>
            <button className={`filter-btn ${mediaFilter === 'video' ? 'active' : ''}`} onClick={() => setMediaFilter('video')}>
              <Play size={12} /> Reels
            </button>
          </div>
        </div>
      </div>

      {/* FEED */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '1.5rem 5% 5rem' }}>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <Loader2 style={{ width: 32, height: 32, margin: '0 auto 12px', animation: 'spin 1s linear infinite', color: '#C9A84C' }} />
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14 }}>{"Inapakia..."}</p>
          </div>

        ) : error ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <p style={{ color: 'rgba(255,255,255,0.40)', fontSize: 14, marginBottom: 16 }}>{error}</p>
            <button onClick={loadPosts} style={{ padding: '10px 24px', background: '#C9A84C', color: '#0F172A', border: 'none', borderRadius: 999, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>Retry</button>
          </div>

        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14 }}>{<T en="No posts yet." sw="Hakuna machapisho bado." />}</p>
          </div>

        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filtered.map(post => {
              const content  = getContent(post)
              const likesCount = getLikes(post)
              const isLiked  = liked.has(post.id)
              const initials = (post.shop_name || 'TX').split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase()
              const video    = isVideo(post)

              return (
                <div key={post.id} className="post-card">

                  {/* Shop header — logo + name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.85rem 1rem 0' }}>
                    {/* Logo */}
                    <div style={{ width: 38, height: 38, borderRadius: '10px', flexShrink: 0, background: 'linear-gradient(135deg, #0D1B3E, #1B3A8A)', border: '1.5px solid rgba(201,168,76,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {post.shop_logo ? (
                        <Image src={post.shop_logo} alt={initials} width={38} height={38} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                      ) : (
                        <span style={{ fontSize: 12, fontWeight: 800, color: '#C9A84C' }}>{initials}</span>
                      )}
                    </div>
                    {/* Name + time */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {post.shop_name || 'Travex Seller'}
                      </div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.30)', marginTop: 1 }}>
                        {ago(post.created_at)}{post.category ? ` · ${post.category}` : ''}
                      </div>
                    </div>
                    {/* Tag badge */}
                    {post.tag && (
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#C9A84C', background: 'rgba(201,168,76,0.12)', padding: '2px 8px', borderRadius: 999, flexShrink: 0 }}>
                        {post.tag}
                      </span>
                    )}
                  </div>

                  {/* Caption */}
                  {content && (
                    <div style={{ padding: '0.6rem 1rem 0' }}>
                      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.65, margin: 0 }}>{content}</p>
                    </div>
                  )}

                  {/* Price */}
                  {post.price && (
                    <div style={{ padding: '0.4rem 1rem 0' }}>
                      <span style={{ background: 'rgba(201,168,76,0.12)', color: '#C9A84C', padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 800 }}>
                        {fmtTZS(post.price)}
                      </span>
                    </div>
                  )}

                  {/* Media */}
                  {post.media_url && (
                    <div style={{ marginTop: '0.75rem', position: 'relative', background: '#000', maxHeight: 320, overflow: 'hidden' }}>
                      {video ? (
                        <video src={post.media_url} controls style={{ width: '100%', maxHeight: 320, display: 'block' }} />
                      ) : (
                        <Image src={post.media_url} alt="Post" width={720} height={320} style={{ width: '100%', height: 'auto', maxHeight: 320, objectFit: 'cover', display: 'block' }} />
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 1rem 0.85rem', borderTop: '1px solid rgba(255,255,255,0.07)', marginTop: '0.75rem' }}>
                    <button className={`like-btn ${isLiked ? 'liked' : ''}`} onClick={() => toggleLike(post)}>
                      <Heart size={14} style={{ fill: isLiked ? '#EF4444' : 'none' }} />
                      {likesCount > 0 ? likesCount : 'Like'}
                    </button>

                    {post.store_id && (
                      <Link href={`/store/${post.store_id}`} className="visit-btn">
                        <Store size={11} /> {<T en="Visit Shop" sw="Tembelea Duka" />}
                      </Link>
                    )}
                  </div>

                </div>
              )
            })}
          </div>
        )}
      </div>

      <SiteFooter />
    </main>
  )
}
