'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'
import { useLang } from '@/lib/lang-context'
import type { ConversationContext } from '@/lib/shopnekt-ai/data-core'
import { ArrowLeft, Send, Square, Copy, Check, RotateCcw, Plus } from 'lucide-react'

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  text: string
  status?: 'streaming' | 'done' | 'error'
  data?: unknown
  toolCalled?: string
  confirmationRequired?: boolean
  isFallback?: boolean
}

const uid = () => Math.random().toString(36).slice(2)

// Fixed neutral palette for this page only — white / light gray / black,
// independent of ShopNekt's brand accent color, to match a plain,
// ChatGPT-like reading experience.
const C = {
  page: '#FFFFFF',
  panel: '#F7F7F8',
  border: '#E5E5E5',
  text: '#111111',
  muted: '#6E6E80',
  bubble: '#F0F0F1',
}

export default function ShopNektAIPage() {
  const { t } = useTranslation()
  const { lang } = useLang()
  const router = useRouter()

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const contextRef = useRef<ConversationContext | null>(null)
  const turnRef = useRef(1)
  const abortRef = useRef<AbortController | null>(null)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = useCallback(async (text: string, confirming = false) => {
    if (!text.trim() || busy) return
    setBusy(true)

    const userMsg: ChatMessage = { id: uid(), role: 'user', text }
    const assistantId = uid()
    setMessages(prev => [...prev, ...(confirming ? [] : [userMsg]), { id: assistantId, role: 'assistant', text: '', status: 'streaming' }])
    setInput('')

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch('/api/shopnekt-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text, context: contextRef.current, applicationLanguage: lang,
          turn: turnRef.current, confirmingPreviousAction: confirming,
        }),
        signal: controller.signal,
      })

      if (!res.body) throw new Error('no stream')
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const event = JSON.parse(line.slice(6))

          if (event.type === 'delta') {
            fullText += event.text
            setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, text: fullText } : m))
          } else if (event.type === 'done') {
            contextRef.current = event.context
            turnRef.current += 2
            setMessages(prev => prev.map(m => m.id === assistantId ? {
              ...m, status: 'done', data: event.response.data, toolCalled: event.response.toolCalled,
              confirmationRequired: event.response.confirmationRequired,
              isFallback: event.response.modelPhrasing?.isFallback,
            } : m))
          } else if (event.type === 'error') {
            setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, status: 'error', text: t('ai.genericError') } : m))
          }
        }
      }
    } catch {
      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, status: 'error', text: t('ai.genericError') } : m))
    } finally {
      setBusy(false)
      abortRef.current = null
    }
  }, [busy, lang, t])

  const stop = () => abortRef.current?.abort()
  const clear = () => { setMessages([]); contextRef.current = null; turnRef.current = 1 }
  const copy = (msg: ChatMessage) => { navigator.clipboard.writeText(msg.text); setCopiedId(msg.id); setTimeout(() => setCopiedId(null), 1500) }
  const retryLast = () => { const lastUser = [...messages].reverse().find(m => m.role === 'user'); if (lastUser) send(lastUser.text) }

  // Guided starters: "buy" and "flash deals" send a real message
  // through the same orchestrator/intent system as free typing (no
  // separate fake flow) — "open a store" is a direct action link
  // since that's an existing real page, not a conversation.
  const buyStarter = lang === 'sw' ? 'Nataka kununua' : 'I want to buy something'
  const dealsStarter = lang === 'sw' ? 'kuna flash deals leo?' : 'any flash deals right now?'

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: C.page, fontFamily: 'var(--sn-font)', color: C.text }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 5%', borderBottom: `1px solid ${C.border}`, background: C.page, position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, display: 'flex', padding: 4 }}>
          <ArrowLeft size={18} />
        </button>
        <div style={{ flex: 1, fontWeight: 600, fontSize: '0.9rem', color: C.text }}>{t('ai.title')}</div>
        {messages.length > 0 && (
          <button onClick={clear} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, display: 'flex', padding: 4 }} title={t('ai.newChat')}>
            <Plus size={17} />
          </button>
        )}
      </div>

      {/* Conversation */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 5%' }}>
        {messages.length === 0 ? (
          <div style={{ maxWidth: 480, margin: '3rem auto 0', textAlign: 'center' }}>
            <div style={{ fontSize: '1.15rem', fontWeight: 600, color: C.text, marginBottom: '1.75rem' }}>{t('ai.startPrompt')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button onClick={() => send(buyStarter)}
                style={{ padding: '11px 16px', borderRadius: 10, border: `1px solid ${C.border}`, background: C.panel, cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--sn-font)', fontSize: '0.85rem', color: C.text }}>
                {t('ai.optionBuy')}
              </button>
              <Link href="/open-store"
                style={{ display: 'block', padding: '11px 16px', borderRadius: 10, border: `1px solid ${C.border}`, background: C.panel, textAlign: 'left', fontFamily: 'var(--sn-font)', fontSize: '0.85rem', color: C.text, textDecoration: 'none' }}>
                {t('ai.optionOpenStore')}
              </Link>
              <button onClick={() => send(dealsStarter)}
                style={{ padding: '11px 16px', borderRadius: 10, border: `1px solid ${C.border}`, background: C.panel, cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--sn-font)', fontSize: '0.85rem', color: C.text }}>
                {t('ai.optionFlashDeals')}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 22 }}>
            {messages.map(m => (
              <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                {m.role === 'user' ? (
                  <div style={{ maxWidth: '80%', padding: '9px 14px', borderRadius: 16, background: C.bubble, color: C.text, fontSize: '0.9rem', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
                    {m.text}
                  </div>
                ) : (
                  <div style={{ width: '100%', fontSize: '0.9rem', lineHeight: 1.65, whiteSpace: 'pre-wrap', color: C.text, minHeight: '1.4em' }}>
                    {m.text || (m.status === 'streaming' ? <span style={{ color: C.muted }}>···</span> : '')}
                  </div>
                )}

                {m.role === 'assistant' && m.status === 'done' && (
                  <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
                    <button onClick={() => copy(m)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.72rem' }}>
                      {copiedId === m.id ? <><Check size={12} /> {t('ai.copied')}</> : <><Copy size={12} /> {t('ai.copy')}</>}
                    </button>
                    {m.isFallback && (
                      <span style={{ fontSize: '0.7rem', color: C.muted }}>{t('ai.devFallbackNote')}</span>
                    )}
                  </div>
                )}

                {m.role === 'assistant' && m.status === 'error' && (
                  <button onClick={retryLast} style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6, background: 'none', border: 'none', cursor: 'pointer', color: C.text, fontSize: '0.78rem', fontWeight: 600 }}>
                    <RotateCcw size={12} /> {t('ai.retry')}
                  </button>
                )}

                {m.confirmationRequired && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <button onClick={() => send(t('ai.confirmYes'), true)}
                      style={{ padding: '7px 16px', borderRadius: 8, background: C.text, color: '#fff', border: 'none', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
                      {t('ai.confirmYes')}
                    </button>
                    <button onClick={() => setMessages(prev => prev.map(x => x.id === m.id ? { ...x, confirmationRequired: false } : x))}
                      style={{ padding: '7px 16px', borderRadius: 8, background: C.page, color: C.muted, border: `1px solid ${C.border}`, fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
                      {t('ai.confirmNo')}
                    </button>
                  </div>
                )}
              </div>
            ))}
            <div ref={endRef} />
          </div>
        )}
      </div>

      {/* Composer */}
      <div style={{ padding: '10px 5% calc(10px + env(safe-area-inset-bottom))', borderTop: `1px solid ${C.border}`, background: C.page }}>
        <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', gap: 8, alignItems: 'center', border: `1px solid ${C.border}`, borderRadius: 24, padding: '4px 4px 4px 16px', background: C.panel }}>
          <input
            value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !busy) send(input) }}
            placeholder={t('ai.placeholder')}
            style={{ flex: 1, border: 'none', background: 'transparent', color: C.text, fontSize: '0.88rem', outline: 'none', padding: '8px 0' }}
          />
          {busy ? (
            <button onClick={stop} style={{ width: 34, height: 34, borderRadius: '50%', background: C.text, border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
              <Square size={12} fill="#fff" />
            </button>
          ) : (
            <button onClick={() => send(input)} disabled={!input.trim()}
              style={{ width: 34, height: 34, borderRadius: '50%', background: input.trim() ? C.text : C.border, border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() ? 'pointer' : 'default', flexShrink: 0 }}>
              <Send size={15} />
            </button>
          )}
        </div>
      </div>
    </main>
  )
}
