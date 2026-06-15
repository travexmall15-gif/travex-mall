'use client'

import { useState, useEffect } from 'react'
import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { sb, type FeedPost, ago, fmtTZS } from '@/lib/supabase'
import { Heart, ExternalLink } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const UNI_TABS = ['All', 'ARU', 'UDSM', 'UDOM', 'TIA']

export default function VybePage() {
  const [posts, setPosts] = useState<FeedPost[]>([])
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [liked, setLiked] = useState<Set<string>>(new Set())

  useEffect(() => { loadPosts() }, [filter])

  async function loadPosts() {
    setLoading(true)
    let q = sb.from('feed_posts').select('*').order('created_at', { ascending: false }).limit(24)
    if (filter !== 'All') q = q.eq('university_abbr', filter)
    const { data, error: fetchErr } = await q
    if (fetchErr) { setError('Imeshindwa kupakia posts. Jaribu tena.'); setLoading(false); return }
    setPosts(data || [])
    setLoading(false)
  }

  async function toggleLike(post: FeedPost) {
    const isLiked = liked.has(post.id)
    setLiked(prev => { const n = new Set(prev); isLiked ? n.delete(post.id) : n.add(post.id); return n })
    await sb.from('feed_posts').update({ likes_count: post.likes_count + (isLiked ? -1 : 1) }).eq('id', post.id)
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, likes_count: p.likes_count + (isLiked ? -1 : 1) } : p))
  }

    if (error) return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#07010E' }}>
      <div style={{ textAlign: 'center', color: '#fff' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
        <p style={{ color: 'rgba(255,255,255,0.55)', marginBottom: '1rem' }}>{error}</p>
        <button onClick={() => { setError(null); loadPosts() }} style={{ padding: '0.75rem 1.5rem', background: '#C9A84C', color: '#0F172A', border: 'none', borderRadius: '999px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Retry</button>
      </div>
    </main>
  )

  return (
    <main className="min-h-screen" style={{ background: '#07010E' }}>
      <SiteNav />
      <div className="pt-20 pb-16">
        <div className="mx-auto max-w-6xl px-4 py-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            ✦ Social <span style={{ color: '#C9A84C' }}>Vybe</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)' }} className="text-sm">Campus social commerce feed</p>
        </div>
        <div className="mx-auto max-w-6xl px-4 mb-8">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {UNI_TABS.map(tab => (
              <button key={tab} onClick={() => setFilter(tab)}
                className="px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all"
                style={{ background: filter === tab ? '#C9A84C' : 'rgba(255,255,255,0.08)', color: filter === tab ? '#0D1B3E' : 'rgba(255,255,255,0.6)', border: filter === tab ? 'none' : '1px solid rgba(255,255,255,0.1)' }}>
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-4">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => <div key={i} className="rounded-xl overflow-hidden animate-pulse" style={{ background: 'rgba(255,255,255,0.05)', height: '320px' }} />)}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-4xl mb-4">✦</div>
              <p style={{ color: 'rgba(255,255,255,0.4)' }}>No posts yet</p>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
              {posts.map(post => (
                <div key={post.id} className="break-inside-avoid rounded-xl overflow-hidden mb-4 border" style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)' }}>
                  {post.media_url && <Image src={post.media_url} alt={post.caption} width={400} height={300} className="w-full object-cover" />}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: '#C9A84C', color: '#0D1B3E' }}>✦</div>
                      {post.university_abbr && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(13,27,62,0.8)', color: '#C9A84C' }}>{post.university_abbr}</span>}
                      <span className="ml-auto text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{ago(post.created_at)}</span>
                    </div>
                    <p className="text-sm leading-relaxed mb-3" style={{ color: 'rgba(255,255,255,0.7)' }}>{post.caption}</p>
                    {post.price && <div className="inline-block px-3 py-1 rounded-full text-sm font-bold mb-3" style={{ background: 'rgba(201,168,76,0.15)', color: '#C9A84C' }}>{fmtTZS(post.price)}</div>}
                    <div className="flex items-center gap-3 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                      <button onClick={() => toggleLike(post)} className="flex items-center gap-1.5 text-sm transition-colors" style={{ color: liked.has(post.id) ? '#ef4444' : 'rgba(255,255,255,0.4)' }}>
                        <Heart className="h-4 w-4" fill={liked.has(post.id) ? '#ef4444' : 'none'} /> {post.likes_count}
                      </button>
                      <Link href={`/store/${post.store_id}`} className="ml-auto flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: 'rgba(13,27,62,0.8)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.2)' }}>
                        <ExternalLink className="h-3 w-3" /> Visit Shop
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <SiteFooter />
    </main>
  )
}
