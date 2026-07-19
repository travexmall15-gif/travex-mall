'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { SiteNav } from '@/components/site-nav'
import { sb } from '@/lib/supabase'
import { MessageSquare, Store, Search, Loader2 } from 'lucide-react'

type Conversation = {
  id: string
  store_id: string
  store_name: string
  store_logo: string | null
  last_message: string
  last_time: string
  unread: number
  user_id: string
}

export default function MessagesPage() {
  const router = useRouter()
  const [convos,   setConvos]  = useState<Conversation[]>([])
  const [loading,  setLoading] = useState(true)
  const [search,   setSearch]  = useState('')
  const [userId,   setUserId]  = useState<string | null>(null)

  useEffect(() => {
    sb.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) { router.replace('/auth'); return }
      setUserId(session.user.id)

      // Load conversations
      const { data } = await sb
        .from('conversations')
        .select('*')
        .or(`buyer_id.eq.${session.user.id},seller_id.eq.${session.user.id}`)
        .order('updated_at', { ascending: false })

      setConvos(data || [])
      setLoading(false)
    })
  }, [router])

  const filtered = convos.filter(c =>
    c.store_name?.toLowerCase().includes(search.toLowerCase())
  )

  function timeAgo(d: string) {
    const diff = Date.now() - new Date(d).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1)  return 'now'
    if (m < 60) return `${m}m`
    if (m < 1440) return `${Math.floor(m/60)}h`
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }

  return (
    <main style={{ minHeight: '100vh', background: '#F8FAFF', paddingTop: 108, fontFamily: "'Inter',sans-serif" }}>
      <SiteNav />

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '1.25rem 5% 4rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0D1B3E', letterSpacing: '-0.025em' }}>Messages</h1>
          {convos.length > 0 && (
            <span style={{ background: '#EF4444', color: '#fff', fontSize: '0.65rem', fontWeight: 800, padding: '2px 8px', borderRadius: 999 }}>
              {convos.filter(c => c.unread > 0).length} unread
            </span>
          )}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '1rem' }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search conversations..."
            style={{ width: '100%', boxSizing: 'border-box', padding: '0.7rem 1rem 0.7rem 2.5rem', border: '1.5px solid #E2E8F0', borderRadius: 12, fontSize: '0.85rem', fontFamily: "'Inter',sans-serif", outline: 'none', background: '#fff', transition: 'border-color 0.2s' }}
            onFocus={e => (e.target.style.borderColor = '#0D1B3E')}
            onBlur={e  => (e.target.style.borderColor = '#E2E8F0')} />
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <Loader2 size={28} color="#0D1B3E" style={{ animation: 'spin 1s linear infinite', margin: '0 auto', display: 'block' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '5rem 0' }}>
            <div style={{ width: 68, height: 68, borderRadius: 20, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <MessageSquare size={30} color="#6366F1" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0D1B3E', marginBottom: 8 }}>No messages yet</h3>
            <p style={{ fontSize: '0.82rem', color: '#94A3B8', marginBottom: 20, lineHeight: 1.6 }}>
              Visit a shop and start a conversation with a seller.
            </p>
            <Link href="/market" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#0D1B3E', color: '#fff', padding: '10px 22px', borderRadius: 999, fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>
              <Store size={14} /> Browse Market
            </Link>
          </div>
        )}

        {/* Conversation list */}
        {!loading && filtered.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {filtered.map(convo => (
              <Link key={convo.id} href={`/messages/${convo.id}`} style={{ textDecoration: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', background: '#fff', borderRadius: 14, border: `1.5px solid ${convo.unread > 0 ? '#DBEAFE' : '#F1F5F9'}`, transition: 'all 0.15s', cursor: 'pointer' }}
                  onMouseOver={e => (e.currentTarget as HTMLElement).style.background = '#F8FAFF'}
                  onMouseOut={e  => (e.currentTarget as HTMLElement).style.background = '#fff'}>

                  {/* Store avatar */}
                  <div style={{ width: 46, height: 46, borderRadius: 12, background: 'linear-gradient(135deg,#0D1B3E,#1B3A8A)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                    {convo.store_logo
                      ? <img src={convo.store_logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#C9A84C' }}>
                          {convo.store_name?.slice(0,2).toUpperCase() || 'SH'}
                        </span>
                    }
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: convo.unread > 0 ? 700 : 600, color: '#0F172A' }}>
                        {convo.store_name}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: '#94A3B8' }}>
                        {timeAgo(convo.last_time)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.78rem', color: convo.unread > 0 ? '#0F172A' : '#94A3B8', fontWeight: convo.unread > 0 ? 600 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80%' }}>
                        {convo.last_message}
                      </span>
                      {convo.unread > 0 && (
                        <span style={{ background: '#0D1B3E', color: '#fff', fontSize: '0.6rem', fontWeight: 800, padding: '2px 7px', borderRadius: 999, flexShrink: 0 }}>
                          {convo.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
