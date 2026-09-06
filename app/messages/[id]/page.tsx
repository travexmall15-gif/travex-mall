'use client'
import { useTranslation } from "@/hooks/useTranslation"

import { useState, useEffect, useRef, use } from 'react'
import { useRouter } from 'next/navigation'
import { sb } from '@/lib/supabase'
import { getCurrentBuyerId } from '@/lib/shop-likes'
import { ArrowLeft, Send, Store, Loader2, ShieldAlert } from 'lucide-react'

type Message = {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  created_at: string
}

export default function ChatPage({params }: { params: Promise<{ id: string }> }) {
  const { t } = useTranslation()
  const { id } = use(params)
  const router  = useRouter()
  const [messages,  setMessages]  = useState<Message[]>([])
  const [text,      setText]      = useState('')
  const [loading,   setLoading]   = useState(true)
  const [sending,   setSending]   = useState(false)
  const [userId,    setUserId]    = useState<string | null>(null)
  const [storeName, setStoreName] = useState('Shop')
  const [denied,    setDenied]    = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    ;(async () => {
      // Resolve the current visitor's id the same way the rest of the app
      // does (Supabase Auth session OR OTP-based customer session).
      const buyerId = await getCurrentBuyerId()
      const { data: { session } } = await sb.auth.getSession()
      const uid = session?.user?.id || buyerId
      setUserId(uid)

      // Load conversation info
      const { data: convo } = await sb
        .from('conversations')
        .select('*')
        .eq('id', id)
        .single()

      // Client-side authorization gate (defense in depth — the real
      // enforcement must live in Supabase RLS; this closes the obvious
      // exploitation path of just changing the URL's conversation id).
      if (!convo || (convo.buyer_id !== uid && convo.seller_id !== uid)) {
        setDenied(true)
        setLoading(false)
        return
      }

      if (convo) {setStoreName(convo.store_name || 'Shop')}

      // Load messages
      const { data } = await sb
        .from('messages')
        .select('*')
        .eq('conversation_id', id)
        .order('created_at', { ascending: true })
      setMessages(data || [])
      setLoading(false)

      // Mark as read
      await sb.from('conversations')
        .update({ unread: 0 })
        .eq('id', id)
    })()

    // Real-time subscription
    const channel = sb
      .channel(`messages-${id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${id}`,
      }, payload => {
        setMessages(prev => [...prev, payload.new as Message])
      })
      .subscribe()

    return () => { sb.removeChannel(channel) }
  }, [id, router])

  const send = async () => {
    if (!text.trim() || sending) {return}
    // Allow sending even without Supabase auth (custom auth users)
    const content = text.trim()
    setText('')
    setSending(true)

    // Optimistic update
    const temp: Message = {
      id: 'temp-' + Date.now(),
      conversation_id: id,
      sender_id: userId || 'anon',
      content,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, temp])

    await sb.from('messages').insert({
      conversation_id: id,
      sender_id: userId || 'anon',
      content,
    })
    await sb.from('conversations').update({
      last_message: content,
      updated_at: new Date().toISOString(),
    }).eq('id', id)

    setSending(false)
  }

  function timeStr(d: string) {
    return new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  }

  if (denied) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--sn-page)', fontFamily: 'var(--sn-font)', padding: '2rem' }}>
        <ShieldAlert size={40} color="var(--sn-subtle)" style={{ marginBottom: 12 }} />
        <p style={{ color: 'var(--sn-text)', fontWeight: 700, fontSize: '0.95rem', marginBottom: 6 }}>{t('messages.accessDeniedTitle')}</p>
        <p style={{ color: 'var(--sn-muted)', fontSize: '0.82rem', marginBottom: 20, textAlign: 'center' }}>{t('messages.accessDeniedDesc')}</p>
        <button onClick={() => router.push('/messages')}
          style={{ background: 'linear-gradient(135deg,#FF0080,#7800FF)', color: 'var(--sn-primary-fg)', border: 'none', borderRadius: 999, padding: '10px 22px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
          {t('messages.backToInbox')}
        </button>
      </main>
    )
  }

  return (
    <main style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--sn-page)', fontFamily: 'var(--sn-font)' }}>
      {/* Chat header */}
      <div style={{ background: 'var(--sn-bg)', borderBottom: '1px solid var(--sn-border)', padding: '118px 5% 12px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => router.back()}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 4, color: 'var(--sn-muted)' }}>
          <ArrowLeft size={20} />
        </button>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--sn-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Store size={16} color="#7800FF" />
        </div>
        <div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0D1B3E' }}>{storeName}</div>
          <div style={{ fontSize: '0.65rem', color: '#22C55E', fontWeight: 600 }}>● {t('messages.online')}</div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 5%', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <Loader2 size={24} color="#0D1B3E" style={{ animation: 'spin 1s linear infinite', margin: '0 auto', display: 'block' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--sn-subtle)', fontSize: '0.85rem' }}>
            {t('messages.noConversations') || 'Start the conversation! 👋'}
          </div>
        )}

        {messages.map((msg, i) => {
          const isMe = msg.sender_id === userId
          const showTime = i === 0 || (new Date(msg.created_at).getTime() - new Date(messages[i-1].created_at).getTime()) > 300000

          return (
            <div key={msg.id}>
              {showTime && (
                <div style={{ textAlign: 'center', fontSize: '0.65rem', color: '#CBD5E1', margin: '8px 0' }}>
                  {timeStr(msg.created_at)}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '72%',
                  padding: '10px 14px',
                  borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: isMe ? '#0D1B3E' : '#fff',
                  color: isMe ? '#fff' : '#0F172A',
                  fontSize: '0.875rem',
                  lineHeight: 1.5,
                  boxShadow: '0 1px 4px rgba(15,23,42,0.08)',
                  border: isMe ? 'none' : '1px solid #E2E8F0',
                }}>
                  {msg.content}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ background: 'var(--sn-bg)', borderTop: '1px solid #F1F5F9', padding: '12px 5%', display: 'flex', gap: 10, alignItems: 'flex-end' }}>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
          placeholder={t('messages.typeMessage')}
          rows={1}
          style={{ flex: 1, padding: '10px 14px', border: '1.5px solid #E2E8F0', borderRadius: 20, fontSize: '0.875rem', fontFamily: 'var(--sn-font)', outline: 'none', resize: 'none', maxHeight: 100, lineHeight: 1.5, transition: 'border-color 0.2s', background: 'var(--sn-page)' }}
          onFocus={e => (e.target.style.borderColor = '#0D1B3E')}
          onBlur={e  => (e.target.style.borderColor = 'var(--sn-border)')}
        />
        <button onClick={send} disabled={!text.trim() || sending}
          style={{ width: 42, height: 42, borderRadius: '50%', background: text.trim() ? '#0D1B3E' : 'var(--sn-border)', border: 'none', cursor: text.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
          <Send size={16} color={text.trim() ? '#7800FF' : '#94A3B8'} />
        </button>
      </div>
    </main>
  )
}
