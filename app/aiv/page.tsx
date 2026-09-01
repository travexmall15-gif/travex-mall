'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'
import { useLang } from '@/lib/lang-context'
import type { ConversationContext } from '@/lib/shopnekt-ai/data-core'
import { ArrowLeft, Send, Trash2, Copy, Check, RotateCcw, Search, ArrowLeftRight, Store, Package } from 'lucide-react'

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
    if (!text.trim() || busy) {return}
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

      if (!res.body) {throw new Error('no stream')}
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) {break}
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) {continue}
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
  const retryLast = () => { const lastUser = [...messages].reverse().find(m => m.role === 'user'); if (lastUser) {send(lastUser.text)} }

  const suggestions = [
    { key: 'suggest1', icon: Search },
    { key: 'suggest3', icon: ArrowLeftRight },
    { key: 'suggest4', icon: Store },
    { key: 'suggest7', icon: Package },
  ] as const

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--sn-page)', fontFamily: 'var(--sn-font)' }}>
      {/* Header — this route is excluded from the global SiteNav (see components/app-shell.tsx), so it owns its own compact bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 5%', borderBottom: '1px solid var(--sn-border)', background: 'var(--sn-bg)', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sn-muted)', display: 'flex', padding: 4 }}>
          <ArrowLeft size={19} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--sn-text)' }}>{t('ai.title')}</div>
        </div>
        {messages.length > 0 && (
          <button onClick={clear} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sn-subtle)', display: 'flex', padding: 4 }} title={t('ai.clearChat')}>
            <Trash2 size={17} />
          </button>
        )}
      </div>

      {/* Conversation */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 5%' }}>
        {messages.length === 0 ? (
          <div style={{ maxWidth: 480, margin: '2.5rem auto 0', textAlign: 'center' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--sn-text)', marginBottom: 8 }}>{t('ai.startPrompt')}</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--sn-subtle)', marginBottom: '1.75rem' }}>{t('ai.welcomeDesc')}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {suggestions.map(({ key, icon: Icon }) => (
                <button key={key} onClick={() => send(t(`ai.${key}`))}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6, padding: '12px 14px', borderRadius: 14, border: '1.5px solid var(--sn-border)', background: 'var(--sn-bg)', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--sn-font)' }}>
                  <Icon size={16} color="var(--sn-primary)" />
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--sn-text)' }}>{t(`ai.${key}`)}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {messages.map(m => (
              <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '85%', padding: '10px 14px', borderRadius: 16,
                  background: m.role === 'user' ? 'var(--sn-text)' : 'var(--sn-bg)',
                  color: m.role === 'user' ? 'var(--sn-page)' : 'var(--sn-text)',
                  border: m.role === 'assistant' ? '1.5px solid var(--sn-border)' : 'none',
                  fontSize: '0.88rem', lineHeight: 1.55, whiteSpace: 'pre-wrap',
                }}>
                  {m.text || (m.status === 'streaming' ? '···' : '')}
                </div>

                {m.role === 'assistant' && m.status === 'done' && (
                  <div style={{ display: 'flex', gap: 10, marginTop: 5, paddingLeft: 4 }}>
                    <button onClick={() => copy(m)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sn-subtle)', display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.68rem' }}>
                      {copiedId === m.id ? <><Check size={11} /> {t('ai.copied')}</> : <><Copy size={11} /> {t('ai.copy')}</>}
                    </button>
                    {m.isFallback && (
                      <span style={{ fontSize: '0.65rem', color: 'var(--sn-subtle)', fontStyle: 'italic' }}>{t('ai.devFallbackNote')}</span>
                    )}
                  </div>
                )}

                {m.role === 'assistant' && m.status === 'error' && (
                  <button onClick={retryLast} style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 5, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sn-primary)', fontSize: '0.72rem', fontWeight: 700 }}>
                    <RotateCcw size={11} /> {t('ai.retry')}
                  </button>
                )}

                {m.confirmationRequired && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button onClick={() => send(t('ai.confirmYes'), true)}
                      style={{ padding: '7px 16px', borderRadius: 10, background: 'var(--sn-text)', color: 'var(--sn-page)', border: 'none', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}>
                      {t('ai.confirmYes')}
                    </button>
                    <button onClick={() => setMessages(prev => prev.map(x => x.id === m.id ? { ...x, confirmationRequired: false } : x))}
                      style={{ padding: '7px 16px', borderRadius: 10, background: 'var(--sn-page)', color: 'var(--sn-muted)', border: '1.5px solid var(--sn-border)', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}>
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
      <div style={{ padding: '10px 5% calc(10px + env(safe-area-inset-bottom))', borderTop: '1px solid var(--sn-border)', background: 'var(--sn-bg)' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !busy) {send(input)} }}
            placeholder={t('ai.placeholder')}
            style={{ flex: 1, padding: '11px 16px', borderRadius: 999, border: '1.5px solid var(--sn-input-border)', background: 'var(--sn-input)', color: 'var(--sn-text)', fontSize: '0.88rem', outline: 'none' }}
          />
          {busy ? (
            <button onClick={stop} style={{ width: 40, height: 40, borderRadius: '50%', background: '#EF4444', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: '#fff' }} />
            </button>
          ) : (
            <button onClick={() => send(input)} disabled={!input.trim()}
              style={{ width: 40, height: 40, borderRadius: '50%', background: input.trim() ? 'var(--sn-text)' : 'var(--sn-border)', border: 'none', color: 'var(--sn-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() ? 'pointer' : 'default', flexShrink: 0 }}>
              <Send size={16} />
            </button>
          )}
        </div>
      </div>
    </main>
  )
}
