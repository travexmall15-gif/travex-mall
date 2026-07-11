'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { sb } from '@/lib/supabase'
import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { Users, Clock, Tag, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react'

type Group = {
  id: string; store_id: string; shop_name: string
  product_name: string; unit_price: number; discount_pct: number
  min_members: number; current_members: number; expires_at: string; status: string
}

const fmt = (n: number) => 'TZS ' + Number(n).toLocaleString()

function GroupCard({ group }: { group: Group }) {
  const pct      = Math.round((group.current_members / group.min_members) * 100)
  const discount = group.unit_price * (1 - group.discount_pct / 100)
  const save     = group.unit_price - discount
  const remaining = group.min_members - group.current_members

  return (
    <div style={{ background:'#fff', borderRadius:16, border:'2px solid #DBEAFE',
      padding:'1.25rem', boxShadow:'0 4px 20px rgba(59,130,246,0.08)' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
        <div>
          <div style={{ fontSize:11, color:'#1E40AF', fontWeight:700, textTransform:'uppercase',
            letterSpacing:'.06em', marginBottom:4 }}>
            {group.shop_name}
          </div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'1rem',
            fontWeight:800, color:'#0F172A' }}>
            {group.product_name}
          </div>
        </div>
        <div style={{ background:'#EFF6FF', color:'#1D4ED8', fontWeight:800,
          fontSize:13, padding:'4px 10px', borderRadius:999 }}>
          -{group.discount_pct}%
        </div>
      </div>

      {/* Price */}
      <div style={{ display:'flex', alignItems:'baseline', gap:8, marginBottom:12 }}>
        <span style={{ fontSize:20, fontWeight:900, color:'#1D4ED8' }}>{fmt(discount)}</span>
        <span style={{ fontSize:12, color:'#94A3B8', textDecoration:'line-through' }}>{fmt(group.unit_price)}</span>
        <span style={{ fontSize:11, color:'#15803D', fontWeight:700 }}>Save {fmt(save)}</span>
      </div>

      {/* Progress */}
      <div style={{ marginBottom:12 }}>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:12,
          color:'#64748B', marginBottom:6 }}>
          <span style={{ display:'flex', alignItems:'center', gap:4 }}>
            <Users size={12} /> {group.current_members}/{group.min_members} joined
          </span>
          <span style={{ color: remaining <= 2 ? '#EF4444' : '#64748B' }}>
            {remaining} more needed
          </span>
        </div>
        <div style={{ height:8, background:'#EFF6FF', borderRadius:999 }}>
          <div style={{ height:'100%', width:`${Math.min(100,pct)}%`,
            background:'linear-gradient(90deg,#60A5FA,#1D4ED8)',
            borderRadius:999, transition:'width .5s' }} />
        </div>
      </div>

      <Link href={`/group-buy/${group.id}`}
        style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6,
          background:'#1D4ED8', color:'#fff', borderRadius:999, padding:'11px',
          fontWeight:800, fontSize:13, textDecoration:'none',
          boxShadow:'0 4px 14px rgba(29,78,216,0.35)' }}>
        <Users size={14} /> Join Group & Save
      </Link>
    </div>
  )
}

export default function GroupBuyPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    sb.from('group_orders')
      .select('*')
      .eq('status','open')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .then(({ data }) => { setGroups(data||[]); setLoading(false) })
  }, [])

  return (
    <main style={{ minHeight:'100vh', background:'#EFF6FF' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Inter:wght@400;500;600;700;800&display=swap');*{box-sizing:border-box}`}</style>
      <SiteNav />

      <div style={{ paddingTop:64, background:'linear-gradient(135deg,#1E3A8A,#1D4ED8)', color:'#fff' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'2rem 5%' }}>
          <Link href="/market" style={{ display:'inline-flex', alignItems:'center', gap:6,
            color:'rgba(255,255,255,0.7)', textDecoration:'none', fontSize:13, marginBottom:12 }}>
            <ArrowLeft size={14} /> Back
          </Link>
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, marginBottom:8,
            background:'rgba(255,255,255,0.15)', padding:'4px 12px', borderRadius:999,
            fontSize:11, fontWeight:700 }}>
            <Users size={12} /> NUNUA PAMOJA, GROUP BUYING
          </div>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(1.8rem,4vw,2.8rem)', fontWeight:900, marginBottom:8 }}>
            👥 Buy Together, Save More
          </h1>
          <p style={{ color:'rgba(255,255,255,0.75)', fontSize:14 }}>
            Join a group and get up to 20% off. Share with friends on WhatsApp!
          </p>
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'2rem 5% 5rem' }}>
        {loading ? (
          <div style={{ textAlign:'center', padding:'4rem 0' }}>
            <Loader2 size={32} style={{ animation:'spin 1s linear infinite', color:'#1D4ED8', margin:'0 auto 12px' }} />
            <p style={{ color:'#64748B' }}>Loading groups...</p>
          </div>
        ) : groups.length === 0 ? (
          <div style={{ textAlign:'center', padding:'5rem 0' }}>
            <div style={{ fontSize:56, marginBottom:16 }}>👥</div>
            <h2 style={{ fontFamily:"'Playfair Display',serif", color:'#0F172A', marginBottom:8 }}>
              No Active Groups
            </h2>
            <p style={{ color:'#64748B', marginBottom:24 }}>Sellers will post group deals soon!</p>
            <Link href="/market" style={{ background:'#1D4ED8', color:'#fff',
              padding:'12px 28px', borderRadius:999, fontWeight:700, textDecoration:'none', fontSize:14 }}>
              Browse Market
            </Link>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'1.25rem' }}>
            {groups.map(g => <GroupCard key={g.id} group={g} />)}
          </div>
        )}
      </div>
      <SiteFooter />
    </main>
  )
}
