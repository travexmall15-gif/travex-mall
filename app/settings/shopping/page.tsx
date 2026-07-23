'use client'
import { useTranslation } from "@/hooks/useTranslation"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { sb } from '@/lib/supabase'
import {
  ArrowLeft, Package, Heart, Tag, Bell,
  Zap, Users, Check, ChevronRight, Save, Loader2
} from 'lucide-react'

const CATEGORIES = [
  'Fashion & Clothing','Electronics','Food & Groceries','Beauty & Health',
  'Agriculture','Services','Home & Living','Sports & Fitness',
  'Education','Automotive','Arts & Crafts','Technology',
]

const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
  <button onClick={onToggle}
    style={{ width:46, height:26, borderRadius:999, background: on?'#0D1B3E':'#E2E8F0', border:'none', cursor:'pointer', position:'relative', transition:'all .25s', flexShrink:0 }}>
    <div style={{ width:20, height:20, borderRadius:'50%', background: on?'#C9A84C':'#fff', position:'absolute', top:3, left: on?23:3, transition:'all .25s', boxShadow:'0 1px 4px rgba(0,0,0,0.15)' }} />
  </button>
)

export default function ShoppingPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [categories, setCategories] = useState<string[]>([])
  const [alerts, setAlerts] = useState({ flashDeals:true, groupBuy:true, priceDrops:false, newArrivals:false })
  const [saved, setSaved] = useState(false)
  const [orderCount, setOrderCount] = useState<{pending:number,total:number}>({ pending:0, total:0 })

  useEffect(() => {
    sb.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) { router.replace('/auth'); return }
      try {
        const p = JSON.parse(localStorage.getItem('sn_shopping_prefs') || '{}')
        if (p.categories) setCategories(p.categories)
        if (p.alerts) setAlerts(a => ({ ...a, ...p.alerts }))
      } catch {}
      try {
        const { data } = await sb.from('orders').select('status').eq('buyer_id', session.user.id)
        if (data) setOrderCount({ total: data.length, pending: data.filter(o => o.status === 'pending').length })
      } catch {}
    })
  }, [router])

  const toggleCat = (c: string) => setCategories(p => p.includes(c) ? p.filter(x => x!==c) : [...p,c])

  const savePrefs = () => {
    localStorage.setItem('sn_shopping_prefs', JSON.stringify({ categories, alerts }))
    setSaved(true); setTimeout(() => setSaved(false), 1800)
  }

  return (
    <main style={{ minHeight:'100vh', background:'#F8FAFF', paddingTop:108, fontFamily:"'Inter',sans-serif" }}>
      <SiteNav />
      <div style={{ maxWidth:520, margin:'0 auto', padding:'1.5rem 5% 5rem' }}>

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.5rem' }}>
          <button onClick={() => router.back()}
            style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', cursor:'pointer', color:'#64748B', fontSize:'0.82rem', fontWeight:600, fontFamily:"'Inter',sans-serif", padding:0 }}>
            <ArrowLeft size={15} /> Back
          </button>
          <button onClick={savePrefs}
            style={{ display:'flex', alignItems:'center', gap:6, background: saved?'#059669':'#0D1B3E', color:'#fff', border:'none', borderRadius:999, padding:'8px 18px', fontWeight:700, fontSize:'0.8rem', cursor:'pointer', fontFamily:"'Inter',sans-serif", transition:'all .2s' }}>
            {saved ? <><Check size={13}/> Saved!</> : <><Save size={13}/> Save</>}
          </button>
        </div>

        <h1 style={{ fontSize:'1.25rem', fontWeight:800, color:'#0D1B3E', marginBottom:'1.5rem', letterSpacing:'-0.025em' }}>{t('shopping.title')}</h1>

        {/* ── Orders Button ─────────────────────────── */}
        <button onClick={() => router.push('/orders')}
          style={{ width:'100%', display:'flex', alignItems:'center', gap:14, padding:'16px 18px', background:'linear-gradient(135deg,#0D1B3E,#1B3A8A)', borderRadius:16, border:'none', cursor:'pointer', marginBottom:'1.1rem', fontFamily:"'Inter',sans-serif", textAlign:'left' }}>
          <div style={{ width:44, height:44, borderRadius:12, background:'rgba(255,255,255,0.12)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <Package size={22} color="#C9A84C" />
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:'1rem', fontWeight:800, color:'#fff' }}>{t('shopping.orders')}</div>
            <div style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.5)', marginTop:2 }}>
              {orderCount.total} total · {orderCount.pending} pending
            </div>
          </div>
          <ChevronRight size={18} color="rgba(255,255,255,0.4)" />
        </button>

        {/* ── Saved Posts ───────────────────────────── */}
        <button onClick={() => router.push('/vybe')}
          style={{ width:'100%', display:'flex', alignItems:'center', gap:14, padding:'14px 16px', background:'#fff', borderRadius:14, border:'1.5px solid #E2E8F0', cursor:'pointer', marginBottom:'1.1rem', fontFamily:"'Inter',sans-serif", textAlign:'left', transition:'background .15s' }}
          onMouseOver={e => (e.currentTarget as HTMLElement).style.background='#FFF1F2'}
          onMouseOut={e  => (e.currentTarget as HTMLElement).style.background='#fff'}>
          <div style={{ width:38, height:38, borderRadius:10, background:'rgba(239,68,68,0.10)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <Heart size={18} color="#EF4444" />
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:'0.9rem', fontWeight:700, color:'#0F172A' }}>{t('shopping.savedPosts')}</div>
            <div style={{ fontSize:'0.72rem', color:'#94A3B8', marginTop:2 }}>{t('shopping.savedPostsDesc')}</div>
          </div>
          <ChevronRight size={15} color="#CBD5E1" />
        </button>

        {/* ── Categories ────────────────────────────── */}
        <div style={{ marginBottom:'1.1rem' }}>
          <p style={{ fontSize:'0.65rem', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:8, paddingLeft:4 }}>{t('shopping.favouriteCategories')}</p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'7px' }}>
            {CATEGORIES.map(cat => {
              const sel = categories.includes(cat)
              return (
                <button key={cat} onClick={() => toggleCat(cat)}
                  style={{ padding:'7px 14px', borderRadius:999, border:`1.5px solid ${sel?'#0D1B3E':'#E2E8F0'}`, background: sel?'#0D1B3E':'#fff', color: sel?'#C9A84C':'#64748B', fontSize:'0.78rem', fontWeight:600, cursor:'pointer', fontFamily:"'Inter',sans-serif", transition:'all .15s', display:'flex', alignItems:'center', gap:5 }}>
                  {sel && <Check size={11}/>} {cat}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Deal Alerts ───────────────────────────── */}
        <div style={{ marginBottom:'1.5rem' }}>
          <p style={{ fontSize:'0.65rem', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:8, paddingLeft:4 }}>{t('shopping.dealAlerts')}</p>
          <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #E2E8F0', overflow:'hidden' }}>
            {[
              { key:'flashDeals',  icon:Zap,   label:'Flash Deals',        sub:'Limited time offers',          color:'#EF4444' },
              { key:'groupBuy',    icon:Users, label:'Group Buy Targets',  sub:'When group reaches target',    color:'#10B981' },
              { key:'priceDrops',  icon:Tag,   label:'Price Drop Alerts',  sub:'Saved items price changes',    color:'#F59E0B' },
              { key:'newArrivals', icon:Bell,  label:'New Arrivals',       sub:'New products in categories',   color:'#6366F1' },
            ].map((item, i) => (
              <div key={item.key} style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 16px', borderBottom: i<3?'1px solid #F1F5F9':'none' }}>
                <div style={{ width:36, height:36, borderRadius:10, background:`${item.color}15`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <item.icon size={16} color={item.color} />
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:'0.875rem', fontWeight:600, color:'#0F172A' }}>{item.label}</div>
                  <div style={{ fontSize:'0.7rem', color:'#94A3B8', marginTop:2 }}>{item.sub}</div>
                </div>
                <Toggle on={alerts[item.key as keyof typeof alerts]} onToggle={() => setAlerts(p => ({ ...p, [item.key]: !p[item.key as keyof typeof p] }))} />
              </div>
            ))}
          </div>
        </div>

      </div>
      <SiteFooter />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </main>
  )
}
