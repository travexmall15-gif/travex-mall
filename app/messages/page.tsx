'use client'
import { useTranslation } from '@/hooks/useTranslation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { sb } from '@/lib/supabase'
import { MessageSquare, Store, Search, Loader2, MessageCircle } from 'lucide-react'

type Conversation = {
  id: string
  store_id: string
  store_name: string
  store_logo: string | null
  last_message: string
  last_time: string
  unread: number
  buyer_id: string | null
  seller_id: string | null
}

export default function MessagesPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [convos,   setConvos]   = useState<Conversation[]>([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [authState, setAuthState] = useState<'loading'|'loggedIn'|'guest'>('loading')
  const [userId,   setUserId]   = useState<string | null>(null)

  useEffect(() => {
    // Try Supabase Auth first (email-registered buyers/sellers)
    sb.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id)
        setAuthState('loggedIn')
        const { data, error } = await sb
          .from('conversations')
          .select('*')
          .or(`buyer_id.eq.${session.user.id},seller_id.eq.${session.user.id}`)
          .order('updated_at', { ascending: false })
        if (!error) setConvos(data || [])
        setLoading(false)
        return
      }

      // Fallback: OTP customer session (localStorage)
      try {
        const raw = localStorage.getItem('sn_customer_session')
        if (raw) {
          const sess = JSON.parse(raw)
          if (sess?.id) {
            setUserId(sess.id)
            setAuthState('loggedIn')
            const { data, error } = await sb
              .from('conversations')
              .select('*')
              .or(`buyer_id.eq.${sess.id},seller_id.eq.${sess.id}`)
              .order('updated_at', { ascending: false })
            if (!error) setConvos(data || [])
            setLoading(false)
            return
          }
        }
      } catch {}

      // Check seller session (PIN auth)
      try {
        const raw = localStorage.getItem('travex_session')
        if (raw) {
          const sess = JSON.parse(raw)
          if (sess?.id) {
            setUserId(sess.id)
            setAuthState('loggedIn')
            const { data } = await sb
              .from('conversations')
              .select('*')
              .or(`buyer_id.eq.${sess.id},seller_id.eq.${sess.id}`)
              .order('updated_at', { ascending: false })
            setConvos(data || [])
            setLoading(false)
            return
          }
        }
      } catch {}

      setAuthState('guest')
      setLoading(false)
    }).catch(() => {
      setAuthState('guest')
      setLoading(false)
    })
  }, [])

  const filtered = convos.filter(c =>
    (c.store_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.last_message || '').toLowerCase().includes(search.toLowerCase())
  )

  const unreadCount = convos.filter(c => c.unread > 0).length

  function timeAgo(d: string) {
    if (!d) return ''
    const diff = Date.now() - new Date(d).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1)    return t('vybe.justNow') || 'now'
    if (m < 60)   return `${m}m`
    if (m < 1440) return `${Math.floor(m/60)}h`
    return new Date(d).toLocaleDateString('en-GB', { day:'numeric', month:'short' })
  }

  return (
    <main style={{ minHeight:'100vh', background:'#F8FAFF', paddingTop:108, fontFamily:"'Inter',sans-serif" }}>
      <SiteNav />
      <div style={{ maxWidth:560, margin:'0 auto', padding:'1.25rem 5% 4rem' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem' }}>
          <h1 style={{ fontSize:'1.25rem', fontWeight:800, color:'#0D1B3E', letterSpacing:'-0.025em' }}>
            {t('messages.title')}
          </h1>
          {unreadCount > 0 && (
            <span style={{ background:'#EF4444', color:'#fff', fontSize:'0.65rem', fontWeight:800, padding:'2px 8px', borderRadius:999 }}>
              {unreadCount} {t('messages.unread') || 'unread'}
            </span>
          )}
        </div>

        {/* Loading */}
        {(loading || authState === 'loading') && (
          <div style={{ textAlign:'center', padding:'4rem 0' }}>
            <Loader2 size={28} color="#0D1B3E" style={{ animation:'spin 1s linear infinite', margin:'0 auto', display:'block' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {/* Guest state — not signed in via Supabase Auth */}
        {!loading && authState === 'guest' && (
          <div style={{ textAlign:'center', padding:'4rem 0' }}>
            <div style={{ width:72, height:72, borderRadius:20, background:'#EEF2FF', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 18px' }}>
              <MessageCircle size={32} color="#6366F1" />
            </div>
            <h3 style={{ fontSize:'1.05rem', fontWeight:700, color:'#0D1B3E', marginBottom:8 }}>
              {t('messages.title')}
            </h3>
            <p style={{ fontSize:'0.82rem', color:'#9CA3AF', marginBottom:6, lineHeight:1.65, maxWidth:280, margin:'0 auto 16px' }}>
              {t('messages.emptyDesc')}
            </p>
            <p style={{ fontSize:'0.78rem', color:'#6B7280', marginBottom:20, lineHeight:1.6 }}>
              To message a seller, visit their store page and use the contact form. Sellers can be reached directly via WhatsApp.
            </p>
            <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
              <Link href="/market" style={{ display:'inline-flex', alignItems:'center', gap:6, background:'#fff', color:'#111827', padding:'10px 22px', borderRadius:999, fontWeight:700, fontSize:'0.82rem', textDecoration:'none' }}>
                <Store size={14} /> {t('messages.startShopping')}
              </Link>
              <Link href="/auth" style={{ display:'inline-flex', alignItems:'center', gap:6, background:'#F8FAFF', color:'#0D1B3E', border:'1.5px solid #E2E8F0', padding:'10px 22px', borderRadius:999, fontWeight:600, fontSize:'0.82rem', textDecoration:'none' }}>
                {t('authPage.signIn') || 'Sign In'}
              </Link>
            </div>
          </div>
        )}

        {/* Logged in — show search + conversations */}
        {!loading && authState === 'loggedIn' && (
          <>
            {/* Search */}
            <div style={{ position:'relative', marginBottom:'1rem' }}>
              <Search size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#9CA3AF' }} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder={t('common.search') + ' conversations...'}
                style={{ width:'100%', boxSizing:'border-box', padding:'0.7rem 1rem 0.7rem 2.5rem', border:'1.5px solid #E2E8F0', borderRadius:12, fontSize:'0.85rem', fontFamily:"'Inter',sans-serif", outline:'none', background:'#fff', transition:'border-color 0.2s' }}
                onFocus={e => (e.target.style.borderColor='#0D1B3E')}
                onBlur={e  => (e.target.style.borderColor='#E5E7EB')} />
            </div>

            {/* Empty conversations */}
            {filtered.length === 0 && (
              <div style={{ textAlign:'center', padding:'5rem 0' }}>
                <div style={{ width:68, height:68, borderRadius:20, background:'#EEF2FF', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
                  <MessageSquare size={30} color="#6366F1" />
                </div>
                <h3 style={{ fontSize:'1.1rem', fontWeight:700, color:'#0D1B3E', marginBottom:8 }}>
                  {search ? t('common.noResults') : t('messages.empty')}
                </h3>
                <p style={{ fontSize:'0.82rem', color:'#9CA3AF', marginBottom:20, lineHeight:1.6 }}>
                  {t('messages.emptyDesc')}
                </p>
                {!search && (
                  <Link href="/market" style={{ display:'inline-flex', alignItems:'center', gap:6, background:'#fff', color:'#111827', padding:'10px 22px', borderRadius:999, fontWeight:700, fontSize:'0.85rem', textDecoration:'none' }}>
                    <Store size={14} /> {t('messages.startShopping')}
                  </Link>
                )}
              </div>
            )}

            {/* Conversation list */}
            {filtered.length > 0 && (
              <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
                {filtered.map(convo => (
                  <Link key={convo.id} href={`/messages/${convo.id}`} style={{ textDecoration:'none' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 14px', background:'#fff', borderRadius:14, border:`1.5px solid ${convo.unread > 0 ? '#DBEAFE' : '#F3F4F6'}`, transition:'all 0.15s', cursor:'pointer' }}
                      onMouseOver={e => (e.currentTarget as HTMLElement).style.background='#F8FAFF'}
                      onMouseOut={e  => (e.currentTarget as HTMLElement).style.background='#fff'}>

                      {/* Store avatar */}
                      <div style={{ width:46, height:46, borderRadius:12, background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, overflow:'hidden' }}>
                        {convo.store_logo
                          ? <img src={convo.store_logo} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} loading="lazy" />
                          : <span style={{ fontSize:'0.85rem', fontWeight:800, color:'#1D4ED8' }}>
                              {(convo.store_name||'SH').slice(0,2).toUpperCase()}
                            </span>
                        }
                      </div>

                      {/* Content */}
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:3 }}>
                          <span style={{ fontSize:'0.875rem', fontWeight:convo.unread>0?700:600, color:'#111827' }}>
                            {convo.store_name || 'Shop'}
                          </span>
                          <span style={{ fontSize:'0.68rem', color:'#9CA3AF' }}>
                            {convo.last_time ? timeAgo(convo.last_time) : ''}
                          </span>
                        </div>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                          <span style={{ fontSize:'0.78rem', color:convo.unread>0?'#0F172A':'#94A3B8', fontWeight:convo.unread>0?600:400, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:'80%' }}>
                            {convo.last_message || t('messages.typeMessage')}
                          </span>
                          {convo.unread > 0 && (
                            <span style={{ background:'#fff', color:'#111827', fontSize:'0.6rem', fontWeight:800, padding:'2px 7px', borderRadius:999, flexShrink:0 }}>
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
          </>
        )}
      </div>
      <SiteFooter />
    </main>
  )
}
