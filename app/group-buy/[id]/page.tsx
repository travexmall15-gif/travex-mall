'use client'
import { useTranslation } from '@/hooks/useTranslation'
import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { sb } from '@/lib/supabase'
import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { Users, CheckCircle, Loader2, ArrowLeft, MessageCircle } from 'lucide-react'

type Group = {
  id: string; store_id: string; shop_name: string
  product_name: string; unit_price: number; discount_pct: number
  min_members: number; current_members: number; expires_at: string; status: string
  creator_name: string; creator_phone: string
}

const fmt = (n: number) => 'TZS ' + Number(n).toLocaleString()

export default function GroupDetailPage({
  params }: { params: Promise<{ id: string }> }) {
  const { t } = useTranslation()
  const { id }       = use(params)
  const [group, setGroup]   = useState<Group | null>(null)
  const [members, setMembers] = useState<any[]>([])
  const [name, setName]     = useState('')
  const [phone, setPhone]   = useState('')
  const [joining, setJoining] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]   = useState('')

  useEffect(() => {
    sb.from('group_orders').select('*').eq('id', id).single()
      .then(({ data, error }) => { if (!error && data) setGroup(data) })
    sb.from('group_order_members').select('name,phone,joined_at')
      .eq('group_id', id).order('joined_at')
      .then(({ data }) => setMembers(data || []))
  }, [id])

  async function joinGroup() {
    if (!name.trim()) { setError('Tafadhali ingiza jina lako.'); return }
    if (!phone.trim()) { setError('Tafadhali ingiza nambari yako ya simu.'); return }
    setJoining(true); setError('')

    // Check for duplicate by phone
    const already = members.find(m => m.phone?.trim() === phone.trim())
    if (already) { setError(t('groupBuy.alreadyJoined')); setJoining(false); return }

    try {
      // 1. Add member
      const { error: memberErr } = await sb.from('group_order_members')
        .insert({ group_id: id, name: name.trim(), phone: phone.trim(), joined_at: new Date().toISOString() })
      if (memberErr) throw memberErr

      // 2. Atomic increment via RPC (prevents race conditions)
      // Fallback: read-then-write if RPC not available
      const { data: latest } = await sb.from('group_orders')
        .select('current_members,min_members').eq('id', id).single()
      const newCount = (latest?.current_members || 0) + 1
      const { error: updErr } = await sb.from('group_orders')
        .update({ current_members: newCount }).eq('id', id)
      if (updErr) throw updErr

      // 3. Mark as ready if target reached
      if (latest && newCount >= (latest.min_members || 1)) {
        await sb.from('group_orders').update({ status: 'completed' }).eq('id', id)
      }

      // 4. Refresh members list and group state
      const { data: updatedMembers } = await sb.from('group_order_members')
        .select('name,phone,joined_at').eq('group_id', id).order('joined_at')
      setMembers(updatedMembers || [])
      setGroup(g => g ? { ...g, current_members: newCount } : g)
      setSuccess(true)
    } catch (e: any) {
      setError(e?.message || 'Hitilafu imetokea. Jaribu tena.')
    } finally {
      setJoining(false)
    }
  }

  if (!group) return (
    <main style={{ minHeight:'100vh', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <Loader2 size={32} style={{ animation:'spin 1s linear infinite', color:'#1D4ED8' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </main>
  )

  const pct      = Math.round((group.current_members / group.min_members) * 100)
  const discount = group.unit_price * (1 - group.discount_pct / 100)
  const remaining = group.min_members - group.current_members
  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareMsg = encodeURIComponent(`Jiunge nami kwenye group buy!\n\nBidhaa: ${group.product_name}\nBei ya kawaida: ${fmt(group.unit_price)}\nBei ya group: ${fmt(discount)} (-${group.discount_pct}%)\n\nTunahitaji watu ${remaining} zaidi!\n\nJiunge hapa: ${shareUrl}`)

  return (
    <main style={{ minHeight:'100vh', background:'#fff', fontFamily:"'Inter',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        *{box-sizing:border-box}@keyframes spin{to{transform:rotate(360deg)}}input{font-family:'Inter',sans-serif}`}</style>
      <SiteNav />
      <div style={{ paddingTop:80, maxWidth:560, margin:'0 auto', padding:'80px 5% 4rem' }}>
        <Link href="/group-buy" style={{ display:'inline-flex', alignItems:'center', gap:6,
          color:'#6B7280', textDecoration:'none', fontSize:13, marginBottom:20 }}>
          <ArrowLeft size={14} /> All Groups
        </Link>

        <div style={{ background:'#fff', borderRadius:20, padding:'1.5rem',
          boxShadow:'0 8px 30px rgba(29,78,216,0.1)', marginBottom:20 }}>
          <div style={{ fontSize:11, color:'#1E40AF', fontWeight:700, textTransform:'uppercase',
            letterSpacing:'.06em', marginBottom:4 }}>{group.shop_name}</div>
          <h1 style={{ fontFamily:"'Inter',sans-serif", fontSize:'1.4rem',
            fontWeight:900, color:'#111827', marginBottom:12 }}>{group.product_name}</h1>

          <div style={{ display:'flex', alignItems:'baseline', gap:8, marginBottom:16 }}>
            <span style={{ fontSize:24, fontWeight:900, color:'#1D4ED8' }}>{fmt(discount)}</span>
            <span style={{ fontSize:14, color:'#9CA3AF', textDecoration:'line-through' }}>{fmt(group.unit_price)}</span>
            <span style={{ fontSize:12, background:'#fff', color:'#1D4ED8',
              padding:'2px 8px', borderRadius:999, fontWeight:700 }}>-{group.discount_pct}%</span>
          </div>

          {/* Progress */}
          <div style={{ marginBottom:16 }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:12,
              color:'#6B7280', marginBottom:6 }}>
              <span><Users size={12} style={{marginRight:4}} />{group.current_members} joined</span>
              <span style={{ color: remaining <= 2 ? '#EF4444' : '#64748B', fontWeight:700 }}>
                Need {remaining} more
              </span>
            </div>
            <div style={{ height:10, background:'#fff', borderRadius:999 }}>
              <div style={{ height:'100%', width:`${Math.min(100,pct)}%`,
                background:'linear-gradient(90deg,#60A5FA,#1D4ED8)',
                borderRadius:999, transition:'width .5s' }} />
            </div>
            <div style={{ fontSize:11, color:'#6B7280', marginTop:4, textAlign:'center' }}>
              {group.min_members} members needed for {group.discount_pct}% discount to activate
            </div>
          </div>

          {/* Members */}
          {members.length > 0 && (
            <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginBottom:16 }}>
              {members.map((m,i) => (
                <div key={i} style={{ width:32, height:32, borderRadius:'50%',
                  background:'linear-gradient(135deg,#1D4ED8,#60A5FA)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:11, fontWeight:800, color:'#fff' }}>
                  {m.name[0].toUpperCase()}
                </div>
              ))}
            </div>
          )}

          {/* Share button */}
          <a href={`https://wa.me/?text=${shareMsg}`} target="_blank"
            style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              background:'#25D366', color:'#fff', borderRadius:999, padding:'11px',
              fontWeight:700, fontSize:13, textDecoration:'none', marginBottom:8 }}>
            <MessageCircle size={15} /> Share on WhatsApp, Invite Friends
          </a>
        </div>

        {success ? (
          <div style={{ background:'#fff', borderRadius:20, padding:'2rem', textAlign:'center',
            boxShadow:'0 8px 30px rgba(29,78,216,0.1)' }}>
            <CheckCircle size={48} style={{ color:'#22C55E', margin:'0 auto 12px' }} />
            <h2 style={{ fontFamily:"'Inter',sans-serif", color:'#111827', marginBottom:8 }}>
              You&apos;re In!
            </h2>
            <p style={{ color:'#6B7280', fontSize:13, marginBottom:16 }}>
              You joined the group. Share the link to invite more friends and activate the discount!
            </p>
            <a href={`https://wa.me/?text=${shareMsg}`} target="_blank"
              style={{ display:'inline-flex', alignItems:'center', gap:6,
                background:'#25D366', color:'#fff', borderRadius:999, padding:'11px 24px',
                fontWeight:700, fontSize:13, textDecoration:'none' }}>
              <MessageCircle size={14} /> Share Now
            </a>
          </div>
        ) : (
          <div style={{ background:'#fff', borderRadius:20, padding:'1.5rem',
            boxShadow:'0 8px 30px rgba(29,78,216,0.1)' }}>
            <h3 style={{ fontFamily:"'Inter',sans-serif", fontSize:'1.1rem',
              color:'#111827', fontWeight:800, marginBottom:16 }}>{t('groupBuy.joinTitle')}</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:16 }}>
              <input value={name} onChange={e=>setName(e.target.value)}
                placeholder="Your Full Name *"
                style={{ padding:'11px 14px', border:'1.5px solid #E2E8F0',
                  borderRadius:10, fontSize:14, outline:'none' }} />
              <input value={phone} onChange={e=>setPhone(e.target.value)}
                placeholder="Phone Number (+255...)" type="tel"
                style={{ padding:'11px 14px', border:'1.5px solid #E2E8F0',
                  borderRadius:10, fontSize:14, outline:'none' }} />
            </div>
            {error && <div style={{ background:'#FEF2F2', color:'#DC2626',
              padding:'10px', borderRadius:8, fontSize:13, marginBottom:12 }}>
              ⚠️ {error}
            </div>}
            <button onClick={joinGroup} disabled={joining}
              style={{ width:'100%', padding:'13px', background:'#1D4ED8',
                color:'#fff', border:'none', borderRadius:999,
                fontWeight:800, fontSize:14, cursor:'pointer',
                display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                fontFamily:'inherit' }}>
              {joining ? <><Loader2 size={15} style={{animation:'spin 1s linear infinite'}} /> Joining...</>
                : <><Users size={15} /> {t('groupBuy.joinBtn')}</>}
            </button>
          </div>
        )}
      </div>
      <SiteFooter />
    </main>
  )
}
