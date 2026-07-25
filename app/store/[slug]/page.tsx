'use client'
import { useTranslation } from '@/hooks/useTranslation'
import { SiteFooter } from '@/components/site-footer'

import Image from 'next/image'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { sb } from '@/lib/supabase'
import { SiteNav } from '@/components/site-nav'
import { ArrowLeft, MessageCircle, Package, ShoppingCart, X, Plus, Minus, MapPin, Tag, Star, CheckCircle, Loader2, Heart, Search } from 'lucide-react'
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
  shop_banner: string | null
  shop_logo: string | null
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

export default function StorePage({
  params }: { params: Promise<{ slug: string }> }) {
  const { t } = useTranslation()
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
  const [searchQ, setSearchQ]     = useState('')
  const [selCat, setSelCat]       = useState(t('store.allCategories'))
  const [showWelcome, setShowWelcome] = useState(false)
  const [showMsg, setShowMsg]     = useState(false)
  const [msgText, setMsgText]     = useState('')
  const [msgName, setMsgName]     = useState('')
  const [msgSent, setMsgSent]     = useState(false)

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
        setTimeout(() => setShowWelcome(true), 800)
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
        (orderLocation ? `Location: *${orderLocation}*\n` : '') +
        (orderNotes ? `📝 Notes: ${orderNotes}\n` : '') +
        `\n_From ShopNekt_`
      )
      window.open(`https://wa.me/${wa}?text=${msg}`, '_blank')
    }

    setPlacing(false)
    setSuccess(true)
  }

  const categories = [t('store.allCategories'), ...Array.from(new Set(products.map(p => p.category).filter(Boolean) as string[]))]

  const filtered = products.filter(p => {
    const matchQ = !searchQ || p.name.toLowerCase().includes(searchQ.toLowerCase())
    const matchC = selCat === t('store.allCategories') || p.category === selCat
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
    <main style={{ minHeight: '100vh', background: '#F8FAFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <Package size={48} style={{ color: '#CBD5E1', margin: '0 auto 1rem', display: 'block' }} />
        <h2 style={{ fontFamily: "'Inter',sans-serif", fontSize: '1.5rem', fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>{t('store.storeNotFound')}</h2>
        <p style={{ color: '#94A3B8', marginBottom: 24 }}>This store may have been removed or is not yet active.</p>
        <Link href="/market" style={{ background: '#C9A84C', color: '#0F172A', padding: '0.85rem 2rem', borderRadius: 999, fontWeight: 700, textDecoration: 'none', fontSize: 14 }}>
          ← Back to Market
        </Link>
      </div>
    </main>
  )

  return (
    <main style={{ minHeight: '100vh', background: '#F8FAFF', fontFamily: "'Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes spin{to{transform:rotate(360deg)}}
        to{opacity:1;transform:translateY(0)}}

        .cat-btn{padding:5px 14px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;border:1.5px solid #E2E8F0;background:#fff;color:#475569;transition:all 0.15s;font-family:'Inter',sans-serif}
        .cat-btn.active{background:#0D1B3E;border-color:#0D1B3E;color:#fff}
        .modal-bg{position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:999;display:flex;align-items:flex-end;justify-content:center;backdrop-filter:blur(6px)}
        @media(min-width:600px){.modal-bg{align-items:center}}
        .modal{background:#0D1B3E;border:1px solid rgba(255,255,255,0.10);border-radius:20px 20px 0 0;padding:1.5rem;width:100%;max-width:480px;max-height:90vh;overflow-y:auto;animation:fadeUp 0.3s ease}
        @media(min-width:600px){.modal{border-radius:20px}}
        .form-inp{width:100%;padding:10px 14px;background:rgba(255,255,255,0.07);border:1.5px solid rgba(255,255,255,0.12);border-radius:10px;color:#fff;font-size:14px;outline:none;font-family:'Inter',sans-serif;transition:all 0.15s}
        .form-inp:focus{border-color:${accentColor};background:rgba(255,255,255,0.10)}
        .form-inp::placeholder{color:rgba(255,255,255,0.30)}
        .qty-btn{width:32px;height:32px;border-radius:50%;border:1.5px solid rgba(255,255,255,0.20);background:rgba(255,255,255,0.07);color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px;transition:all 0.15s}
        .qty-btn:hover{background:rgba(255,255,255,0.15)}
        .search-inp{width:100%;padding:10px 16px 10px 40px;background:#fff;border:1.5px solid #E2E8F0;border-radius:12px;color:#0F172A;font-size:13px;outline:none;font-family:'Inter',sans-serif;transition:border-color 0.2s}
        .search-inp::placeholder{color:#94A3B8}
        .search-inp:focus{border-color:#0D1B3E}
        @media(max-width:640px){.prod-grid{grid-template-columns:repeat(2,1fr)!important}}
      `}</style>

      {/* ── HERO — compact ── */}
      <div style={{ background: '#0D1B3E', paddingTop: 64, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        {/* Banner */}
        {store.shop_banner && (
          <div style={{ height: 120, overflow: 'hidden', position: 'relative' }}>
            <Image src={store.shop_banner} alt="" fill style={{ objectFit: 'cover', opacity: 0.5 }} />
          </div>
        )}

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: store.shop_banner ? '0 5% 1.25rem' : '1.25rem 5%' }}>
          {/* Back link */}
          <div style={{ marginBottom: '1rem', marginTop: store.shop_banner ? '-18px' : 0 }}>
            <Link href="/market" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.55)', textDecoration: 'none', fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)' }}>
              <ArrowLeft size={12} /> Market
            </Link>
          </div>

          {/* Shop info row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {/* Logo */}
            <div style={{ width: 52, height: 52, borderRadius: 14, flexShrink: 0, border: '2.5px solid rgba(255,255,255,0.15)', overflow: 'hidden', background: `linear-gradient(135deg, ${accentColor}, #050B2E)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {store.shop_logo ? (
                <Image src={store.shop_logo} alt={initials} width={52} height={52} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
              ) : (
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 18, fontWeight: 900, color: '#fff' }}>{initials}</span>
              )}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
                <h1 style={{ fontFamily: "'Inter',sans-serif", fontSize: 'clamp(1rem,3vw,1.35rem)', fontWeight: 900, color: '#fff', lineHeight: 1.1 }}>
                  {store.shop_name}
                </h1>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: isPremium ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.06)', color: isPremium ? '#C9A84C' : 'rgba(255,255,255,0.45)', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 999, border: `1px solid ${isPremium ? 'rgba(201,168,76,0.25)' : 'rgba(255,255,255,0.1)'}` }}>
                  {isPremium ? 'PREMIUM' : 'BASIC'}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: '#22C55E', fontSize: 10, fontWeight: 700 }}>
                  <CheckCircle size={10} /> {t('store.verified')}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 4 }}>
                {store.shop_category && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', display: 'flex', alignItems: 'center', gap: 3 }}><Tag size={10} />{store.shop_category}</span>}
                {store.shop_region && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', display: 'flex', alignItems: 'center', gap: 3 }}><MapPin size={10} />{store.shop_region}</span>}
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', display: 'flex', alignItems: 'center', gap: 3 }}><Package size={10} />{products.length} products</span>
              </div>
              {store.shop_desc && (
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6, marginBottom: 8, maxWidth: 480, display: '-webkit-box', WebkitLineClamp: 2 as any, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden' }}>{store.shop_desc}</p>
              )}
              {/* Message Seller button in hero */}
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                <button
                  onClick={() => setShowMsg(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.18)', color: '#fff', borderRadius: 999, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter',sans-serif", transition: 'all 0.2s' }}
                  onMouseOver={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.18)'}
                  onMouseOut={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.10)'}>
                  <MessageCircle size={13} /> {t('store.messageSeller')}
                </button>
                {/* Save Shop toggle */}
                <button
                  onClick={() => {
                    const saved = JSON.parse(localStorage.getItem('sn_saved_shops') || '[]')
                    const alreadySaved = saved.some((s: any) => s.id === store!.id)
                    if (alreadySaved) {
                      const updated = saved.filter((s: any) => s.id !== store!.id)
                      localStorage.setItem('sn_saved_shops', JSON.stringify(updated))
                    } else {
                      saved.push({ id: store!.id, shop_name: store!.shop_name, shop_category: store!.shop_category, shop_region: store!.shop_region, plan: store!.plan, saved_at: new Date().toISOString() })
                      localStorage.setItem('sn_saved_shops', JSON.stringify(saved))
                    }
                    // Force re-render by toggling state
                    setShowMsg(v => v)
                  }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: (() => { try { const s = JSON.parse(localStorage.getItem('sn_saved_shops')||'[]'); return s.some((x:any)=>x.id===store!.id) ? 'rgba(239,68,68,0.25)':'rgba(255,255,255,0.10)' } catch{return 'rgba(255,255,255,0.10)'} })(), border: '1px solid rgba(255,255,255,0.18)', color: '#fff', borderRadius: 999, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter',sans-serif", transition: 'all 0.2s' }}>
                  <Heart size={12} /> {t('store.saveShop')}
                </button>
              </div>
            </div>
          </div>

          {/* Animated chips — Flash Deals + Group Buy */}
          <div style={{ overflow: 'hidden', marginTop: '1rem', paddingBottom: '1rem', borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '1rem' }}>
            <style>{`
              100%{transform:translateX(-50%)}}
              .store-chips{animation:storeChips 24s linear infinite; will-change: transform; }
              .store-chips:hover{animation-play-state:paused}
            `}</style>
            <div className="store-chips" style={{ display: 'flex', gap: 8, width: 'max-content', paddingLeft: '24px' }}>
              {[
                { href: '/flash-deals', label: 'Flash Deals', sub: 'Limited offers', bg: '#FEF3C7', border: '#FCD34D', color: '#92400E' },
                { href: '/group-buy', label: 'Group Buy', sub: 'Save together', bg: '#DBEAFE', border: '#93C5FD', color: '#1E40AF' },
                { href: '/market', label: 'Business Market', sub: '500+ shops', bg: '#ECFDF5', border: '#6EE7B7', color: '#065F46' },
                { href: '/vybe', label: 'Social Vybe', sub: 'Community', bg: '#EDE9FE', border: '#C4B5FD', color: '#5B21B6' },
                { href: '/flash-deals', label: 'Flash Deals', sub: 'Limited offers', bg: '#FEF3C7', border: '#FCD34D', color: '#92400E' },
                { href: '/group-buy', label: 'Group Buy', sub: 'Save together', bg: '#DBEAFE', border: '#93C5FD', color: '#1E40AF' },
                { href: '/market', label: 'Business Market', sub: '500+ shops', bg: '#ECFDF5', border: '#6EE7B7', color: '#065F46' },
                { href: '/vybe', label: 'Social Vybe', sub: 'Community', bg: '#EDE9FE', border: '#C4B5FD', color: '#5B21B6' },
              ].map((c, i) => (
                <a key={i} href={c.href} style={{ display: 'inline-flex', flexDirection: 'column' as const, gap: 1, background: c.bg, border: `1px solid ${c.border}`, color: c.color, padding: '5px 12px', borderRadius: 10, textDecoration: 'none', whiteSpace: 'nowrap' as const, flexShrink: 0 }}>
                  <span style={{ fontSize: 11, fontWeight: 700 }}>{c.label}</span>
                  <span style={{ fontSize: 9, opacity: 0.7 }}>{c.sub}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── PRODUCTS ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '1.5rem 5% 4rem' }}>

        {/* Search + Filter */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)' }} />
            <input className="search-inp" value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              placeholder={t('store.searchProducts')} />
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
            <Package size={40} style={{ color: '#CBD5E1', margin: '0 auto 1rem', display: 'block' }} />
            <p style={{ color: '#94A3B8', fontSize: 14 }}>{t('store.noProducts')}</p>
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
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', width:'100%', height:'100%' }}>
                      <ShoppingBag size={40} color="rgba(255,255,255,0.20)" />
                    </div>
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
                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 16,
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
            <Package size={40} style={{ color: '#CBD5E1', margin: '0 auto 1rem', display: 'block' }} />
            <h3 style={{ fontFamily: "'Inter',sans-serif", fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>{t('store.settingUpShop')}</h3>
            <p style={{ color: '#94A3B8', fontSize: 14, marginBottom: 20 }}>
              This seller is adding products soon. Check back shortly.
            </p>

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
                <h3 style={{ fontFamily: "'Inter',sans-serif", fontSize: '1.3rem', color: '#fff',
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
                  <h3 style={{ fontFamily: "'Inter',sans-serif", fontSize: '1.15rem', color: '#fff', fontWeight: 800 }}>{t('store.placeOrderBtn')}</h3>
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
                    fontSize: 20 }}><ShoppingBag size={20} color={accentColor} /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{cartItem.name}</div>
                    <div style={{ fontSize: 13, color: accentColor, fontWeight: 700 }}>{fmt(cartItem.price)}</div>
                  </div>
                </div>

                {/* Quantity */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.55)',
                    marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('store.quantity')}</div>
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
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.60)', fontWeight: 600 }}>{t('store.totalAmount')}</span>
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
                      <><ShoppingCart size={15} />{t('store.placeOrderBtn')}</>
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
      {/* ── WELCOME MODAL (AI Customer Care) ── */}
      {showWelcome && store && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if(e.target === e.currentTarget) setShowWelcome(false) }}>
          <div style={{ background: '#fff', borderRadius: '24px 24px 0 0', padding: '1.75rem 1.5rem 2rem', width: '100%', maxWidth: 440, boxShadow: '0 -12px 48px rgba(0,0,0,0.18)', }}>
            <style>{`to{transform:translateY(0);opacity:1}}`}</style>

            {/* Drag handle */}
            <div style={{ width: 36, height: 4, borderRadius: 999, background: '#E2E8F0', margin: '0 auto 1.25rem' }} />

            {/* AI avatar + bubble */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.9rem', marginBottom: '1.5rem' }}>
              {/* AI Female avatar */}
              <div style={{ flexShrink: 0, position: 'relative' }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2.5px solid #fff', boxShadow: '0 4px 14px rgba(99,102,241,0.35)', overflow: 'hidden' }}>
                  <svg viewBox="0 0 52 52" width="52" height="52" xmlns="http://www.w3.org/2000/svg">
                    {/* Body */}
                    <circle cx="26" cy="56" r="20" fill="#A5B4FC"/>
                    {/* Head */}
                    <circle cx="26" cy="21" r="11" fill="#FDE8D0"/>
                    {/* Hair */}
                    <path d="M15 18 Q16 8 26 8 Q36 8 37 18 Q36 12 26 11 Q16 12 15 18Z" fill="#7C3AED"/>
                    <path d="M15 21 Q13 30 16 34 Q15 26 16 22Z" fill="#7C3AED"/>
                    <path d="M37 21 Q39 30 36 34 Q37 26 36 22Z" fill="#7C3AED"/>
                    {/* Eyes */}
                    <ellipse cx="22" cy="21" rx="1.4" ry="1.6" fill="#1E1B4B"/>
                    <ellipse cx="30" cy="21" rx="1.4" ry="1.6" fill="#1E1B4B"/>
                    {/* Smile */}
                    <path d="M22 27 Q26 30.5 30 27" stroke="#E97070" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                    {/* Headset dot (AI indicator) */}
                    <circle cx="40" cy="8" r="6" fill="#22C55E"/>
                    <path d="M37.5 8 L39.5 10 L42.5 6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                </div>
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, borderRadius: '50%', background: '#22C55E', border: '2px solid #fff' }} />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>Aria</span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: '#6366F1', background: '#EEF2FF', padding: '1px 7px', borderRadius: 999, border: '1px solid #C7D2FE' }}>{t('store.aria')}</span>
                </div>
                <div style={{ background: '#F8FAFF', border: '1px solid #E0E7FF', borderRadius: '0 14px 14px 14px', padding: '0.8rem 1rem' }}>
                  <p style={{ fontSize: 13, color: '#1E293B', lineHeight: 1.7, margin: 0 }}>
                    Hi there! Welcome to <strong>{store.shop_name}</strong>. I am Aria, your AI shopping assistant. I can help you find products, answer questions, and guide you through placing an order. What would you like to do?
                  </p>
                </div>
              </div>
            </div>

            {/* Quick action chips */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              {[t('store.findProduct'), t('store.placeOrder'), t('store.checkPrices')].map((chip, chipIdx) => (
                <button key={chipIdx} onClick={() => setShowWelcome(false)} style={{ padding: '5px 12px', borderRadius: 999, background: '#EEF2FF', color: '#4338CA', border: '1px solid #C7D2FE', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter',sans-serif" }}>{ chip }</button>
              ))}
            </div>

            {/* CTA buttons */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setShowWelcome(false)}
                style={{ flex: 1, padding: '11px', borderRadius: 12, border: '1.5px solid #E2E8F0', background: '#fff', color: '#64748B', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter',sans-serif" }}>
                Browse on my own
              </button>
              <button
                onClick={() => {
                  setShowWelcome(false)
                  // Trigger AI chat widget
                  setTimeout(() => {
                    const btn = document.querySelector('[data-ai-chat-toggle]') as HTMLElement
                    if (btn) btn.click()
                  }, 300)
                }}
                style={{ flex: 1, padding: '11px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Inter',sans-serif", boxShadow: '0 4px 14px rgba(99,102,241,0.3)' }}>
                Chat with Aria
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MESSAGE SELLER MODAL ── */}
      {showMsg && store && (
        <div className="modal-bg" onClick={e => { if(e.target === e.currentTarget) setShowMsg(false) }}>
          <div className="modal">
            {msgSent ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(34,197,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <CheckCircle style={{ width: 28, height: 28, color: '#22C55E' }} />
                </div>
                <h3 style={{ fontFamily: "'Inter',sans-serif", fontSize: '1.15rem', color: '#fff', marginBottom: 8 }}>{t('store.messageSent')}</h3>
                <p style={{ color: 'rgba(255,255,255,0.50)', fontSize: 13, lineHeight: 1.7, marginBottom: 20 }}>
                  The seller will respond to you shortly.
                </p>
                <button onClick={() => { setShowMsg(false); setMsgSent(false); setMsgText(''); setMsgName('') }}
                  style={{ padding: '10px 24px', borderRadius: 999, background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: "'Inter',sans-serif" }}>
                  Close
                </button>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontFamily: "'Inter',sans-serif", fontSize: '1.1rem', color: '#fff', fontWeight: 800 }}>
                    Message {store.shop_name}
                  </h3>
                  <button onClick={() => setShowMsg(false)} style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.55)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <X size={16} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: '1.25rem' }}>
                  <input className="form-inp" value={msgName} onChange={e => setMsgName(e.target.value)} placeholder="Your Name * / Jina Lako *" />
                  <textarea className="form-inp" value={msgText} onChange={e => setMsgText(e.target.value)} placeholder={"Your message to the seller..."} rows={4} style={{ resize: 'vertical' as const }} />
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  {wa && (
                    <a
                      href={`https://wa.me/${wa}?text=${encodeURIComponent(`Hi! I am ${msgName || 'a customer'}. ${msgText}`)}`}
                      target="_blank"
                      style={{ flex: 1, padding: '11px', borderRadius: 10, background: '#25D366', color: '#fff', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, textDecoration: 'none', fontFamily: "'Inter',sans-serif" }}>
                      <MessageCircle size={14} /> WhatsApp
                    </a>
                  )}
                  <button
                    onClick={async () => {
                      if (!msgName.trim() || !msgText.trim()) return
                      await sb.from('store_messages').insert({ store_id: store.id, sender_name: msgName, message: msgText, created_at: new Date().toISOString() }).catch(() => {})
                      setMsgSent(true)
                    }}
                    disabled={!msgName.trim() || !msgText.trim()}
                    style={{ flex: 2, padding: '11px', borderRadius: 10, background: accentColor, color: isPremium ? '#0F172A' : '#fff', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: "'Inter',sans-serif", opacity: (!msgName.trim() || !msgText.trim()) ? 0.5 : 1 }}>
                    <MessageCircle size={14} /> Send Message
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {store && <AIChatWidget storeId={store.id} shopName={store.shop_name} welcomeMessage={`Welcome to ${store.shop_name}! I am here to help you find products and place orders. What are you looking for today?`} />}
      <SiteFooter />
    </main>
  )
}
