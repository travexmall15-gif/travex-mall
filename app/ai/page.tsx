'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { SiteNav } from '@/components/site-nav'
import { sb } from '@/lib/supabase'
import { ArrowLeft, Send, Loader2, Sparkles, RotateCcw, ChevronRight } from 'lucide-react'

type Message = { role: 'user' | 'assistant'; content: string }

const QUICK_PROMPTS = [
  { icon: '🛍️', text: 'Help me find a product' },
  { icon: '📦', text: 'Track my order status' },
  { icon: '🏪', text: 'How do I open a shop?' },
  { icon: '⚡', text: 'Show me flash deals' },
  { icon: '👥', text: 'Explain Group Buy' },
  { icon: '💬', text: 'How do I message a seller?' },
  { icon: '📱', text: 'How does ShopNekt work?' },
  { icon: '🎓', text: 'What is Campus Market?' },
]

const SYSTEM_PROMPT = `You are ARIA — ShopNekt's AI Shopping Assistant. ShopNekt is a global digital marketplace built by QNEX360.

You help users with EVERYTHING on ShopNekt EXCEPT:
❌ Processing payments (direct the user to the Payment & Delivery page)
❌ Sharing or accessing live location (direct to Location settings)

You CAN help with:
✅ Finding products and shops
✅ Navigating the app (Home, Market, Campus, Vybe, Flash Deals, Group Buy)
✅ Explaining features (Social Vybe, Flash Deals, Group Buy, Business Market, Campus Market)
✅ Order status questions — direct to /orders
✅ Opening a shop — direct to /open-store
✅ Messaging sellers — direct to /messages
✅ Account and settings help
✅ Shopping recommendations
✅ Comparing products or deals
✅ Explaining how Group Buy works
✅ Shopping tips and advice
✅ Explaining payment options (Full Escrow, Item Only, On Delivery) — but NOT processing them
✅ General shopping questions

ShopNekt Features:
- Business Market: verified shops for businesses and retailers
- Campus Market: students can sell to fellow students at universities
- Social Vybe: social commerce — like posts, discover products
- Flash Deals: limited-time discounts with countdown timers
- Group Buy: buy together with others to unlock bulk discounts
- Messages: in-app chat between buyers and sellers
- ShopNekt Move: logistics and delivery service

Tone: Friendly, helpful, concise. Use emojis occasionally. Always guide users to the right page or feature.
Language: Respond in the same language the user writes in (English or Kiswahili).
Keep responses short and actionable unless user asks for details.`

export default function AIPage() {
  const router  = useRouter()
  const [msgs,     setMsgs]     = useState<Message[]>([])
  const [input,    setInput]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [userName, setUserName] = useState('there')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    sb.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const m = session.user.user_metadata
        setUserName(m?.display_name || m?.username || 'there')
      }
    })
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs, loading])

  const sendMessage = async (text?: string) => {
    const content = (text || input).trim()
    if (!content || loading) return
    setInput('')

    const newMsgs: Message[] = [...msgs, { role: 'user', content }]
    setMsgs(newMsgs)
    setLoading(true)

    try {
      const res = await fetch('/api/ai-chat-aria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMsgs,
          system: SYSTEM_PROMPT,
        }),
      })
      const data = await res.json()
      setMsgs([...newMsgs, { role: 'assistant', content: data.reply || 'Sorry, I could not respond.' }])
    } catch {
      setMsgs([...newMsgs, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }])
    }
    setLoading(false)
    inputRef.current?.focus()
  }

  const reset = () => { setMsgs([]); setInput('') }

  return (
    <div style={{ height:'100vh', display:'flex', flexDirection:'column', background:'#F8FAFF', fontFamily:"'Inter',sans-serif" }}>
      <SiteNav />

      {/* Header */}
      <div style={{ paddingTop:108, background:'#fff', borderBottom:'1px solid #F1F5F9', padding:'108px 5% 14px', display:'flex', alignItems:'center', gap:12, position:'sticky', top:0, zIndex:10, flexShrink:0 }}>
        <button onClick={() => router.back()}
          style={{ background:'none', border:'none', cursor:'pointer', display:'flex', padding:4, color:'#64748B' }}>
          <ArrowLeft size={20} />
        </button>
        <div style={{ width:40, height:40, borderRadius:12, background:'linear-gradient(135deg,#0D1B3E,#1B3A8A)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <Sparkles size={20} color="#C9A84C" />
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:'0.95rem', fontWeight:800, color:'#0D1B3E', letterSpacing:'-0.01em' }}>ARIA</div>
          <div style={{ fontSize:'0.65rem', color:'#22C55E', fontWeight:600 }}>● ShopNekt AI Assistant</div>
        </div>
        {msgs.length > 0 && (
          <button onClick={reset}
            style={{ background:'#F1F5F9', border:'none', borderRadius:10, padding:'7px 12px', cursor:'pointer', display:'flex', alignItems:'center', gap:5, fontSize:'0.75rem', fontWeight:600, color:'#64748B', fontFamily:"'Inter',sans-serif" }}>
            <RotateCcw size={13} /> New Chat
          </button>
        )}
      </div>

      {/* Chat area */}
      <div style={{ flex:1, overflowY:'auto', padding:'1rem 5%', display:'flex', flexDirection:'column', gap:12 }}>

        {/* Welcome screen */}
        {msgs.length === 0 && (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'1rem 0 1.5rem', animation:'fadeIn .4s ease' }}>
            <div style={{ width:72, height:72, borderRadius:22, background:'linear-gradient(135deg,#0D1B3E,#1B3A8A)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14, boxShadow:'0 8px 24px rgba(13,27,62,0.25)' }}>
              <Sparkles size={32} color="#C9A84C" />
            </div>
            <h2 style={{ fontSize:'1.25rem', fontWeight:900, color:'#0D1B3E', marginBottom:6, letterSpacing:'-0.025em' }}>
              Habari, {userName}! 👋
            </h2>
            <p style={{ fontSize:'0.82rem', color:'#64748B', textAlign:'center', lineHeight:1.6, marginBottom:'1.5rem', maxWidth:280 }}>
              I&apos;m ARIA — your ShopNekt shopping assistant. Ask me anything about products, orders, features, or shopping!
            </p>

            {/* Quick prompts */}
            <div style={{ width:'100%', display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8 }}>
              {QUICK_PROMPTS.map((p, i) => (
                <button key={i} onClick={() => sendMessage(p.text)}
                  style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 12px', background:'#fff', border:'1.5px solid #E2E8F0', borderRadius:12, cursor:'pointer', fontFamily:"'Inter',sans-serif", transition:'all .15s', textAlign:'left' }}
                  onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor='#0D1B3E'; (e.currentTarget as HTMLElement).style.background='#F8FAFF' }}
                  onMouseOut={e  => { (e.currentTarget as HTMLElement).style.borderColor='#E2E8F0';  (e.currentTarget as HTMLElement).style.background='#fff' }}>
                  <span style={{ fontSize:'1.1rem' }}>{p.icon}</span>
                  <span style={{ fontSize:'0.78rem', fontWeight:600, color:'#0F172A', lineHeight:1.3 }}>{p.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {msgs.map((msg, i) => (
          <div key={i} style={{ display:'flex', justifyContent: msg.role==='user'?'flex-end':'flex-start', gap:8 }}>
            {msg.role === 'assistant' && (
              <div style={{ width:32, height:32, borderRadius:10, background:'linear-gradient(135deg,#0D1B3E,#1B3A8A)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:2 }}>
                <Sparkles size={15} color="#C9A84C" />
              </div>
            )}
            <div style={{
              maxWidth:'78%', padding:'11px 14px',
              borderRadius: msg.role==='user' ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
              background: msg.role==='user' ? '#0D1B3E' : '#fff',
              color:      msg.role==='user' ? '#fff'    : '#0F172A',
              fontSize:'0.875rem', lineHeight:1.6,
              boxShadow:'0 1px 4px rgba(15,23,42,0.08)',
              border: msg.role==='user' ? 'none' : '1px solid #E2E8F0',
              whiteSpace:'pre-wrap',
            }}>
              {msg.content}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div style={{ display:'flex', gap:8 }}>
            <div style={{ width:32, height:32, borderRadius:10, background:'linear-gradient(135deg,#0D1B3E,#1B3A8A)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <Sparkles size={15} color="#C9A84C" />
            </div>
            <div style={{ padding:'12px 16px', background:'#fff', border:'1px solid #E2E8F0', borderRadius:'4px 18px 18px 18px', display:'flex', alignItems:'center', gap:5 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width:7, height:7, borderRadius:'50%', background:'#CBD5E1', animation:`bounce .9s ease ${i*0.15}s infinite` }} />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ background:'#fff', borderTop:'1px solid #F1F5F9', padding:'12px 5% 20px', flexShrink:0 }}>
        <div style={{ display:'flex', gap:8, alignItems:'flex-end', background:'#F8FAFF', border:'1.5px solid #E2E8F0', borderRadius:18, padding:'8px 8px 8px 14px', transition:'border-color .2s' }}
          onFocusCapture={e => (e.currentTarget as HTMLElement).style.borderColor='#0D1B3E'}
          onBlurCapture={e  => (e.currentTarget as HTMLElement).style.borderColor='#E2E8F0'}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
            placeholder="Ask ARIA anything..."
            rows={1}
            style={{ flex:1, border:'none', outline:'none', background:'transparent', fontSize:'0.875rem', fontFamily:"'Inter',sans-serif", resize:'none', lineHeight:1.5, color:'#0F172A', maxHeight:100 }}
          />
          <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
            style={{ width:38, height:38, borderRadius:12, background: input.trim()&&!loading ? '#0D1B3E' : '#E2E8F0', border:'none', cursor: input.trim()&&!loading ? 'pointer':'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all .2s' }}>
            {loading
              ? <Loader2 size={16} color="#94A3B8" style={{ animation:'spin 1s linear infinite' }} />
              : <Send size={15} color={input.trim() ? '#C9A84C' : '#94A3B8'} />}
          </button>
        </div>
        <p style={{ textAlign:'center', fontSize:'0.62rem', color:'#CBD5E1', marginTop:8 }}>
          ARIA by QNEX360 · Cannot process payments or access location
        </p>
      </div>

      <style>{`
        @keyframes spin   { to { transform: rotate(360deg) } }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  )
}
