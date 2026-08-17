'use client'
import { useTranslation } from "@/hooks/useTranslation"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { Bell, Package, Tag, MessageCircle, Zap, Users, ArrowLeft } from 'lucide-react'

const KEYS = ['push','orders','deals','messages','flashDeals','groupBuy']
const DEFAULTS = { push:true, orders:true, deals:true, messages:true, flashDeals:true, groupBuy:false }

const Toggle = ({ on, onToggle }: { on:boolean; onToggle:()=>void }) => (
  <button onClick={onToggle} style={{ width:46, height:26, borderRadius:999, background: on ? '#0D1B3E' : 'var(--sn-border)', border:'none', cursor:'pointer', position:'relative', transition:'all .25s', flexShrink:0 }}>
    <div style={{ width:20, height:20, borderRadius:'50%', background: on ? '#1D4ED8' : '#fff', position:'absolute', top:3, left: on ? 23 : 3, transition:'all .25s', boxShadow:'0 1px 4px rgba(0,0,0,0.15)' }} />
  </button>
)

export default function NotificationsPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [s, setS] = useState(DEFAULTS)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('sn_notif')
      if (saved) setS({ ...DEFAULTS, ...JSON.parse(saved) })
    } catch {}
  }, [])

  const toggle = (key: string) => {
    const n = { ...s, [key]: !s[key as keyof typeof s] }
    setS(n as typeof DEFAULTS)
    localStorage.setItem('sn_notif', JSON.stringify(n))
  }

  const items = [
    { key:'push',       icon:Bell,           label:'Push Notifications', sub:'All app notifications' },
    { key:'orders',     icon:Package,        label:'Order Updates',       sub:'Shipping, delivery status' },
    { key:'deals',      icon:Tag,            label:'Deals & Offers',      sub:'Discounts, special prices' },
    { key:'messages',   icon:MessageCircle,  label:'Messages',            sub:'Seller replies & updates' },
    { key:'flashDeals', icon:Zap,            label:'Flash Deals',         sub:'Limited time offers' },
    { key:'groupBuy',   icon:Users,          label:'Group Buy Updates',   sub:'When group reaches target' },
  ]

  return (
    <main style={{ minHeight:'100vh', background:'var(--sn-page)', paddingTop:108, fontFamily:"'Inter',sans-serif" }}>
      <SiteNav />
      <div style={{ maxWidth:480, margin:'0 auto', padding:'1.5rem 5% 4rem' }}>
        <button onClick={() => router.back()} style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', cursor:'pointer', color:'var(--sn-muted)', fontSize:'0.82rem', fontWeight:600, fontFamily:"'Inter',sans-serif", marginBottom:'1.5rem', padding:0 }}>
          <ArrowLeft size={15} /> Back
        </button>
        <h1 style={{ fontSize:'1.25rem', fontWeight:800, color:'#0D1B3E', marginBottom:'1.5rem', letterSpacing:'-0.025em' }}>{t('notifications.title')}</h1>

        <div style={{ background:'var(--sn-bg)', borderRadius:16, border:'1.5px solid #E2E8F0', overflow:'hidden' }}>
          {items.map((item, i) => (
            <div key={item.key} style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px', borderBottom: i < items.length-1 ? '1px solid #F1F5F9' : 'none' }}>
              <div style={{ width:38, height:38, borderRadius:10, background:'var(--sn-page)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <item.icon size={17} color="#0D1B3E" />
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--sn-text)' }}>{item.label}</div>
                <div style={{ fontSize:'0.7rem', color:'var(--sn-subtle)', marginTop:2 }}>{item.sub}</div>
              </div>
              <Toggle on={s[item.key as keyof typeof s]} onToggle={() => toggle(item.key)} />
            </div>
          ))}
        </div>
        <p style={{ fontSize:'0.7rem', color:'var(--sn-subtle)', textAlign:'center', marginTop:'1rem' }}>
          Preferences saved automatically
        </p>
      </div>
      <SiteFooter />
    </main>
  )
}
