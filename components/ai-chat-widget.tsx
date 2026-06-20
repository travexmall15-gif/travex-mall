'use client'
import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, Loader2 } from 'lucide-react'

type Msg = { role: 'user' | 'bot'; content: string }

export function AIChatWidget({ storeId, shopName }: { storeId: string; shopName: string }) {
  const [open, setOpen]     = useState(false)
  const [msgs, setMsgs]     = useState<Msg[]>([
    { role: 'bot', content: `Hi! 👋 I'm the AI assistant for ${shopName}. Ask me about products, prices, or how to order!` }
  ])
  const [input, setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId]         = useState(() => Math.random().toString(36).slice(2))
  const bottomRef           = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])

  async function send() {
    const msg = input.trim()
    if (!msg || loading) return
    setInput('')
    setMsgs(m => [...m, { role: 'user', content: msg }])
    setLoading(true)
    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ store_id: storeId, message: msg, session_id: sessionId, history: msgs })
      })
      const { reply } = await res.json()
      setMsgs(m => [...m, { role: 'bot', content: reply }])
    } catch {
      setMsgs(m => [...m, { role: 'bot', content: 'Sorry, try again! 😊' }])
    }
    setLoading(false)
  }

  return (
    <>
      {/* Chat window */}
      {open && (
        <div style={{
          position:'fixed', bottom:80, right:16, width:'min(340px,calc(100vw-32px))',
          background:'#fff', borderRadius:20, boxShadow:'0 20px 60px rgba(0,0,0,0.2)',
          border:'1px solid rgba(13,27,62,0.1)', zIndex:999, overflow:'hidden',
          fontFamily:"'Inter',sans-serif",
        }}>
          {/* Header */}
          <div style={{ background:'linear-gradient(135deg,#0D1B3E,#1B3A8A)', color:'#fff',
            padding:'12px 16px', display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:32, height:32, borderRadius:'50%',
              background:'rgba(255,255,255,0.15)', display:'flex',
              alignItems:'center', justifyContent:'center' }}>
              <Bot size={16} />
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, fontSize:13 }}>AI Assistant</div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.65)' }}>{shopName} • Online</div>
            </div>
            <button onClick={() => setOpen(false)}
              style={{ background:'none', border:'none', color:'rgba(255,255,255,0.7)',
                cursor:'pointer', padding:4 }}>
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div style={{ height:280, overflowY:'auto', padding:'12px 12px 4px',
            display:'flex', flexDirection:'column', gap:8 }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ display:'flex', justifyContent: m.role==='user'?'flex-end':'flex-start' }}>
                {m.role === 'bot' && (
                  <div style={{ width:24, height:24, borderRadius:'50%', flexShrink:0, marginRight:6,
                    background:'linear-gradient(135deg,#0D1B3E,#1B3A8A)',
                    display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Bot size={12} color="#C9A84C" />
                  </div>
                )}
                <div style={{
                  maxWidth:'78%', padding:'9px 13px', borderRadius:
                    m.role==='user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: m.role==='user' ? '#0D1B3E' : '#F8FAFF',
                  color: m.role==='user' ? '#fff' : '#0F172A',
                  fontSize:13, lineHeight:1.55,
                  border: m.role==='bot' ? '1px solid #E2E8F0' : 'none',
                }}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display:'flex', alignItems:'center', gap:6, color:'#64748B', fontSize:12 }}>
                <Loader2 size={13} style={{ animation:'spin 1s linear infinite' }} />
                Typing...
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding:'8px 12px 12px', borderTop:'1px solid #F1F5F9',
            display:'flex', gap:6 }}>
            <input value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&send()}
              placeholder="Ask about products, prices..."
              style={{ flex:1, padding:'9px 12px', border:'1.5px solid #E2E8F0',
                borderRadius:999, fontSize:13, outline:'none', fontFamily:'inherit' }} />
            <button onClick={send} disabled={!input.trim()||loading}
              style={{ width:36, height:36, borderRadius:'50%',
                background: input.trim()&&!loading ? '#0D1B3E' : '#E2E8F0',
                border:'none', cursor:'pointer', display:'flex',
                alignItems:'center', justifyContent:'center',
                transition:'all .15s', flexShrink:0 }}>
              <Send size={14} color={input.trim()&&!loading?'#C9A84C':'#94A3B8'} />
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button onClick={()=>setOpen(o=>!o)}
        style={{
          position:'fixed', bottom:16, right:16, width:52, height:52,
          borderRadius:'50%', background:'linear-gradient(135deg,#0D1B3E,#1B3A8A)',
          border:'none', cursor:'pointer', boxShadow:'0 8px 24px rgba(13,27,62,0.4)',
          display:'flex', alignItems:'center', justifyContent:'center',
          zIndex:1000, transition:'transform .2s',
        }}>
        {open ? <X size={22} color="#fff" /> : <MessageCircle size={22} color="#C9A84C" />}
        {!open && (
          <div style={{ position:'absolute', top:0, right:0, width:14, height:14,
            borderRadius:'50%', background:'#22C55E', border:'2px solid #fff',
            animation:'pulse 2s infinite' }} />
        )}
      </button>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.2)}}`}</style>
    </>
  )
}
