'use client'
import { useTranslation } from '@/hooks/useTranslation'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { sb } from '@/lib/supabase'
import {
  ArrowLeft, Package, Heart, Tag, Bell,
  Zap, Users, Check, ChevronRight, Save,
  Store, Trash2, ExternalLink,
} from 'lucide-react'

const CATEGORIES = [
  'Fashion & Clothing','Electronics','Food & Groceries','Beauty & Health',
  'Agriculture','Services','Home & Living','Sports & Fitness',
  'Education','Automotive','Arts & Crafts','Technology','Furniture','Electrical',
]

type SavedShop = {
  id: string
  shop_name: string
  shop_category: string | null
  shop_region: string | null
  plan: string | null
  saved_at: string
}

const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
  <button onClick={onToggle}
    style={{ width:46, height:26, borderRadius:999, background: on?'#1D4ED8':'#E5E7EB', border:'none', cursor:'pointer', position:'relative', transition:'all .25s', flexShrink:0 }}>
    <div style={{ width:20, height:20, borderRadius:'50%', background: on?'#1D4ED8':'#fff', position:'absolute', top:3, left: on?23:3, transition:'all .25s', boxShadow:'0 1px 4px rgba(0,0,0,0.15)' }} />
  </button>
)

export default function ShoppingPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [categories, setCategories] = useState<string[]>([])
  const [alerts, setAlerts] = useState({ flashDeals:true, groupBuy:true, priceDrops:false, newArrivals:false })
  const [saved, setSaved] = useState(false)
  const [savedShops, setSavedShops] = useState<SavedShop[]>([])
  const [orderCount, setOrderCount] = useState<{pending:number,total:number}>({ pending:0, total:0 })

  // Load prefs + saved shops from localStorage (no auth required)
  useEffect(() => {
    try {
      const p = JSON.parse(localStorage.getItem('sn_shopping_prefs') || '{}')
      if (p.categories) setCategories(p.categories)
      if (p.alerts)     setAlerts(a => ({ ...a, ...p.alerts }))
    } catch {}

    // Load saved shops
    try {
      const shops = JSON.parse(localStorage.getItem('sn_saved_shops') || '[]')
      setSavedShops(shops)
    } catch {}

    // Try to get orders count if Supabase Auth session exists
    sb.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) return
      try {
        const { data } = await sb.from('orders').select('status').eq('buyer_id', session.user.id)
        if (data) setOrderCount({ total: data.length, pending: data.filter(o => o.status==='pending').length })
      } catch {}
    }).catch(() => {})
  }, [])

  const toggleCat = (c: string) => setCategories(p => p.includes(c) ? p.filter(x=>x!==c) : [...p,c])

  const savePrefs = () => {
    localStorage.setItem('sn_shopping_prefs', JSON.stringify({ categories, alerts }))
    setSaved(true); setTimeout(() => setSaved(false), 1800)
  }

  const removeShop = (id: string) => {
    const updated = savedShops.filter(s => s.id !== id)
    setSavedShops(updated)
    localStorage.setItem('sn_saved_shops', JSON.stringify(updated))
  }

  const ALERTS_CONFIG = [
    { key:'flashDeals',  icon:Zap,   label:t('shopping.flashDealsAlerts'),  sub:t('shopping.flashDealsSub'),   color:'#EF4444' },
    { key:'groupBuy',    icon:Users, label:t('shopping.groupBuyAlerts'),     sub:t('shopping.groupBuySub'),     color:'#10B981' },
    { key:'priceDrops',  icon:Tag,   label:t('shopping.priceDropAlerts'),    sub:t('shopping.priceDropSub'),    color:'#F59E0B' },
    { key:'newArrivals', icon:Bell,  label:t('shopping.newArrivalsAlerts'),  sub:t('shopping.newArrivalsSub'), color:'#6366F1' },
  ]

  return (
    <main style={{ minHeight:'100vh', background:'#F8FAFF', paddingTop:108, fontFamily:"'Inter',sans-serif" }}>
      <SiteNav />
      <div style={{ maxWidth:520, margin:'0 auto', padding:'1.5rem 5% 5rem' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.5rem' }}>
          <button onClick={() => router.back()}
            style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', cursor:'pointer', color:'#6B7280', fontSize:'0.82rem', fontWeight:600, fontFamily:"'Inter',sans-serif", padding:0 }}>
            <ArrowLeft size={15} /> {t('common.back')}
          </button>
          <button onClick={savePrefs}
            style={{ display:'flex', alignItems:'center', gap:6, background: saved?'#059669':'#0D1B3E', color:'#111827', border:'none', borderRadius:999, padding:'8px 18px', fontWeight:700, fontSize:'0.8rem', cursor:'pointer', fontFamily:"'Inter',sans-serif", transition:'all .2s' }}>
            {saved ? <><Check size={13}/> {t('profile.saved')}</> : <><Save size={13}/> {t('common.save')}</>}
          </button>
        </div>

        <h1 style={{ fontSize:'1.25rem', fontWeight:800, color:'#0D1B3E', marginBottom:'1.5rem', letterSpacing:'-0.025em' }}>{t('shopping.title')}</h1>

        {/* ── Orders Button ─────────────────────────── */}
        <button onClick={() => router.push('/orders')}
          style={{ width:'100%', display:'flex', alignItems:'center', gap:14, padding:'16px 18px', background:'#fff', borderRadius:16, border:'none', cursor:'pointer', marginBottom:'1.1rem', fontFamily:"'Inter',sans-serif", textAlign:'left' }}>
          <div style={{ width:44, height:44, borderRadius:12, background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <Package size={22} color="#1D4ED8" />
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:'1rem', fontWeight:800, color:'#111827' }}>{t('shopping.myOrders')}</div>
            <div style={{ fontSize:'0.72rem', color:'#9CA3AF', marginTop:2 }}>
              {orderCount.total > 0
                ? `${orderCount.total} ${t('shopping.ordersTotal')} · ${orderCount.pending} ${t('shopping.ordersPending')}`
                : t('shopping.orders')}
            </div>
          </div>
          <ChevronRight size={18} color="#9CA3AF" />
        </button>

        {/* ── SAVED SHOPS ─────────────────────────────── */}
        <div style={{ marginBottom:'1.1rem' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8, paddingLeft:4 }}>
            <p style={{ fontSize:'0.65rem', fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.09em', margin:0 }}>
              {t('shopping.savedShops')}
            </p>
            {savedShops.length > 0 && (
              <span style={{ fontSize:'0.65rem', fontWeight:700, color:'#0D1B3E', background:'#EEF2FF', padding:'2px 8px', borderRadius:999 }}>
                {savedShops.length}
              </span>
            )}
          </div>

          {savedShops.length === 0 ? (
            /* Empty state */
            <div style={{ background:'#fff', border:'1.5px solid #E2E8F0', borderRadius:14, padding:'1.5rem', textAlign:'center' }}>
              <div style={{ width:46, height:46, borderRadius:12, background:'#FFF1F2', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 10px' }}>
                <Heart size={22} color="#EF4444" />
              </div>
              <div style={{ fontSize:'0.85rem', fontWeight:700, color:'#111827', marginBottom:4 }}>
                {t('shopping.noSavedShops')}
              </div>
              <div style={{ fontSize:'0.74rem', color:'#9CA3AF', lineHeight:1.5, marginBottom:14 }}>
                {t('shopping.noSavedShopsDesc')}
              </div>
              <Link href="/market" style={{ display:'inline-flex', alignItems:'center', gap:6, background:'#fff', color:'#111827', padding:'8px 18px', borderRadius:999, fontWeight:700, fontSize:'0.78rem', textDecoration:'none' }}>
                <Store size={13} /> Browse Market
              </Link>
            </div>
          ) : (
            /* Saved shops list */
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {savedShops.map(shop => (
                <div key={shop.id} style={{ display:'flex', alignItems:'center', gap:12, background:'#fff', border:'1.5px solid #E2E8F0', borderRadius:14, padding:'12px 14px', transition:'border-color .15s' }}
                  onMouseOver={e => (e.currentTarget as HTMLElement).style.borderColor='#CBD5E1'}
                  onMouseOut={e  => (e.currentTarget as HTMLElement).style.borderColor='#E5E7EB'}>
                  
                  {/* Shop avatar */}
                  <div style={{ width:44, height:44, borderRadius:12, background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <Store size={18} color="#1D4ED8" />
                  </div>

                  {/* Info */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:'0.875rem', fontWeight:700, color:'#111827', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                      {shop.shop_name}
                    </div>
                    <div style={{ fontSize:'0.7rem', color:'#9CA3AF', marginTop:2 }}>
                      {[shop.shop_category, shop.shop_region].filter(Boolean).join(' · ')}
                      {shop.plan && (
                        <span style={{ marginLeft:6, background: shop.plan==='premium'?'rgba(29,78,216,0.15)':'rgba(59,130,246,0.1)', color: shop.plan==='premium'?'#A07830':'#1D4ED8', padding:'1px 6px', borderRadius:999, fontWeight:700, fontSize:'0.6rem', textTransform:'uppercase' as const }}>
                          {shop.plan}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                    <Link href={`/store/${shop.id}`}
                      style={{ display:'flex', alignItems:'center', gap:4, padding:'6px 12px', background:'#fff', color:'#111827', borderRadius:8, textDecoration:'none', fontSize:'0.72rem', fontWeight:700 }}>
                      <ExternalLink size={11} /> {t('shopping.visitShop')}
                    </Link>
                    <button onClick={() => removeShop(shop.id)}
                      style={{ width:32, height:32, borderRadius:8, background:'#FFF1F2', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#EF4444', transition:'background .15s' }}
                      onMouseOver={e => (e.currentTarget as HTMLElement).style.background='#FEE2E2'}
                      onMouseOut={e  => (e.currentTarget as HTMLElement).style.background='#FFF1F2'}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Saved Posts → Vybe ────────────────────── */}
        <button onClick={() => router.push('/vybe')}
          style={{ width:'100%', display:'flex', alignItems:'center', gap:14, padding:'14px 16px', background:'#fff', borderRadius:14, border:'1.5px solid #E2E8F0', cursor:'pointer', marginBottom:'1.1rem', fontFamily:"'Inter',sans-serif", textAlign:'left', transition:'background .15s' }}
          onMouseOver={e => (e.currentTarget as HTMLElement).style.background='#FFF1F2'}
          onMouseOut={e  => (e.currentTarget as HTMLElement).style.background='#fff'}>
          <div style={{ width:38, height:38, borderRadius:10, background:'rgba(239,68,68,0.10)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <Heart size={18} color="#EF4444" />
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:'0.9rem', fontWeight:700, color:'#111827' }}>{t('shopping.savedPosts')}</div>
            <div style={{ fontSize:'0.72rem', color:'#9CA3AF', marginTop:2 }}>{t('shopping.savedPostsDesc')}</div>
          </div>
          <ChevronRight size={15} color="#CBD5E1" />
        </button>

        {/* ── Favourite Categories ───────────────────── */}
        <div style={{ marginBottom:'1.1rem' }}>
          <p style={{ fontSize:'0.65rem', fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:8, paddingLeft:4 }}>{t('shopping.favouriteCategories')}</p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'7px' }}>
            {CATEGORIES.map(cat => {
              const sel = categories.includes(cat)
              return (
                <button key={cat} onClick={() => toggleCat(cat)}
                  style={{ padding:'7px 14px', borderRadius:999, border:`1.5px solid ${sel?'#1D4ED8':'#E5E7EB'}`, background: sel?'#1D4ED8':'#fff', color: sel?'#1D4ED8':'#64748B', fontSize:'0.78rem', fontWeight:600, cursor:'pointer', fontFamily:"'Inter',sans-serif", transition:'all .15s', display:'flex', alignItems:'center', gap:5 }}>
                  {sel && <Check size={11}/>} {cat}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Deal Alerts ───────────────────────────── */}
        <div style={{ marginBottom:'1.5rem' }}>
          <p style={{ fontSize:'0.65rem', fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:8, paddingLeft:4 }}>{t('shopping.dealAlerts')}</p>
          <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #E2E8F0', overflow:'hidden' }}>
            {ALERTS_CONFIG.map((item, i) => (
              <div key={item.key} style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 16px', borderBottom: i<3?'1px solid #F1F5F9':'none' }}>
                <div style={{ width:36, height:36, borderRadius:10, background:`${item.color}15`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <item.icon size={16} color={item.color} />
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:'0.875rem', fontWeight:600, color:'#111827' }}>{item.label}</div>
                  <div style={{ fontSize:'0.7rem', color:'#9CA3AF', marginTop:2 }}>{item.sub}</div>
                </div>
                <Toggle on={alerts[item.key as keyof typeof alerts]} onToggle={() => setAlerts(p => ({ ...p, [item.key]: !p[item.key as keyof typeof p] }))} />
              </div>
            ))}
          </div>
        </div>

      </div>
      <SiteFooter />
    </main>
  )
}
