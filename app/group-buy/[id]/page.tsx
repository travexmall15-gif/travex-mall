'use client'
import { useTranslation } from '@/hooks/useTranslation'
import { use, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { sb } from '@/lib/supabase'
import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { Users, CheckCircle, Loader2, ArrowLeft, MessageCircle, Store, Clock, ShoppingBag } from 'lucide-react'

type Group = {
  id: string; store_id: string; shop_name: string
  product_name: string; product_image?: string | null
  unit_price: number; discount_pct: number
  min_members: number; current_members: number; expires_at: string; status: string
  creator_name: string; creator_phone: string
}

const fmt = (n: number) => 'TZS ' + Number(n).toLocaleString()

// ── Live HH:MM:SS countdown ──────────────────────────────────
function useCountdown(endTime: string | null) {
  const calc = useCallback(() => {
    if (!endTime) return { h: '00', m: '00', s: '00', done: false, ongoing: true }
    const diff = new Date(endTime).getTime() - Date.now()
    if (diff <= 0) return { h: '00', m: '00', s: '00', done: true, ongoing: false }
    const totalH = Math.floor(diff / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    const s = Math.floor((diff % 60000) / 1000)
    return { h: String(totalH).padStart(2, '0'), m: String(m).padStart(2, '0'), s: String(s).padStart(2, '0'), done: false, ongoing: false }
  }, [endTime])
  const [time, setTime] = useState(calc())
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000)
    return () => clearInterval(id)
  }, [calc])
  return time
}

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

  const countdown = useCountdown(group?.expires_at || null)

  useEffect(() => {
    sb.from('group_orders').select('*').eq('id', id).single()
      .then(({ data, error }) => { if (!error && data) setGroup(data) })
    sb.from('group_order_members').select('name,phone,joined_at')
      .eq('group_id', id).order('joined_at')
      .then(({ data }) => setMembers(data || []))
  }, [id])

  async function joinGroup() {
    if (!name.trim()) { setError(t('groupBuy.nameRequired')); return }
    if (!phone.trim()) { setError(t('groupBuy.phoneRequired')); return }
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
      setError(e?.message || t('groupBuy.genericError'))
    } finally {
      setJoining(false)
    }
  }

  if (!group) return (
    <main style={{ minHeight:'100vh', background:'var(--sn-page)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <Loader2 size={32} style={{ animation:'spin 1s linear infinite', color:'var(--sn-text)' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </main>
  )

  const pct       = Math.round((group.current_members / group.min_members) * 100)
  const discount  = group.unit_price * (1 - group.discount_pct / 100)
  const remaining = Math.max(group.min_members - group.current_members, 0)
  const isReady   = group.current_members >= group.min_members
  const isExpired = countdown.done && !isReady
  const shareUrl  = typeof window !== 'undefined' ? window.location.href : ''
  const shareMsg  = encodeURIComponent(`${group.product_name}\n${fmt(group.unit_price)} -> ${fmt(discount)} (-${group.discount_pct}%)\n\n${t('groupBuy.needMoreCount', { count: String(remaining) })}\n\n${shareUrl}`)

  return (
    <main style={{ minHeight:'100vh', background:'var(--sn-page)', fontFamily:'var(--sn-font)' }}>
      <style>{`*{box-sizing:border-box}@keyframes spin{to{transform:rotate(360deg)}}input{font-family:var(--sn-font)}`}</style>
      <SiteNav />
      <div style={{ paddingTop:80, maxWidth:560, margin:'0 auto', padding:'80px 5% 4rem' }}>
        <Link href="/group-buy" style={{ display:'inline-flex', alignItems:'center', gap:6,
          color:'var(--sn-muted)', textDecoration:'none', fontSize:13, marginBottom:20 }}>
          <ArrowLeft size={14} /> {t('groupBuy.backToGroups')}
        </Link>

        <div style={{ background:'var(--sn-bg)', border:'1px solid var(--sn-border)', borderRadius:20, overflow:'hidden',
          boxShadow:'0 8px 30px rgba(29,78,216,0.1)', marginBottom:20 }}>

          {/* Product image */}
          <div style={{ position:'relative', height:200, background: group.product_image ? 'var(--sn-page)' : 'linear-gradient(135deg,#DBEAFE,#EDE9FE)' }}>
            {group.product_image ? (
              <Image src={group.product_image} alt={group.product_name} fill style={{ objectFit:'cover' }} />
            ) : (
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', width:'100%', height:'100%' }}>
                <ShoppingBag size={44} color="rgba(29,78,216,0.35)" />
              </div>
            )}
            {/* Status ribbon */}
            {(isReady || isExpired) && (
              <div style={{ position:'absolute', top:10, left:10, background: isReady ? 'linear-gradient(135deg,#059669,#10B981)' : 'rgba(15,23,42,0.75)',
                color:'#fff', fontSize:11, fontWeight:900, padding:'4px 12px', borderRadius:999, letterSpacing:'0.04em' }}>
                {isReady ? t('groupBuy.groupUnlocked') : t('groupBuy.groupExpired')}
              </div>
            )}
          </div>

          <div style={{ padding:'1.5rem' }}>
          <div style={{ fontSize:11, color:'var(--sn-primary)', fontWeight:700, textTransform:'uppercase',
            letterSpacing:'.06em', marginBottom:4 }}>{group.shop_name}</div>
          <h1 style={{ fontFamily:'var(--sn-font)', fontSize:'1.4rem',
            fontWeight:900, color:'var(--sn-text)', marginBottom:12 }}>{group.product_name}</h1>

          <div style={{ display:'flex', alignItems:'baseline', gap:8, marginBottom:10 }}>
            <span style={{ fontSize:24, fontWeight:900, color:'var(--sn-text)' }}>{fmt(discount)}</span>
            <span style={{ fontSize:14, color:'var(--sn-subtle)', textDecoration:'line-through' }}>{fmt(group.unit_price)}</span>
            <span style={{ fontSize:12, background:'rgba(239,68,68,0.12)', color:'#EF4444',
              padding:'2px 8px', borderRadius:999, fontWeight:700 }}>-{group.discount_pct}%</span>
          </div>

          {/* Live countdown */}
          {!isExpired && !countdown.ongoing && (
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:16, fontSize:13, fontWeight:700, color: (parseInt(countdown.h) < 1) ? '#EF4444' : 'var(--sn-muted)' }}>
              <Clock size={13} />
              {t('groupBuy.endsInSeconds', { time: `${countdown.h}:${countdown.m}:${countdown.s}` })}
            </div>
          )}

          {/* Progress */}
          <div style={{ marginBottom:16 }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:12,
              color:'var(--sn-muted)', marginBottom:6 }}>
              <span style={{ display:'flex', alignItems:'center', gap:4 }}><Users size={12} />{t('groupBuy.joined', { curr: String(group.current_members), min: String(group.min_members) })}</span>
              <span style={{ color: remaining <= 2 && !isReady ? '#EF4444' : 'var(--sn-muted)', fontWeight:700 }}>
                {isReady ? t('groupBuy.readyLabel') : t('groupBuy.needMoreCount', { count: String(remaining) })}
              </span>
            </div>
            <div style={{ height:10, background:'var(--sn-page)', borderRadius:999 }}>
              <div style={{ height:'100%', width:`${Math.min(100,pct)}%`,
                background: isReady ? 'linear-gradient(90deg,#059669,#10B981)' : 'linear-gradient(90deg,#60A5FA,#1D4ED8)',
                borderRadius:999, transition:'width .5s' }} />
            </div>
            <div style={{ fontSize:11, color:'var(--sn-subtle)', marginTop:4, textAlign:'center' }}>
              {t('groupBuy.membersNeededDesc', { min: String(group.min_members), pct: String(group.discount_pct) })}
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

          {/* Visit Shop + Share */}
          <div style={{ display:'flex', gap:8, marginBottom:8 }}>
            <Link href={`/store/${group.store_id}`}
              style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:7,
                background:'var(--sn-page)', border:'1.5px solid var(--sn-border)', color:'var(--sn-text)',
                borderRadius:999, padding:'11px', fontWeight:700, fontSize:13, textDecoration:'none' }}>
              <Store size={14} /> {t('groupBuy.visitShop')}
            </Link>
            <a href={`https://wa.me/?text=${shareMsg}`} target="_blank" rel="noreferrer"
              style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:7,
                background:'#25D366', color:'#fff', borderRadius:999, padding:'11px',
                fontWeight:700, fontSize:13, textDecoration:'none' }}>
              <MessageCircle size={14} /> {t('groupBuy.shareWhatsapp')}
            </a>
          </div>
          </div>
        </div>

        {success ? (
          <div style={{ background:'var(--sn-bg)', border:'1px solid var(--sn-border)', borderRadius:20, padding:'2rem', textAlign:'center',
            boxShadow:'0 8px 30px rgba(29,78,216,0.1)' }}>
            <CheckCircle size={48} style={{ color:'#22C55E', margin:'0 auto 12px' }} />
            <h2 style={{ fontFamily:'var(--sn-font)', color:'var(--sn-text)', marginBottom:8, fontWeight:800 }}>
              {t('groupBuy.youreIn')}
            </h2>
            <p style={{ color:'var(--sn-muted)', fontSize:13, marginBottom:16 }}>
              {t('groupBuy.joinedShareDesc')}
            </p>
            <a href={`https://wa.me/?text=${shareMsg}`} target="_blank" rel="noreferrer"
              style={{ display:'inline-flex', alignItems:'center', gap:6,
                background:'#25D366', color:'#fff', borderRadius:999, padding:'11px 24px',
                fontWeight:700, fontSize:13, textDecoration:'none' }}>
              <MessageCircle size={14} /> {t('groupBuy.shareNow')}
            </a>
          </div>
        ) : isExpired ? (
          <div style={{ background:'var(--sn-bg)', border:'1px solid var(--sn-border)', borderRadius:20, padding:'2rem', textAlign:'center' }}>
            <p style={{ color:'var(--sn-muted)', fontSize:14 }}>{t('groupBuy.groupExpired')}</p>
          </div>
        ) : (
          <div style={{ background:'var(--sn-bg)', border:'1px solid var(--sn-border)', borderRadius:20, padding:'1.5rem',
            boxShadow:'0 8px 30px rgba(29,78,216,0.1)' }}>
            <h3 style={{ fontFamily:'var(--sn-font)', fontSize:'1.1rem',
              color:'var(--sn-text)', fontWeight:800, marginBottom:16 }}>{t('groupBuy.joinTitle')}</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:16 }}>
              <input value={name} onChange={e=>setName(e.target.value)}
                placeholder={t('groupBuy.namePlaceholder')}
                style={{ padding:'11px 14px', border:'1.5px solid var(--sn-input-border)', background:'var(--sn-input)', color:'var(--sn-text)',
                  borderRadius:10, fontSize:14, outline:'none' }} />
              <input value={phone} onChange={e=>setPhone(e.target.value)}
                placeholder={t('groupBuy.phonePlaceholder')} type="tel"
                style={{ padding:'11px 14px', border:'1.5px solid var(--sn-input-border)', background:'var(--sn-input)', color:'var(--sn-text)',
                  borderRadius:10, fontSize:14, outline:'none' }} />
            </div>
            {error && <div style={{ background:'rgba(220,38,38,0.08)', color:'#DC2626',
              padding:'10px', borderRadius:8, fontSize:13, marginBottom:12 }}>
              ⚠️ {error}
            </div>}
            <button onClick={joinGroup} disabled={joining}
              style={{ width:'100%', padding:'13px', background:'var(--sn-primary)',
                color:'var(--sn-primary-fg)', border:'none', borderRadius:999,
                fontWeight:800, fontSize:14, cursor: joining ? 'default' : 'pointer', opacity: joining ? 0.75 : 1,
                display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                fontFamily:'inherit' }}>
              {joining ? <><Loader2 size={15} style={{animation:'spin 1s linear infinite'}} /> {t('groupBuy.joining')}</>
                : <><Users size={15} /> {t('groupBuy.joinBtn')}</>}
            </button>
          </div>
        )}
      </div>
      <SiteFooter />
    </main>
  )
}

