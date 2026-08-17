'use client'
import { useState, useRef, useEffect } from 'react'
import { X, Send, Loader2, Sparkles } from 'lucide-react'

type Msg = { role: 'user' | 'bot'; content: string }

export function AIChatWidget({
  storeId, shopName, shopCategory, welcomeMessage
}: {
  storeId: string; shopName: string; shopCategory?: string; welcomeMessage?: string
}) {
  const [open, setOpen]   = useState(false)
  const [msgs, setMsgs]   = useState<Msg[]>([{
    role: 'bot',
    content: welcomeMessage || `👋 Habari! Mimi ni **360 AI** — msaidizi wa duka la **${shopName}**.\n\nNinaweza kukusaidia:\n• 🛍️ Kupata bidhaa\n• 💰 Kuangalia bei\n• 📦 Kuuliza kuhusu delivery\n• 💬 Kuwasiliana na seller\n\nUnaweza kuniuliza nini?`
  }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs, loading])

  const send = async (text?: string) => {
    const msg = (text || input).trim()
    if (!msg || loading) return
    setInput('')
    const newMsgs = [...msgs, { role: 'user' as const, content: msg }]
    setMsgs(newMsgs)
    setLoading(true)
    try {
      const res = await fetch('/api/ai-chat-aria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          messages: msgs.slice(-6).map(m => ({ role: m.role === 'bot' ? 'assistant' : 'user', content: m.content })),
          storeId,
          shopName,
          shopCategory,
          mode: 'store',
        }),
      })
      const data = await res.json()
      setMsgs([...newMsgs, { role: 'bot', content: data.reply || 'Samahani, jaribu tena.' }])
    } catch {
      setMsgs([...newMsgs, { role: 'bot', content: '❌ Tatizo limetokea. Jaribu tena.' }])
    }
    setLoading(false)
  }

  const QUICK = ['Bei gani?', 'Mna delivery?', 'Niwasiliane na seller', 'Bidhaa zipi mna?']

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button onClick={() => setOpen(true)}
          style={{ position:'fixed', bottom:80, right:16, width:52, height:52, borderRadius:'50%', background:'var(--sn-bg)', boxShadow:'0 6px 20px rgba(13,27,62,0.4)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, transition:'transform .2s' }}
          onMouseOver={e => (e.currentTarget as HTMLElement).style.transform='scale(1.1)'}
          onMouseOut={e  => (e.currentTarget as HTMLElement).style.transform='scale(1)'}>
          <Sparkles size={22} color="#1D4ED8" />
          <div style={{ position:'absolute', top:0, right:0, width:14, height:14, background:'var(--sn-primary)', borderRadius:'50%', border:'2.5px solid #fff', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <span style={{ fontSize:'7px', fontWeight:900, color:'#fff' }}>AI</span>
          </div>
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div style={{ position:'fixed', bottom:70, right:12, width:'min(340px,92vw)', height:'min(480px,75vh)', background:'var(--sn-bg)', borderRadius:20, boxShadow:'0 16px 48px rgba(13,27,62,0.22)', display:'flex', flexDirection:'column', zIndex:300, overflow:'hidden', border:'1.5px solid #E2E8F0' }}>

          {/* Header */}
          <div style={{ background:'var(--sn-bg)', padding:'12px 14px', display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
            <div style={{ width:34, height:34, borderRadius:10, background:'var(--sn-bg)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Sparkles size={17} color="#1D4ED8" />
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:'0.82rem', fontWeight:800, color:'var(--sn-text)' }}>360 AI</div>
              <div style={{ fontSize:'0.62rem', color:'var(--sn-subtle)' }}>Customer Care · {shopName}</div>
            </div>
            <button onClick={() => setOpen(false)}
              style={{ background:'rgba(255,255,255,0.1)', border:'none', borderRadius:'50%', width:28, height:28, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <X size={14} color="#fff" />
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex:1, overflowY:'auto', padding:'10px 12px', display:'flex', flexDirection:'column', gap:8, background:'#F8FAFF' }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ display:'flex', justifyContent: m.role==='user' ? 'flex-end' : 'flex-start' }}>
                {m.role === 'bot' && (
                  <div style={{ width:26, height:26, borderRadius:8, background:'var(--sn-bg)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginRight:6, marginTop:2 }}>
                    <Sparkles size={12} color="#1D4ED8" />
                  </div>
                )}
                <div style={{ maxWidth:'78%', padding:'8px 11px', borderRadius: m.role==='user' ? '14px 14px 3px 14px' : '3px 14px 14px 14px', background: m.role==='user' ? '#0D1B3E' : '#fff', color: m.role==='user' ? '#fff' : '#0F172A', fontSize:'0.8rem', lineHeight:1.55, boxShadow:'0 1px 3px rgba(15,23,42,0.07)', border: m.role==='bot' ? '1px solid #E2E8F0' : 'none', whiteSpace:'pre-wrap' }}>
                  {m.content.replace(/\*\*(.*?)\*\*/g, '$1')}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                <div style={{ width:26, height:26, borderRadius:8, background:'var(--sn-bg)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Sparkles size={12} color="#1D4ED8" />
                </div>
                <div style={{ background:'var(--sn-bg)', border:'1px solid #E2E8F0', borderRadius:'3px 14px 14px 14px', padding:'8px 12px', display:'flex', gap:4 }}>
                  {[0,1,2].map(i => <div key={i} style={{ width:6, height:6, borderRadius:'50%', background:'#CBD5E1', animation:`bounce .8s ease ${i*.15}s infinite` }} />)}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick prompts (first message only) */}
          {msgs.length === 1 && (
            <div style={{ padding:'6px 10px', display:'flex', gap:5, flexWrap:'wrap', borderTop:'1px solid #F1F5F9', background:'var(--sn-bg)' }}>
              {QUICK.map((q,i) => (
                <button key={i} onClick={() => send(q)}
                  style={{ padding:'4px 10px', background:'#F8FAFF', border:'1.5px solid #E2E8F0', borderRadius:999, fontSize:'0.68rem', fontWeight:600, color:'#0D1B3E', cursor:'pointer', fontFamily:"'Inter',sans-serif", transition:'all .15s' }}
                  onMouseOver={e => { (e.currentTarget as HTMLElement).style.background='#0D1B3E'; (e.currentTarget as HTMLElement).style.color='#fff' }}
                  onMouseOut={e  => { (e.currentTarget as HTMLElement).style.background='#F8FAFF'; (e.currentTarget as HTMLElement).style.color='#0D1B3E' }}>
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding:'8px 10px', borderTop:'1px solid #E2E8F0', display:'flex', gap:8, alignItems:'center', background:'var(--sn-bg)', flexShrink:0 }}>
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key==='Enter' && send()}
              placeholder="Andika swali lako..."
              style={{ flex:1, padding:'8px 12px', border:'1.5px solid #E2E8F0', borderRadius:12, fontSize:'0.8rem', fontFamily:"'Inter',sans-serif", outline:'none', background:'#F8FAFF', color:'var(--sn-text)' }}
              onFocus={e => (e.target.style.borderColor='#0D1B3E')}
              onBlur={e  => (e.target.style.borderColor='var(--sn-border)')} />
            <button onClick={() => send()} disabled={!input.trim() || loading}
              style={{ width:34, height:34, borderRadius:'50%', background: input.trim() ? '#0D1B3E' : 'var(--sn-border)', border:'none', cursor: input.trim() ? 'pointer':'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .2s', flexShrink:0 }}>
              <Send size={14} color={input.trim() ? '#1D4ED8' : '#94A3B8'} />
            </button>
          </div>
          <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}`}</style>
        </div>
      )}
    </>
  )
}
