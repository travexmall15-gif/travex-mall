'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SiteNav } from '@/components/site-nav'
import { sb } from '@/lib/supabase'
import {
  ArrowLeft, Package, Heart, MapPin, CreditCard,
  Zap, Users, Tag, Bell, ChevronRight, Check,
  Plus, Loader2, Save
} from 'lucide-react'

const CATEGORIES = [
  'Fashion & Clothing','Electronics','Food & Groceries','Beauty & Health',
  'Agriculture','Services','Home & Living','Sports & Fitness',
  'Education','Automotive','Arts & Crafts','Technology',
]

const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
  <button onClick={onToggle}
    style={{ width:46, height:26, borderRadius:999, background: on ? '#0D1B3E' : '#E2E8F0', border:'none', cursor:'pointer', position:'relative', transition:'all .25s', flexShrink:0 }}>
    <div style={{ width:20, height:20, borderRadius:'50%', background: on ? '#C9A84C' : '#fff', position:'absolute', top:3, left: on ? 23 : 3, transition:'all .25s', boxShadow:'0 1px 4px rgba(0,0,0,0.15)' }} />
  </button>
)

export default function ShoppingPrefsPage() {
  const router = useRouter()
  const [loading,    setLoading]    = useState(true)
  const [saving,     setSaving]     = useState(false)
  const [saved,      setSaved]      = useState(false)
  const [address,    setAddress]    = useState('')
  const [city,       setCity]       = useState('')
  const [phone,      setPhone]      = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [alerts, setAlerts] = useState({
    flashDeals:   true,
    groupBuy:     true,
    priceDrops:   false,
    newArrivals:  false,
  })
  const [orders,      setOrders]     = useState<any[]>([])
  const [likedCount,  setLikedCount] = useState(0)

  useEffect(() => {
    sb.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) { router.replace('/auth'); return }

      // Load saved prefs from localStorage
      try {
        const p = JSON.parse(localStorage.getItem('sn_shopping_prefs') || '{}')
        if (p.address)    setAddress(p.address)
        if (p.city)       setCity(p.city)
        if (p.phone)      setPhone(p.phone)
        if (p.categories) setCategories(p.categories)
        if (p.alerts)     setAlerts({ ...alerts, ...p.alerts })
      } catch {}

      // Load recent orders from Supabase
      try {
        const { data } = await sb
          .from('orders')
          .select('id, product_name, status, created_at, total_amount')
          .eq('buyer_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(5)
        setOrders(data || [])
      } catch {}

      // Count liked posts
      try {
        const { count } = await sb
          .from('feed_posts')
          .select('id', { count: 'exact' })
          .gt('likes', 0)
        setLikedCount(count || 0)
      } catch {}

      setLoading(false)
    })
  }, [router])

  const toggleCategory = (cat: string) => {
    setCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  const savePrefs = () => {
    setSaving(true)
    localStorage.setItem('sn_shopping_prefs', JSON.stringify({
      address, city, phone, categories, alerts
    }))
    setTimeout(() => { setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000) }, 600)
  }

  const inp: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    padding: '0.75rem 1rem',
    border: '1.5px solid #E2E8F0', borderRadius: 12,
    fontSize: '0.875rem', fontFamily: "'Inter',sans-serif",
    outline: 'none', background: '#F8FAFF',
    transition: 'border-color 0.2s', color: '#0F172A',
  }

  return (
    <main style={{ minHeight:'100vh', background:'#F8FAFF', paddingTop:108, fontFamily:"'Inter',sans-serif" }}>
      <SiteNav />
      <div style={{ maxWidth:520, margin:'0 auto', padding:'1.5rem 5% 5rem' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.5rem' }}>
          <button onClick={() => router.back()}
            style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', cursor:'pointer', color:'#64748B', fontSize:'0.82rem', fontWeight:600, fontFamily:"'Inter',sans-serif", padding:0 }}>
            <ArrowLeft size={15} /> Back
          </button>
          <button onClick={savePrefs} disabled={saving}
            style={{ display:'flex', alignItems:'center', gap:6, background: saved ? '#059669' : '#0D1B3E', color:'#fff', border:'none', borderRadius:999, padding:'8px 18px', fontWeight:700, fontSize:'0.8rem', cursor:'pointer', fontFamily:"'Inter',sans-serif", transition:'all .2s' }}>
            {saving ? <><Loader2 size={13} style={{ animation:'spin 1s linear infinite' }} /> Saving...</>
             : saved  ? <><Check size={13} /> Saved!</>
             : <><Save size={13} /> Save</>}
          </button>
        </div>

        <h1 style={{ fontSize:'1.25rem', fontWeight:800, color:'#0D1B3E', marginBottom:'1.5rem', letterSpacing:'-0.025em' }}>Shopping Preferences</h1>

        {loading ? (
          <div style={{ textAlign:'center', padding:'4rem 0' }}>
            <Loader2 size={28} color="#0D1B3E" style={{ animation:'spin 1s linear infinite', margin:'0 auto', display:'block' }} />
          </div>
        ) : (<>

        {/* ── Order History ─────────────────────────────── */}
        <div style={{ marginBottom:'1.25rem' }}>
          <p style={{ fontSize:'0.65rem', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:8, paddingLeft:4 }}>Order History</p>
          <div style={{ background:'#fff', borderRadius:16, border:'1.5px solid #E2E8F0', overflow:'hidden' }}>
            {orders.length === 0 ? (
              <div style={{ padding:'1.5rem', textAlign:'center', color:'#94A3B8', fontSize:'0.82rem' }}>
                No orders yet — <a href="/market" style={{ color:'#0D1B3E', fontWeight:600, textDecoration:'none' }}>start shopping</a>
              </div>
            ) : (
              orders.map((order, i) => (
                <div key={order.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 16px', borderBottom: i < orders.length-1 ? '1px solid #F1F5F9' : 'none' }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:'rgba(59,130,246,0.10)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <Package size={16} color="#3B82F6" />
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:'0.85rem', fontWeight:600, color:'#0F172A', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{order.product_name}</div>
                    <div style={{ fontSize:'0.7rem', color:'#94A3B8', marginTop:2 }}>{new Date(order.created_at).toLocaleDateString()}</div>
                  </div>
                  <span style={{ fontSize:'0.7rem', fontWeight:700, padding:'3px 10px', borderRadius:999,
                    background: order.status==='delivered' ? '#DCFCE7' : order.status==='pending' ? '#FEF3C7' : '#F1F5F9',
                    color:      order.status==='delivered' ? '#059669' : order.status==='pending' ? '#92400E' : '#64748B' }}>
                    {order.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Liked Products ────────────────────────────── */}
        <div style={{ marginBottom:'1.25rem' }}>
          <p style={{ fontSize:'0.65rem', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:8, paddingLeft:4 }}>Liked Products</p>
          <a href="/vybe" style={{ textDecoration:'none', display:'block' }}>
            <div style={{ background:'#fff', borderRadius:16, border:'1.5px solid #E2E8F0', padding:'14px 16px', display:'flex', alignItems:'center', gap:12, transition:'background .15s', cursor:'pointer' }}
              onMouseOver={e => (e.currentTarget as HTMLElement).style.background='#FFF1F2'}
              onMouseOut={e  => (e.currentTarget as HTMLElement).style.background='#fff'}>
              <div style={{ width:36, height:36, borderRadius:10, background:'rgba(239,68,68,0.10)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Heart size={16} color="#EF4444" />
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:'0.875rem', fontWeight:600, color:'#0F172A' }}>Liked on Social Vybe</div>
                <div style={{ fontSize:'0.7rem', color:'#94A3B8', marginTop:2 }}>View posts you liked</div>
              </div>
              <ChevronRight size={14} color="#CBD5E1" />
            </div>
          </a>
        </div>

        {/* ── Delivery Address ──────────────────────────── */}
        <div style={{ marginBottom:'1.25rem' }}>
          <p style={{ fontSize:'0.65rem', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:8, paddingLeft:4 }}>Delivery Address</p>
          <div style={{ background:'#fff', borderRadius:16, border:'1.5px solid #E2E8F0', padding:'1rem 1.1rem', display:'flex', flexDirection:'column', gap:'0.75rem' }}>
            <div style={{ position:'relative' }}>
              <MapPin size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#94A3B8' }} />
              <input value={address} onChange={e => setAddress(e.target.value)}
                placeholder="Street address"
                style={{ ...inp, paddingLeft:'2.25rem' }}
                onFocus={e => (e.target.style.borderColor='#0D1B3E')}
                onBlur={e  => (e.target.style.borderColor='#E2E8F0')} />
            </div>
            <div style={{ display:'flex', gap:'0.6rem' }}>
              <input value={city} onChange={e => setCity(e.target.value)}
                placeholder="City / Region"
                style={{ ...inp, flex:1 }}
                onFocus={e => (e.target.style.borderColor='#0D1B3E')}
                onBlur={e  => (e.target.style.borderColor='#E2E8F0')} />
              <input value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="Phone"
                style={{ ...inp, flex:1 }}
                onFocus={e => (e.target.style.borderColor='#0D1B3E')}
                onBlur={e  => (e.target.style.borderColor='#E2E8F0')} />
            </div>
          </div>
        </div>

        {/* ── Payment Methods ───────────────────────────── */}
        <div style={{ marginBottom:'1.25rem' }}>
          <p style={{ fontSize:'0.65rem', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:8, paddingLeft:4 }}>Payment Methods</p>
          <div style={{ background:'#fff', borderRadius:16, border:'1.5px solid #E2E8F0', overflow:'hidden' }}>
            {[
              { label:'M-Pesa / Mobile Money', sub:'Pay via mobile money', icon:'📱', active:true  },
              { label:'Cash on Delivery',       sub:'Pay when delivered',  icon:'💵', active:true  },
              { label:'Bank Transfer',          sub:'Direct bank payment', icon:'🏦', active:false },
            ].map((pm, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 16px', borderBottom: i < 2 ? '1px solid #F1F5F9' : 'none' }}>
                <div style={{ width:36, height:36, borderRadius:10, background:'rgba(201,168,76,0.10)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:'1rem' }}>
                  {pm.icon}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:'0.875rem', fontWeight:600, color:'#0F172A' }}>{pm.label}</div>
                  <div style={{ fontSize:'0.7rem', color:'#94A3B8', marginTop:2 }}>{pm.sub}</div>
                </div>
                {pm.active
                  ? <span style={{ fontSize:'0.65rem', fontWeight:700, background:'#DCFCE7', color:'#059669', padding:'3px 9px', borderRadius:999 }}>Active</span>
                  : <span style={{ fontSize:'0.65rem', fontWeight:600, background:'#F1F5F9', color:'#94A3B8', padding:'3px 9px', borderRadius:999 }}>Soon</span>
                }
              </div>
            ))}
          </div>
        </div>

        {/* ── Category Preferences ──────────────────────── */}
        <div style={{ marginBottom:'1.25rem' }}>
          <p style={{ fontSize:'0.65rem', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:8, paddingLeft:4 }}>Favourite Categories</p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'7px' }}>
            {CATEGORIES.map(cat => {
              const selected = categories.includes(cat)
              return (
                <button key={cat} onClick={() => toggleCategory(cat)}
                  style={{ padding:'7px 14px', borderRadius:999, border:`1.5px solid ${selected ? '#0D1B3E' : '#E2E8F0'}`, background: selected ? '#0D1B3E' : '#fff', color: selected ? '#C9A84C' : '#64748B', fontSize:'0.78rem', fontWeight:600, cursor:'pointer', fontFamily:"'Inter',sans-serif", transition:'all .15s', display:'flex', alignItems:'center', gap:5 }}>
                  {selected && <Check size={11} />} {cat}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Deal Alerts ───────────────────────────────── */}
        <div style={{ marginBottom:'1.5rem' }}>
          <p style={{ fontSize:'0.65rem', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:8, paddingLeft:4 }}>Deal Alerts</p>
          <div style={{ background:'#fff', borderRadius:16, border:'1.5px solid #E2E8F0', overflow:'hidden' }}>
            {[
              { key:'flashDeals',  icon:Zap,   label:'Flash Deals',          sub:'Get notified of limited offers',     color:'#EF4444' },
              { key:'groupBuy',    icon:Users, label:'Group Buy Targets',     sub:'When your group reaches target',     color:'#10B981' },
              { key:'priceDrops',  icon:Tag,   label:'Price Drop Alerts',     sub:'When saved items drop in price',     color:'#F59E0B' },
              { key:'newArrivals', icon:Bell,  label:'New Arrivals',          sub:'New products in your categories',    color:'#6366F1' },
            ].map((item, i) => (
              <div key={item.key} style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 16px', borderBottom: i < 3 ? '1px solid #F1F5F9' : 'none' }}>
                <div style={{ width:36, height:36, borderRadius:10, background:`${item.color}15`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <item.icon size={16} color={item.color} />
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:'0.875rem', fontWeight:600, color:'#0F172A' }}>{item.label}</div>
                  <div style={{ fontSize:'0.7rem', color:'#94A3B8', marginTop:2 }}>{item.sub}</div>
                </div>
                <Toggle
                  on={alerts[item.key as keyof typeof alerts]}
                  onToggle={() => setAlerts(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Save button bottom */}
        <button onClick={savePrefs} disabled={saving}
          style={{ width:'100%', padding:'0.9rem', background: saved ? '#059669' : '#0D1B3E', color:'#fff', border:'none', borderRadius:14, fontFamily:"'Inter',sans-serif", fontWeight:700, fontSize:'0.9rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'all .2s' }}>
          {saving ? <><Loader2 size={15} style={{ animation:'spin 1s linear infinite' }} /> Saving...</>
           : saved  ? <><Check size={15} /> Saved!</>
           : <><Save size={15} /> Save Preferences</>}
        </button>

        </>)}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </main>
  )
}
