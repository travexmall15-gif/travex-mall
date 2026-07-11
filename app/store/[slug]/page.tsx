'use client'
import { SiteFooter } from '@/components/site-footer'

import Image from 'next/image'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { sb } from '@/lib/supabase'
import { SiteNav } from '@/components/site-nav'
import { ArrowLeft, MessageCircle, Package, ShoppingCart, X, Plus, Minus, MapPin, Tag, Star, CheckCircle, Loader2 } from 'lucide-react'
import { AIChatWidget } from '@/components/ai-chat-widget'

type Store = {
  id: string
  shop_name: string
  owner_name: string
  owner_phone: string | null
  shop_whatsapp: string | null
  shop_category: string | null
  shop_region: string | null
  shop_desc: string | null
  shop_color: string | null
  plan: string
  status: string
  auth_email: string | null
}

type Product = {
  id: string
  name: string
  price: number
  stock: number
  description: string | null
  category: string | null
  image_url: string | null
  cost_price: number | null
  store_id: string
}

const fmt = (n: number) => 'TZS ' + Number(n).toLocaleString('en-US')

export default function StorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [store, setStore]       = useState<Store | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading]   = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [cartItem, setCartItem] = useState<Product | null>(null)
  const [qty, setQty]           = useState(1)
  const [orderName, setOrderName]     = useState('')
  const [orderPhone, setOrderPhone]   = useState('')
  const [orderNotes, setOrderNotes]   = useState('')
  const [orderLocation, setOrderLocation] = useState('')
  const [placing, setPlacing]   = useState(false)
  const [success, setSuccess]   = useState(false)
  const [searchQ, setSearchQ]   = useState('')
  const [selCat, setSelCat]     = useState('All')

  useEffect(() => {
    async function load() {
      // Track store view
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ store_id: slug, event: 'view', source: document.referrer ? 'referral' : 'direct' })
      }).catch(() => {})
      // Try pending_payments (business market)
      const { data: shopData } = await sb
        .from('pending_payments')
        .select('*')
        .eq('id', slug)
        .eq('status', 'approved')
        .single()

      if (shopData) {
        setStore(shopData)
        const { data: prods } = await sb
          .from('campus_products')
          .select('*')
          .eq('store_id', shopData.id)
          .gt('stock', 0)
          .order('created_at', { ascending: false })
        setProducts(prods || [])
        setLoading(false)
        return
      }

      // Try campus_stores
      const { data: campusShop } = await sb
        .from('campus_stores')
        .select('*')
        .eq('id', slug)
        .eq('is_active', true)
        .single()

      if (campusShop) {
        setStore({
          id: campusShop.id,
          shop_name: campusShop.store_name,
          owner_name: campusShop.owner_name,
          owner_phone: campusShop.phone,
          shop_whatsapp: campusShop.whatsapp,
          shop_category: campusShop.category,
          shop_region: campusShop.university_abbr,
          shop_desc: campusShop.description,
          shop_color: null,
          plan: 'campus',
          status: 'approved',
          auth_email: null,
        })
        const { data: prods } = await sb
          .from('campus_products')
          .select('*')
          .eq('store_id', campusShop.id)
          .gt('stock', 0)
          .order('created_at', { ascending: false })
        setProducts(prods || [])
        setLoading(false)
        return
      }

      setNotFound(true)
      setLoading(false)
    }
    load()
  }, [slug])

  const openOrder = (p: Product) => {
    setCartItem(p)
    setQty(1)
    setOrderName('')
    setOrderPhone('')
    setOrderNotes('')
    setOrderLocation('')
    setSuccess(false)
  }

  const placeOrder = async () => {
    if (!cartItem || !orderName.trim() || !orderPhone.trim()) return
    setPlacing(true)

    const total = cartItem.price * qty

    await sb.from('campus_orders').insert({
      store_id: store!.id,
      product_id: cartItem.id,
      product_name: cartItem.name,
      customer_name: orderName.trim(),
      customer_phone: orderPhone.trim(),
      delivery_location: orderLocation.trim(),
      notes: orderNotes.trim(),
      quantity: qty,
      total_amount: total,
      total_price: total,
      status: 'pending',
    })

    // Also send WhatsApp to seller
    const wa = (store!.shop_whatsapp || store!.owner_phone || '').replace(/\D/g, '')
    if (wa) {
      const msg = encodeURIComponent(
        `🛍️ *Order Mpya!*\n\n` +
        `📦 Products: *${cartItem.name}*\n` +
        `🔢 Quantity: *${qty}*\n` +
        `💰 Total: *${fmt(total)}*\n\n` +
        `👤 Mteja: *${orderName}*\n` +
        `📱 Simu: *${orderPhone}*\n` +
        (orderLocation ? `📍 Location: *${orderLocation}*\n` : '') +
        (orderNotes ? `📝 Notes: ${orderNotes}\n` : '') +
        `\n_From Travex Mall_`
      )
      window.open(`https://wa.me/${wa}?text=${msg}`, '_blank')
    }

    setPlacing(false)
    setSuccess(true)
  }

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category).filter(Boolean) as string[]))]

  const filtered = products.filter(p => {
    const matchQ = !searchQ || p.name.toLowerCase().includes(searchQ.toLowerCase())
    const matchC = selCat === 'All' || p.category === selCat
    return matchQ && matchC
  })

  const isPremium = store?.plan === 'premium'
  const accentColor = store?.shop_color || (isPremium ? '#C9A84C' : '#3B82F6')
  const initials = (store?.shop_name || '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const wa = (store?.shop_whatsapp || store?.owner_phone || '').replace(/\D/g, '')

  // ── Loading ──
  if (loading) return (
    <main style={{ minHeight: '100vh', background: '#060C1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: '#fff' }}>
        <Loader2 style={{ width: 36, height: 36, margin: '0 auto 12px', animation: 'spin 1s linear infinite', color: '#C9A84C' }} />
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14 }}>Loading store...</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </main>
  )

  // ── Not found ──
  if (notFound || !store) return (
    <main style={{ minHeight: '100vh', background: '#060C1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: '#fff', padding: '2rem' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🏪</div>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.5rem', marginBottom: 8 }}>Store Not Found</h2>
        <p style={{ color: 'rgba(255,255,255,0.45)', marginBottom: 24 }}>This store may have been removed or is not yet active.</p>
        <Link href="/market" style={{ background: '#C9A84C', color: '#0F172A', padding: '0.85rem 2rem', borderRadius: 999, fontWeight: 700, textDecoration: 'none', fontSize: 14 }}>
          ← Back to Market
        </Link>
      </div>
    </main>
  )

  return (
    <main style={{ minHeight: '100vh', background: '#060C1A', fontFamily: "'Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Inter:wght@300;400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .prod-card{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;transition:all 0.25s;cursor:pointer}
        .prod-card:hover{transform:translateY(-4px);border-color:${accentColor}55;box-shadow:0 16px 40px rgba(0,0,0,0.4)}
        .cat-btn{padding:6px 14px;border-radius:999px;font-size:12px;font-weight:600;cursor:pointer;border:1px solid rgba(255,255,255,0.12);background:transparent;color:rgba(255,255,255,0.55);transition:all 0.15s;font-family:'Inter',sans-serif}
        .cat-btn.active{background:${accentColor};border-color:${accentColor};color:${isPremium?'#0F172A':'#fff'}}
        .modal-bg{position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:999;display:flex;align-items:flex-end;justify-content:center;backdrop-filter:blur(6px)}
        @media(min-width:600px){.modal-bg{align-items:center}}
        .modal{background:#0D1B3E;border:1px solid rgba(255,255,255,0.10);border-radius:20px 20px 0 0;padding:1.5rem;width:100%;max-width:480px;max-height:90vh;overflow-y:auto;animation:fadeUp 0.3s ease}
        @media(min-width:600px){.modal{border-radius:20px}}
        .form-inp{width:100%;padding:10px 14px;background:rgba(255,255,255,0.07);border:1.5px solid rgba(255,255,255,0.12);border-radius:10px;color:#fff;font-size:14px;outline:none;font-family:'Inter',sans-serif;transition:all 0.15s}
        .form-inp:focus{border-color:${accentColor};background:rgba(255,255,255,0.10)}
        .form-inp::placeholder{color:rgba(255,255,255,0.30)}
        .qty-btn{width:32px;height:32px;border-radius:50%;border:1.5px solid rgba(255,255,255,0.20);background:rgba(255,255,255,0.07);color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px;transition:all 0.15s}
        .qty-btn:hover{background:rgba(255,255,255,0.15)}
        .search-inp{width:100%;padding:10px 16px 10px 40px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.10);border-radius:999px;color:#fff;font-size:13px;outline:none;font-family:'Inter',sans-serif}
        .search-inp::placeholder{color:rgba(255,255,255,0.30)}
        .search-inp:focus{border-color:${accentColor};background:rgba(255,255,255,0.10)}
        @media(max-width:640px){.prod-grid{grid-template-columns:repeat(2,1fr)!important}}
      `}</style>

      {/* ── HERO ── */}
      <div style={{ position: 'relative', overflow: 'hidden', paddingBottom: '2rem',
        background: `linear-gradient(160deg, #030818 0%, #060C1A 40%, #0A1228 100%)` }}>
        {/* Glow */}
        <div style={{ position: 'absolute', top: '-30%', right: '-10%', width: '60%', height: '120%',
          background: `radial-gradient(ellipse at center, ${accentColor}33 0%, transparent 65%)`,
          filter: 'blur(40px)', pointerEvents: 'none' }} />

        {/* Nav */}
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto',
          padding: '1.25rem 5% 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/market" style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
            color: 'rgba(255,255,255,0.55)', textDecoration: 'none', fontSize: 13, fontWeight: 600,
            padding: '8px 16px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.10)',
            background: 'rgba(255,255,255,0.05)', transition: 'all 0.15s' }}>
            <ArrowLeft size={14} /> Back to Market
          </Link>
          {wa && (
            <a href={`https://wa.me/${wa}`} target="_blank"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#fff',
                textDecoration: 'none', fontSize: 13, fontWeight: 600, padding: '8px 16px',
                borderRadius: 999, background: '#25D366' }}>
              <MessageCircle size={14} /> WhatsApp
            </a>
          )}
        </div>

        {/* Shop info */}
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto',
          padding: '2.5rem 5% 0', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{ width: 80, height: 80, borderRadius: 20, flexShrink: 0,
            background: `linear-gradient(135deg, ${accentColor}, ${accentColor}88)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 900,
            color: isPremium ? '#0F172A' : '#fff',
            boxShadow: `0 8px 32px ${accentColor}44` }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            {/* Plan badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 8,
              background: `${accentColor}22`, border: `1px solid ${accentColor}44`,
              color: accentColor, padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
              {isPremium ? '🥇 Premium Shop' : store.plan === 'campus' ? '🎓 Campus Shop' : '🥈 Basic Shop'}
            </div>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(1.5rem,4vw,2.2rem)',
              fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: '0.5rem' }}>
              {store.shop_name}
            </h1>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              {store.shop_category && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13,
                  color: 'rgba(255,255,255,0.55)' }}>
                  <Tag size={12} /> {store.shop_category}
                </span>
              )}
              {store.shop_region && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13,
                  color: 'rgba(255,255,255,0.55)' }}>
                  <MapPin size={12} /> {store.shop_region}
                </span>
              )}
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13,
                color: 'rgba(255,255,255,0.55)' }}>
                <Package size={12} /> {products.length} products
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12,
                color: '#22C55E', fontWeight: 600 }}>
                <CheckCircle size={12} /> Verified Seller
              </span>
            </div>
            {store.shop_desc && (
              <p style={{ marginTop: '0.75rem', fontSize: 14, color: 'rgba(255,255,255,0.45)',
                lineHeight: 1.7, maxWidth: 520 }}>
                {store.shop_desc}
              </p>
            )}
          </div>
          {wa && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <a href={`https://wa.me/${wa}`} target="_blank"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#25D366',
                  color: '#fff', padding: '12px 24px', borderRadius: 999, fontWeight: 700, fontSize: 14,
                  textDecoration: 'none', boxShadow: '0 6px 20px rgba(37,211,102,0.35)' }}>
                <MessageCircle size={16} /> Chat Seller
              </a>
            </div>
          )}
        </div>

        {/* Stats strip */}
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '1.5rem auto 0',
          padding: '0 5%' }}>
          <div style={{ display: 'flex', gap: 0, background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden', flexWrap: 'wrap' }}>
            {[
              ['🛍️', String(products.length), 'Products'],
              ['⭐', '5.0', 'Rating'],
              ['✅', 'Verified', 'Status'],
              ['⚡', 'Fast', 'Response'],
            ].map(([icon, val, label], i, arr) => (
              <div key={label} style={{ flex: 1, minWidth: 100, padding: '12px 16px', textAlign: 'center',
                borderRight: i < arr.length-1 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
                <div style={{ fontSize: 14, marginBottom: 2 }}>{icon}</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>{val}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase',
                  letterSpacing: '0.08em' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PRODUCTS ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 5% 4rem' }}>

        {/* Search + Filter */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
              color: 'rgba(255,255,255,0.35)', fontSize: 16 }}>🔍</span>
            <input className="search-inp" value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              placeholder="Search products..." />
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button key={cat} className={`cat-btn ${selCat === cat ? 'active' : ''}`}
                onClick={() => setSelCat(cat)}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15 }}>No products found</p>
          </div>
        ) : (
          <div className="prod-grid" style={{ display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: '1rem' }}>
            {filtered.map(p => (
              <div key={p.id} className="prod-card" onClick={() => openOrder(p)}>
                {/* Product image / placeholder */}
                <div style={{ height: 140, background: `linear-gradient(135deg, ${accentColor}22, #0D1B3E)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  {p.image_url ? (
                    <Image src={p.image_url} alt={p.name} fill className="object-cover" />
                  ) : (
                    <span style={{ fontSize: 36 }}>🛍️</span>
                  )}
                  {p.stock <= 5 && p.stock > 0 && (
                    <div style={{ position: 'absolute', top: 8, right: 8, background: '#EF4444',
                      color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 999 }}>
                      Only {p.stock} left!
                    </div>
                  )}
                </div>
                <div style={{ padding: '0.9rem' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#fff', marginBottom: 4,
                    lineHeight: 1.3 }}>{p.name}</div>
                  {p.category && (
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.40)',
                      marginBottom: 8 }}>{p.category}</div>
                  )}
                  {p.description && (
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.50)', lineHeight: 1.5,
                      marginBottom: 10,
                      display: '-webkit-box', WebkitLineClamp: 2 as any,
                      WebkitBoxOrient: 'vertical' as any, overflow: 'hidden' }}>
                      {p.description}
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16,
                      fontWeight: 900, color: accentColor }}>
                      {fmt(p.price)}
                    </div>
                    <button style={{ background: accentColor, color: isPremium ? '#0F172A' : '#fff',
                      border: 'none', borderRadius: 999, padding: '6px 14px', fontSize: 12,
                      fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                      fontFamily: "'Inter',sans-serif" }}>
                      <ShoppingCart size={12} /> Order
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No products at all */}
        {products.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🏗️</div>
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.3rem', color: '#fff',
              marginBottom: 8 }}>Setting Up Shop</h3>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, marginBottom: 20 }}>
              This seller is adding products soon. Check back or contact them directly.
            </p>
            {wa && (
              <a href={`https://wa.me/${wa}`} target="_blank"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#25D366',
                  color: '#fff', padding: '12px 24px', borderRadius: 999, fontWeight: 700, fontSize: 14,
                  textDecoration: 'none' }}>
                <MessageCircle size={16} /> Contact on WhatsApp
              </a>
            )}
          </div>
        )}
      </div>

      {/* ── ORDER MODAL ── */}
      {cartItem && (
        <div className="modal-bg" onClick={e => { if(e.target === e.currentTarget) setCartItem(null) }}>
          <div className="modal">
            {success ? (
              // ── Success state ──
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(34,197,94,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <CheckCircle style={{ width: 30, height: 30, color: '#22C55E' }} />
                </div>
                <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.3rem', color: '#fff',
                  marginBottom: 8 }}>Order Placed! 🎉</h3>
                <p style={{ color: 'rgba(255,255,255,0.50)', fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
                  Your order for <strong style={{ color: '#fff' }}>{cartItem.name}</strong> has been sent to the seller.
                  They will contact you on WhatsApp shortly.
                </p>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                  {wa && (
                    <a href={`https://wa.me/${wa}`} target="_blank"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#25D366',
                        color: '#fff', padding: '10px 20px', borderRadius: 999, fontWeight: 700, fontSize: 13,
                        textDecoration: 'none' }}>
                      <MessageCircle size={14} /> Chat Seller
                    </a>
                  )}
                  <button onClick={() => setCartItem(null)}
                    style={{ padding: '10px 20px', borderRadius: 999, background: 'rgba(255,255,255,0.08)',
                      color: '#fff', border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer',
                      fontSize: 13, fontWeight: 600, fontFamily: "'Inter',sans-serif" }}>
                    Continue Shopping
                  </button>
                </div>
              </div>
            ) : (
              // ── Order form ──
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.15rem', color: '#fff', fontWeight: 800 }}>
                    Place Order
                  </h3>
                  <button onClick={() => setCartItem(null)}
                    style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.55)',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <X size={16} />
                  </button>
                </div>

                {/* Product summary */}
                <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 12, padding: '1rem', marginBottom: '1.25rem',
                  display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: `${accentColor}22`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    fontSize: 20 }}>🛍️</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{cartItem.name}</div>
                    <div style={{ fontSize: 13, color: accentColor, fontWeight: 700 }}>{fmt(cartItem.price)}</div>
                  </div>
                </div>

                {/* Quantity */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.55)',
                    marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Quantity</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q-1))}>
                      <Minus size={14} />
                    </button>
                    <span style={{ fontSize: 18, fontWeight: 800, color: '#fff', minWidth: 32, textAlign: 'center' }}>
                      {qty}
                    </span>
                    <button className="qty-btn"
                      onClick={() => setQty(q => Math.min(cartItem.stock, q+1))}>
                      <Plus size={14} />
                    </button>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.40)' }}>
                      ({cartItem.stock} available)
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div style={{ background: `${accentColor}11`, border: `1px solid ${accentColor}33`,
                  borderRadius: 10, padding: '10px 14px', marginBottom: '1.25rem',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.60)', fontWeight: 600 }}>Total Amount</span>
                  <span style={{ fontSize: 18, fontWeight: 900, color: accentColor }}>
                    {fmt(cartItem.price * qty)}
                  </span>
                </div>

                {/* Customer info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: '1.25rem' }}>
                  <input className="form-inp" value={orderName} onChange={e => setOrderName(e.target.value)}
                    placeholder="Your Full Name *" />
                  <input className="form-inp" value={orderPhone} onChange={e => setOrderPhone(e.target.value)}
                    placeholder="Your Phone Number * (+255...)" type="tel" />
                  <input className="form-inp" value={orderLocation} onChange={e => setOrderLocation(e.target.value)}
                    placeholder="Delivery Location (optional)" />
                  <input className="form-inp" value={orderNotes} onChange={e => setOrderNotes(e.target.value)}
                    placeholder="Notes (size, color, etc.)" />
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8 }}>
                  {wa && (
                    <a href={`https://wa.me/${wa}?text=${encodeURIComponent(`Hi! I want to order ${cartItem.name} x${qty}. Total: ${fmt(cartItem.price*qty)}`)}`}
                      target="_blank"
                      style={{ flex: 1, padding: '12px', borderRadius: 999, background: '#25D366',
                        color: '#fff', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        textDecoration: 'none', fontFamily: "'Inter',sans-serif" }}>
                      <MessageCircle size={15} /> WhatsApp
                    </a>
                  )}
                  <button onClick={placeOrder} disabled={placing || !orderName.trim() || !orderPhone.trim()}
                    style={{ flex: 2, padding: '12px', borderRadius: 999, background: accentColor,
                      color: isPremium ? '#0F172A' : '#fff', border: 'none', fontWeight: 700, fontSize: 13,
                      cursor: placing ? 'wait' : 'pointer', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', gap: 6, fontFamily: "'Inter',sans-serif",
                      opacity: (!orderName.trim() || !orderPhone.trim()) ? 0.55 : 1 }}>
                    {placing ? (
                      <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Placing...</>
                    ) : (
                      <><ShoppingCart size={15} /> Place Order</>
                    )}
                  </button>
                </div>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.30)', textAlign: 'center', marginTop: 8 }}>
                  Seller will confirm via WhatsApp after placing order
                </p>
              </>
            )}
          </div>
        </div>
      )}
      {store && <AIChatWidget storeId={store.id} shopName={store.shop_name} />}
      <SiteFooter />
    </main>
  )
}
