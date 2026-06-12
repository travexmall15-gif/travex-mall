'use client'

import { use, useState, useEffect } from 'react'
import { SiteNav } from '@/components/site-nav'
import { sb, type CampusStore, type CampusProduct, type CampusOrder, fmtTZS } from '@/lib/supabase'
import { ShieldCheck, MessageCircle, Bot, Package, X, Plus, Minus, ShoppingCart, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function StorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [store, setStore] = useState<CampusStore | null>(null)
  const [products, setProducts] = useState<CampusProduct[]>([])
  const [orders, setOrders] = useState<CampusOrder[]>([])
  const [tab, setTab] = useState<'products' | 'chat' | 'orders'>('products')
  const [loading, setLoading] = useState(true)
  const [orderItem, setOrderItem] = useState<CampusProduct | null>(null)
  const [qty, setQty] = useState(1)
  const [orderName, setOrderName] = useState('')
  const [orderPhone, setOrderPhone] = useState('')
  const [orderLocation, setOrderLocation] = useState('')
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [chatMsgs, setChatMsgs] = useState<{ role: 'ai' | 'user'; text: string }[]>([
    { role: 'ai', text: "👋 Hi! I'm the AI assistant for this shop. Ask me about products, prices, or how to order!" }
  ])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: s } = await sb.from('campus_stores').select('*').eq('id', slug).single()
      setStore(s)
      if (s) {
        const { data: p } = await sb.from('campus_products').select('*').eq('store_id', s.id).order('created_at', { ascending: false })
        setProducts(p || [])
      }
      setLoading(false)
    }
    load()
  }, [slug])

  async function placeOrder() {
    if (!orderItem || !orderName || !orderPhone || !store) return
    const total = (orderItem.price || 0) * qty
    await sb.from('campus_orders').insert({ store_id: store.id, product_id: orderItem.id, product_name: orderItem.name, customer_name: orderName, customer_phone: orderPhone, delivery_location: orderLocation, quantity: qty, total_price: total, status: 'pending' })
    const wa = (store.whatsapp_number || '').replace(/\D/g, '')
    if (wa) {
      const msg = encodeURIComponent(`🛍️ *ORDER via Travex Mall*\n\n*Product:* ${orderItem.name}\n*Quantity:* ${qty}\n*Total:* ${fmtTZS(total)}\n\n*Customer:* ${orderName}\n*WhatsApp:* ${orderPhone}${orderLocation ? '\n*Delivery:* ' + orderLocation : ''}\n\n_Sent via Travex Campus Mall_ 🎓`)
      window.open(`https://wa.me/${wa}?text=${msg}`, '_blank')
    }
    // Add to local orders list
    setOrders(prev => [...prev, {
      id: Date.now().toString(),
      store_id: store.id,
      product_id: orderItem.id,
      product_name: orderItem.name,
      customer_name: orderName,
      customer_phone: orderPhone,
      delivery_location: orderLocation,
      quantity: qty,
      total_price: total,
      status: 'pending',
      created_at: new Date().toISOString()
    }])
    setOrderSuccess(true)
    // Reset form
    setOrderName('')
    setOrderPhone('')
    setOrderLocation('')
    setQty(1)
  }

  async function sendChat() {
    if (!chatInput.trim() || !store) return
    const msg = chatInput.trim()
    setChatInput('')
    setChatMsgs(prev => [...prev, { role: 'user', text: msg }])
    setChatLoading(true)
    try {
      const productList = products.length ? products.map(p => `- ${p.name}: ${p.price ? fmtTZS(p.price) : 'Free'}${p.description ? ' (' + p.description + ')' : ''}`).join('\n') : 'No products yet'
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 500, system: `You are the friendly AI assistant for "${store.store_name}" — a student shop at ${store.university_abbr} university on Travex Campus Mall. 

Products available:
${productList}

WhatsApp: ${store.whatsapp_number || 'Ask seller'}

Answer customer questions about products, prices, ordering and delivery. Be warm, helpful and concise. Respond in the same language the customer uses (English or Swahili). Keep replies under 4 sentences.`, messages: [{ role: 'user', content: msg }] })
      })
      const d = await res.json()
      setChatMsgs(prev => [...prev, { role: 'ai', text: d.content?.[0]?.text || 'Sorry, try again.' }])
    } catch { setChatMsgs(prev => [...prev, { role: 'ai', text: 'Connection error. Try again.' }]) }
    setChatLoading(false)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-offwhite"><div className="w-8 h-8 border-3 border-navy border-t-gold rounded-full animate-spin" /></div>
  if (!store) return <div className="min-h-screen flex items-center justify-center bg-offwhite"><div className="text-center"><div className="text-5xl mb-4">🏪</div><h2 className="text-xl font-bold text-navy mb-4">Shop Not Found</h2><Link href="/campus" className="text-gold font-bold">← Browse Marketplace</Link></div></div>

  const color = store.primary_color || '#0D1B3E'
  const initials = store.store_name.split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase()
  const wa = (store.whatsapp_number || '').replace(/\D/g, '')

  return (
    <main className="bg-offwhite min-h-screen">
      <nav className="fixed inset-x-0 top-0 z-50 h-16 flex items-center justify-between px-4 border-b backdrop-blur-md" style={{ background: 'rgba(13,27,62,0.9)', borderColor: 'rgba(255,255,255,0.1)' }}>
        <Link href={`/campus/${(store.university_abbr || 'aru').toLowerCase()}`} className="flex items-center gap-2 text-sm text-white/60 hover:text-gold transition-colors">
          <ArrowLeft className="h-4 w-4" /> {store.university_abbr}
        </Link>
        <span className="font-bold text-white text-sm">TRAVEX <span style={{ color: '#C9A84C' }}>MALL</span></span>
        <div className="w-16" />
      </nav>

      {/* Banner */}
      <div className="relative h-56 pt-16" style={{ background: `linear-gradient(135deg, ${color}, #1B3A6B)` }}>
        {store.banner && <img src={store.banner} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />}
      </div>

      {/* Identity card */}
      <div className="mx-auto max-w-3xl px-4">
        <div className="bg-white rounded-xl shadow-lg p-6 -mt-12 relative z-10 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-xl border-4 border-white shadow-md flex items-center justify-center font-bold text-white text-xl flex-shrink-0 -mt-10"
              style={{ background: color }}>
              {store.logo ? <img src={store.logo} alt="" className="w-full h-full object-cover rounded-lg" /> : initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-xl font-bold text-navy" style={{ fontFamily: 'Playfair Display, serif' }}>{store.store_name}</h1>
                {store.is_verified && <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-600 font-semibold flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Verified</span>}
              </div>
              <div className="flex gap-2 flex-wrap mb-3">
                {store.university_abbr && <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(124,58,237,0.1)', color: '#7C3AED' }}>🎓 {store.university_abbr}</span>}
                {store.category && <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(201,168,76,0.1)', color: '#92741a' }}>{store.category}</span>}
              </div>
              {store.description && <p className="text-gray-500 text-sm mb-4">{store.description}</p>}
              <div className="flex gap-3">
                {wa && <a href={`https://wa.me/${wa}`} target="_blank" className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white" style={{ background: '#25D366' }}><MessageCircle className="h-4 w-4" /> WhatsApp</a>}
                <button onClick={() => setTab('chat')} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white" style={{ background: '#0D1B3E' }}><Bot className="h-4 w-4" /> AI Assistant</button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl overflow-hidden border border-gray-100 mb-6">
          <div className="grid grid-cols-3 border-b border-gray-100">
            {([['products', '🛍️ Products'], ['chat', '🤖 AI Chat'], ['orders', `📦 Orders (${orders.length})`]] as const).map(([key, label]) => (
              <button key={key} onClick={() => setTab(key)}
                className="py-3 text-sm font-semibold transition-all"
                style={{ background: tab === key ? '#0D1B3E' : 'white', color: tab === key ? 'white' : '#6B7280' }}>
                {label}
              </button>
            ))}
          </div>

          {/* Products */}
          {tab === 'products' && (
            <div className="p-4">
              {products.length === 0 ? (
                <div className="text-center py-12"><Package className="h-10 w-10 text-gray-300 mx-auto mb-3" /><p className="text-gray-400 text-sm">No products listed yet</p></div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {products.map(p => (
                    <div key={p.id} className="rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-all">
                      {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-36 object-cover" /> : <div className="w-full h-36 flex items-center justify-center text-3xl" style={{ background: '#F8F9FC' }}>📦</div>}
                      <div className="p-3">
                        <div className="font-semibold text-navy text-sm mb-1">{p.name}</div>
                        {p.description && <div className="text-gray-400 text-xs line-clamp-2 mb-2">{p.description}</div>}
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-navy text-sm">{p.price ? fmtTZS(p.price) : 'Free'}</span>
                          <button onClick={() => { setOrderItem(p); setQty(1); setOrderSuccess(false) }}
                            className="text-xs font-bold px-3 py-1.5 rounded-lg text-white" style={{ background: '#0D1B3E' }}>Order</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Chat */}
          {tab === 'chat' && (
            <div className="flex flex-col" style={{ height: '400px' }}>
              <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: '#fafafa' }}>
                {chatMsgs.map((m, i) => (
                  <div key={i} className={`max-w-[85%] p-3 rounded-xl text-sm leading-relaxed ${m.role === 'user' ? 'ml-auto text-white' : 'bg-white border border-gray-100 text-navy'}`}
                    style={m.role === 'user' ? { background: '#0D1B3E' } : {}}>
                    {m.text}
                  </div>
                ))}
                {chatLoading && <div className="bg-white border border-gray-100 p-3 rounded-xl text-sm text-gray-400 italic max-w-[85%]">Thinking...</div>}
              </div>
              <div className="p-3 border-t border-gray-100 flex gap-2">
                <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()}
                  placeholder="Ask about products, prices..." className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none" />
                <button onClick={sendChat} className="px-4 py-2 rounded-lg text-sm font-bold text-white" style={{ background: '#0D1B3E' }}>Send</button>
              </div>
            </div>
          )}

          {/* Orders */}
          {tab === 'orders' && (
            <div className="p-4">
              {orders.length === 0 ? (
                <div className="text-center py-12"><ShoppingCart className="h-10 w-10 text-gray-300 mx-auto mb-3" /><p className="text-gray-400 text-sm">No orders yet</p></div>
              ) : (
                <div className="space-y-3">
                  {orders.map(o => (
                    <div key={o.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50">
                      <div><div className="font-semibold text-navy text-sm">{o.product_name}</div><div className="text-gray-400 text-xs">Qty: {o.quantity} · {o.total_price ? fmtTZS(o.total_price) : '—'}</div></div>
                      <span className="text-xs px-2 py-1 rounded-full font-bold" style={{ background: 'rgba(217,119,6,0.1)', color: '#D97706' }}>⏳ Pending</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Order Modal */}
      {orderItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={e => e.target === e.currentTarget && setOrderItem(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-navy" style={{ fontFamily: 'Playfair Display, serif' }}>Place Order</h3>
              <button onClick={() => setOrderItem(null)}><X className="h-5 w-5 text-gray-400" /></button>
            </div>
            {orderSuccess ? (
              <div className="p-8 text-center">
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="font-bold text-navy text-lg mb-2">Order Sent!</h3>
                <p className="text-gray-500 text-sm mb-6">Your order for <strong>{orderItem.name}</strong> has been sent to the seller on WhatsApp.</p>
                <button onClick={() => { setOrderItem(null); setTab('orders') }} className="px-6 py-2.5 rounded-lg font-bold text-sm text-white" style={{ background: '#0D1B3E' }}>View Orders →</button>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#F8F9FC' }}>
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xl" style={{ background: '#E5E7EB' }}>📦</div>
                  <div><div className="font-semibold text-navy text-sm">{orderItem.name}</div><div className="text-gray-400 text-xs">{orderItem.price ? fmtTZS(orderItem.price) : 'Free'}</div></div>
                </div>
                <input value={orderName} onChange={e => setOrderName(e.target.value)} placeholder="Your full name *" className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none" />
                <input value={orderPhone} onChange={e => setOrderPhone(e.target.value)} placeholder="Your WhatsApp number *" className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none" />
                <input value={orderLocation} onChange={e => setOrderLocation(e.target.value)} placeholder="Delivery location (hostel, room)" className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none" />
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-navy">Quantity:</span>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center"><Minus className="h-4 w-4" /></button>
                    <span className="font-bold text-navy w-6 text-center">{qty}</span>
                    <button onClick={() => setQty(q => q + 1)} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center"><Plus className="h-4 w-4" /></button>
                  </div>
                </div>
                {orderItem.price && (
                  <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: '#F8F9FC' }}>
                    <span className="text-sm font-semibold text-gray-500">Total</span>
                    <span className="font-bold text-navy">{fmtTZS(orderItem.price * qty)}</span>
                  </div>
                )}
                <button onClick={placeOrder} disabled={!orderName || !orderPhone}
                  className="w-full py-3 rounded-xl font-bold text-sm text-white disabled:opacity-50 transition-all"
                  style={{ background: '#0D1B3E' }}>
                  📦 Place Order via WhatsApp
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
