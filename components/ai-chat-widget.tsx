'use client'
import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, Loader2 } from 'lucide-react'

type Msg = { role: 'user' | 'bot'; content: string }

export function AIChatWidget({ storeId, shopName, welcomeMessage }: { storeId: string; shopName: string; welcomeMessage?: string }) {
  const [open, setOpen]     = useState(false)
  const [msgs, setMsgs]     = useState<Msg[]>([
    { role: 'bot', content: welcomeMessage || `Hi! I am Aria, the AI assistant for ${shopName}. I can help you find products, check prices, and place orders. What are you looking for?` }
  ])
  const [input, setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId]         = useState(() => Math.random().toString(36).slice(2))
  const [convState, setConvState] = useState<any>({})
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
        body: JSON.stringify({ store_id: storeId, message: msg, session_id: sessionId, history: msgs, conv_state: convState })
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
                  <div style={{ width:24, height:24, borderRadius:'50%', flexShrink:0, marginRight:6, overflow:'hidden' }}>
                    <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="12" fill="#6366F1"/>
                      <circle cx="12" cy="27" r="10" fill="#818CF8"/>
                      <circle cx="12" cy="9.5" r="5.5" fill="#FDE8D0"/>
                      <path d="M7 8 Q7.5 4 12 4 Q16.5 4 17 8 Q16.5 5.5 12 5.5 Q7.5 5.5 7 8Z" fill="#7C3AED"/>
                      <ellipse cx="10" cy="9.5" rx=".8" ry="1" fill="#1E1B4B"/>
                      <ellipse cx="14" cy="9.5" rx=".8" ry="1" fill="#1E1B4B"/>
                    </svg>
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
              placeholder="Uliza kuhusu bidhaa, bei, au order..."
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

      {/* Toggle button — Aria avatar */}
      <button onClick={()=>setOpen(o=>!o)} data-ai-chat-toggle
        style={{
          position:'fixed', bottom:16, right:16, width:54, height:54,
          borderRadius:'50%', background:'linear-gradient(135deg,#6366F1,#8B5CF6)',
          border:'3px solid #fff', cursor:'pointer', boxShadow:'0 8px 24px rgba(99,102,241,0.45)',
          display:'flex', alignItems:'center', justifyContent:'center',
          zIndex:1000, overflow:'hidden', padding:0,
        }}>
        {open ? (
          <X size={20} color="#fff" />
        ) : (
          <svg viewBox="0 0 54 54" width="54" height="54" xmlns="http://www.w3.org/2000/svg">
            <circle cx="27" cy="27" r="27" fill="#6366F1"/>
            <circle cx="27" cy="64" r="22" fill="#818CF8"/>
            <circle cx="27" cy="22" r="12" fill="#FDE8D0"/>
            <path d="M15 19 Q17 10 27 10 Q37 10 39 19 Q37 13 27 13 Q17 13 15 19Z" fill="#7C3AED"/>
            <path d="M15 24 Q13 34 17 38 Q15 30 16 25Z" fill="#7C3AED"/>
            <path d="M39 24 Q41 34 37 38 Q39 30 38 25Z" fill="#7C3AED"/>
            <ellipse cx="23" cy="22" rx="2" ry="2.4" fill="#1E1B4B"/>
            <ellipse cx="31" cy="22" rx="2" ry="2.4" fill="#1E1B4B"/>
            <path d="M22 29 Q27 33 32 29" stroke="#E97070" strokeWidth="2" strokeLinecap="round" fill="none"/>
          </svg>
        )}
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
