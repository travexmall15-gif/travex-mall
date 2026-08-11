'use client'
import { useTranslation } from "@/hooks/useTranslation"

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { SiteNav } from '@/components/site-nav'
import { sb } from '@/lib/supabase'
import { ArrowLeft, MapPin, Loader2, Check, Wallet, Truck, CreditCard, AlertCircle } from 'lucide-react'

type PaymentMethod = {
  id: string
  name: string
  icon: string
  type: 'mobile' | 'bank'
  number?: string
}

const PAYMENT_METHODS: PaymentMethod[] = [
  { id:'tigopesa',  name:'Lipa Namba (Tigo Pesa)', icon:'📱', type:'mobile', number:'' },
  { id:'mpesa',     name:'M-Pesa',                 icon:'💚', type:'mobile', number:'' },
  { id:'yas',       name:'YAS (Airtel)',            icon:'🔴', type:'mobile', number:'' },
  { id:'airtel',    name:'Airtel Money',            icon:'🟠', type:'mobile', number:'' },
  { id:'halotel',   name:'Halotel Halopesa',        icon:'🟣', type:'mobile', number:'' },
  { id:'bank',      name:'Bank Transfer',           icon:'🏦', type:'bank',   number:'' },
]

type PayOption = 'full' | 'item-only' | 'delivery-later'

export default function PaymentPage({params }: { params: Promise<{ id: string }> }) {
  const { t } = useTranslation()
  const { id } = use(params)
  const router  = useRouter()

  const [order,      setOrder]      = useState<any>(null)
  const [loading,    setLoading]    = useState(true)
  const [step,       setStep]       = useState<'method' | 'option' | 'location' | 'confirm' | 'done'>('method')
  const [selMethod,  setSelMethod]  = useState<string>('')
  const [selOption,  setSelOption]  = useState<PayOption | ''>('')
  const [location,   setLocation]   = useState('')
  const [locLoading, setLocLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [note,       setNote]       = useState('')

  useEffect(() => {
    sb.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) { router.replace('/auth'); return }
      const { data } = await sb.from('orders').select('*').eq('id', id).single()
      setOrder(data)
      setLoading(false)
    })
  }, [id, router])

  const getLiveLocation = () => {
    setLocLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation(`${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`)
        setLocLoading(false)
      },
      () => {
        setLocLoading(false)
        alert('Could not get location. Please type your address.')
      }
    )
  }

  const submitPayment = async () => {
    setSubmitting(true)
    try {
      await sb.from('payments').insert({
        order_id:        id,
        payment_method:  selMethod,
        payment_option:  selOption,
        delivery_location: location,
        note,
        status:         'pending_confirmation',
        created_at:     new Date().toISOString(),
      })
      await sb.from('orders').update({ status: 'payment_pending' }).eq('id', id)
      setStep('done')
    } catch (e) {
      alert('Something went wrong. Please try again.')
    }
    setSubmitting(false)
  }

  const method = PAYMENT_METHODS.find(m => m.id === selMethod)

  const PAY_OPTIONS = [
    {
      id: 'full' as PayOption,
      icon: Wallet,
      title: 'Full Payment (Escrow)',
      sub: `Pay TZS ${order?.total_amount?.toLocaleString() || '—'} + delivery now`,
      desc: 'Money held safely in ShopNekt wallet. Released to seller ONLY after you confirm delivery.',
      badge: '🔒 Most Secure',
      badgeColor: '#059669',
    },
    {
      id: 'item-only' as PayOption,
      icon: CreditCard,
      title: 'Item Payment Only',
      sub: `Pay TZS ${order?.total_amount?.toLocaleString() || '—'} now`,
      desc: 'Pay for item now via wallet. Pay delivery fee directly to rider on arrival.',
      badge: '📦 Flexible',
      badgeColor: '#3B82F6',
    },
    {
      id: 'delivery-later' as PayOption,
      icon: Truck,
      title: 'Pay on Delivery',
      sub: 'Pay everything when you receive item',
      desc: 'Pay both item and delivery when rider arrives. Seller approves this method.',
      badge: '🚚 On Arrival',
      badgeColor: '#F59E0B',
    },
  ]

  if (loading) return (
    <main style={{ minHeight:'100vh', background:'#F8FAFF', paddingTop:108, fontFamily:"'Inter',sans-serif" }}>
      <SiteNav />
      <div style={{ textAlign:'center', padding:'5rem 0' }}>
        <Loader2 size={30} color="#0D1B3E" style={{ animation:'spin 1s linear infinite', margin:'0 auto', display:'block' }} />
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </main>
  )

  return (
    <main style={{ minHeight:'100vh', background:'#F8FAFF', paddingTop:108, fontFamily:"'Inter',sans-serif" }}>
      <SiteNav />
      <div style={{ maxWidth:520, margin:'0 auto', padding:'1.5rem 5% 5rem' }}>

        <button onClick={() => step==='method' ? router.back() : setStep(step==='option'?'method':step==='location'?'option':'location')}
          style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', cursor:'pointer', color:'#64748B', fontSize:'0.82rem', fontWeight:600, fontFamily:"'Inter',sans-serif", marginBottom:'1.25rem', padding:0 }}>
          <ArrowLeft size={15}/> {t('common.back')}
        </button>

        {/* Progress */}
        <div style={{ display:'flex', alignItems:'center', gap:4, marginBottom:'1.5rem' }}>
          {['Payment Method','Pay Option','Location','Confirm'].map((s,i) => {
            const steps = ['method','option','location','confirm','done']
            const cur = steps.indexOf(step)
            const done = i < cur
            const active = i === cur
            return (
              <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                <div style={{ width:'100%', height:3, borderRadius:999, background: done||active ? '#0D1B3E' : '#E2E8F0', transition:'all .3s' }} />
                <span style={{ fontSize:'0.55rem', fontWeight:600, color: done||active?'#0D1B3E':'#CBD5E1', textAlign:'center' }}>{s}</span>
              </div>
            )
          })}
        </div>

        {/* Order summary card */}
        <div style={{ background:'linear-gradient(135deg,#0D1B3E,#1B3A8A)', borderRadius:16, padding:'14px 18px', marginBottom:'1.5rem', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.45)', marginBottom:3 }}>{t('orders.orderTotal')}</div>
            <div style={{ fontSize:'1.2rem', fontWeight:900, color:'#1D4ED8' }}>TZS {order?.total_amount?.toLocaleString() || '—'}</div>
            <div style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.5)', marginTop:2 }}>{order?.product_name}</div>
          </div>
          <div style={{ background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:10, padding:'5px 12px' }}>
            <span style={{ fontSize:'0.72rem', fontWeight:700, color:'#EF4444' }}>{t('orders.rejected')}</span>
          </div>
        </div>

        {/* ── STEP 1: Payment Method ── */}
        {step === 'method' && (
          <>
            <h2 style={{ fontSize:'1rem', fontWeight:800, color:'#0D1B3E', marginBottom:'1rem', letterSpacing:'-0.02em' }}>
              Choose Payment Method
            </h2>
            <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:'1.25rem' }}>
              {PAYMENT_METHODS.map(pm => (
                <button key={pm.id} onClick={() => setSelMethod(pm.id)}
                  style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px', background:'#fff', border:`2px solid ${selMethod===pm.id?'#0D1B3E':'#E2E8F0'}`, borderRadius:14, cursor:'pointer', fontFamily:"'Inter',sans-serif", transition:'all .15s', textAlign:'left' }}>
                  <span style={{ fontSize:'1.4rem', width:36, textAlign:'center' }}>{pm.icon}</span>
                  <span style={{ flex:1, fontSize:'0.9rem', fontWeight:600, color:'#0F172A' }}>{pm.name}</span>
                  {selMethod===pm.id && <Check size={18} color="#0D1B3E" />}
                </button>
              ))}
            </div>
            <button onClick={() => selMethod && setStep('option')} disabled={!selMethod}
              style={{ width:'100%', padding:'0.9rem', background: selMethod?'#0D1B3E':'#E2E8F0', color: selMethod?'#1D4ED8':'#94A3B8', border:'none', borderRadius:14, fontWeight:700, fontSize:'0.9rem', cursor: selMethod?'pointer':'not-allowed', fontFamily:"'Inter',sans-serif", transition:'all .2s' }}>
              Continue →
            </button>
          </>
        )}

        {/* ── STEP 2: Payment Option ── */}
        {step === 'option' && (
          <>
            <div style={{ background:'#F8FAFF', borderRadius:12, padding:'10px 14px', marginBottom:'1rem', display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:'1.2rem' }}>{method?.icon}</span>
              <span style={{ fontSize:'0.85rem', fontWeight:700, color:'#0D1B3E' }}>{method?.name}</span>
            </div>
            <h2 style={{ fontSize:'1rem', fontWeight:800, color:'#0D1B3E', marginBottom:'1rem', letterSpacing:'-0.02em' }}>{t('payment.howToPay')}</h2>
            <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:'1.25rem' }}>
              {PAY_OPTIONS.map(opt => (
                <button key={opt.id} onClick={() => setSelOption(opt.id)}
                  style={{ display:'flex', alignItems:'flex-start', gap:14, padding:'16px', background:'#fff', border:`2px solid ${selOption===opt.id?'#0D1B3E':'#E2E8F0'}`, borderRadius:16, cursor:'pointer', fontFamily:"'Inter',sans-serif", transition:'all .15s', textAlign:'left' }}>
                  <div style={{ width:42, height:42, borderRadius:12, background: selOption===opt.id?'#0D1B3E':'#F1F5F9', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all .15s' }}>
                    <opt.icon size={20} color={selOption===opt.id?'#1D4ED8':'#64748B'} />
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                      <span style={{ fontSize:'0.9rem', fontWeight:700, color:'#0F172A' }}>{opt.title}</span>
                      <span style={{ fontSize:'0.6rem', fontWeight:700, background:`${opt.badgeColor}18`, color:opt.badgeColor, padding:'2px 8px', borderRadius:999 }}>{opt.badge}</span>
                    </div>
                    <div style={{ fontSize:'0.78rem', fontWeight:600, color:'#0D1B3E', marginBottom:4 }}>{opt.sub}</div>
                    <div style={{ fontSize:'0.72rem', color:'#94A3B8', lineHeight:1.5 }}>{opt.desc}</div>
                  </div>
                  {selOption===opt.id && <Check size={18} color="#0D1B3E" style={{ flexShrink:0 }} />}
                </button>
              ))}
            </div>
            <button onClick={() => selOption && setStep('location')} disabled={!selOption}
              style={{ width:'100%', padding:'0.9rem', background: selOption?'#0D1B3E':'#E2E8F0', color: selOption?'#1D4ED8':'#94A3B8', border:'none', borderRadius:14, fontWeight:700, fontSize:'0.9rem', cursor: selOption?'pointer':'not-allowed', fontFamily:"'Inter',sans-serif" }}>
              Continue →
            </button>
          </>
        )}

        {/* ── STEP 3: Delivery Location ── */}
        {step === 'location' && (
          <>
            <h2 style={{ fontSize:'1rem', fontWeight:800, color:'#0D1B3E', marginBottom:'0.5rem', letterSpacing:'-0.02em' }}>{t('payment.deliveryLocation')}</h2>
            <p style={{ fontSize:'0.78rem', color:'#64748B', marginBottom:'1.25rem', lineHeight:1.5 }}>
              Share your location so the seller can arrange delivery.
            </p>

            {/* Live location button */}
            <button onClick={getLiveLocation} disabled={locLoading}
              style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:10, padding:'13px', background:'linear-gradient(135deg,#0D1B3E,#1B3A8A)', border:'none', borderRadius:14, color:'#fff', fontWeight:700, fontSize:'0.875rem', cursor:'pointer', fontFamily:"'Inter',sans-serif", marginBottom:'1rem', transition:'opacity .2s', opacity: locLoading?0.7:1 }}>
              {locLoading
                ? <><Loader2 size={16} style={{ animation:'spin 1s linear infinite' }}/> Getting location...</>
                : <><MapPin size={16}/> {t('payment.useMyLocation')}</>}
            </button>

            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:'1rem' }}>
              <div style={{ flex:1, height:1, background:'#E2E8F0' }} />
              <span style={{ fontSize:'0.7rem', color:'#94A3B8', fontWeight:600 }}>{t('payment.orTypeAddress')}</span>
              <div style={{ flex:1, height:1, background:'#E2E8F0' }} />
            </div>

            <textarea value={location} onChange={e => setLocation(e.target.value)}
              placeholder="e.g. Kariakoo, Dar es Salaam, near Mnazi Mmoja hospital..."
              rows={3}
              style={{ width:'100%', boxSizing:'border-box', padding:'12px 14px', border:'1.5px solid #E2E8F0', borderRadius:12, fontSize:'0.875rem', fontFamily:"'Inter',sans-serif", outline:'none', resize:'vertical', background:'#fff', color:'#0F172A', lineHeight:1.5, marginBottom:'0.75rem' }}
              onFocus={e => (e.target.style.borderColor='#0D1B3E')}
              onBlur={e  => (e.target.style.borderColor='#E2E8F0')} />

            <textarea value={note} onChange={e => setNote(e.target.value)}
              placeholder="Delivery note (optional) — e.g. call on arrival, gate code..."
              rows={2}
              style={{ width:'100%', boxSizing:'border-box', padding:'12px 14px', border:'1.5px solid #E2E8F0', borderRadius:12, fontSize:'0.875rem', fontFamily:"'Inter',sans-serif", outline:'none', resize:'none', background:'#fff', color:'#0F172A', lineHeight:1.5, marginBottom:'1.25rem' }}
              onFocus={e => (e.target.style.borderColor='#0D1B3E')}
              onBlur={e  => (e.target.style.borderColor='#E2E8F0')} />

            <button onClick={() => location.trim() && setStep('confirm')} disabled={!location.trim()}
              style={{ width:'100%', padding:'0.9rem', background: location.trim()?'#0D1B3E':'#E2E8F0', color: location.trim()?'#1D4ED8':'#94A3B8', border:'none', borderRadius:14, fontWeight:700, fontSize:'0.9rem', cursor: location.trim()?'pointer':'not-allowed', fontFamily:"'Inter',sans-serif" }}>
              Continue →
            </button>
          </>
        )}

        {/* ── STEP 4: Confirm ── */}
        {step === 'confirm' && (
          <>
            <h2 style={{ fontSize:'1rem', fontWeight:800, color:'#0D1B3E', marginBottom:'1.25rem', letterSpacing:'-0.02em' }}>{t('payment.confirmPayment')}</h2>
            <div style={{ background:'#fff', borderRadius:16, border:'1.5px solid #E2E8F0', overflow:'hidden', marginBottom:'1.25rem' }}>
              {[
                { label:'Product',  value: order?.product_name },
                { label:'Amount',   value: `TZS ${order?.total_amount?.toLocaleString()}` },
                { label:'Payment',  value: method?.name },
                { label:'Option',   value: PAY_OPTIONS.find(p => p.id===selOption)?.title },
                { label:'Location', value: location.length > 40 ? location.slice(0,40)+'...' : location },
              ].map((row, i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'12px 16px', borderBottom: i<4?'1px solid #F1F5F9':'none', gap:12 }}>
                  <span style={{ fontSize:'0.78rem', color:'#94A3B8', fontWeight:600, flexShrink:0 }}>{row.label}</span>
                  <span style={{ fontSize:'0.82rem', color:'#0F172A', fontWeight:600, textAlign:'right' }}>{row.value}</span>
                </div>
              ))}
            </div>

            <div style={{ background:'rgba(249,115,22,0.06)', border:'1px solid rgba(249,115,22,0.2)', borderRadius:12, padding:'12px 14px', marginBottom:'1.25rem', display:'flex', gap:10 }}>
              <AlertCircle size={16} color="#F97316" style={{ flexShrink:0, marginTop:1 }} />
              <p style={{ fontSize:'0.75rem', color:'#92400E', lineHeight:1.55, margin:0 }}>
                {selOption==='full'
                  ? 'Payment held in escrow. Released to seller after you confirm receipt.'
                  : selOption==='item-only'
                  ? 'Item payment goes to escrow. Delivery paid directly to rider.'
                  : 'Pay seller and rider on arrival. Seller must approve this method.'}
              </p>
            </div>

            <button onClick={submitPayment} disabled={submitting}
              style={{ width:'100%', padding:'0.9rem', background:'#0D1B3E', color:'#1D4ED8', border:'none', borderRadius:14, fontWeight:700, fontSize:'0.9rem', cursor: submitting?'not-allowed':'pointer', fontFamily:"'Inter',sans-serif", display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              {submitting
                ? <><Loader2 size={16} style={{ animation:'spin 1s linear infinite' }}/> Processing...</>
                : 'Confirm & Submit Payment'}
            </button>
          </>
        )}

        {/* ── DONE ── */}
        {step === 'done' && (
          <div style={{ textAlign:'center', padding:'2rem 0' }}>
            <div style={{ width:72, height:72, borderRadius:'50%', background:'#DCFCE7', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
              <Check size={36} color="#059669" />
            </div>
            <h2 style={{ fontSize:'1.2rem', fontWeight:800, color:'#0D1B3E', marginBottom:8 }}>Payment Submitted!</h2>
            <p style={{ fontSize:'0.85rem', color:'#64748B', lineHeight:1.6, marginBottom:'2rem' }}>
              {selOption==='full'
                ? 'Your payment is held safely in escrow. The seller has been notified. Confirm delivery when you receive your item.'
                : selOption==='item-only'
                ? 'Item payment received. Pay delivery to the rider on arrival.'
                : 'Seller has been notified. Pay on delivery when rider arrives.'}
            </p>
            <button onClick={() => router.push('/orders')}
              style={{ padding:'12px 32px', background:'#0D1B3E', color:'#1D4ED8', border:'none', borderRadius:14, fontWeight:700, fontSize:'0.9rem', cursor:'pointer', fontFamily:"'Inter',sans-serif" }}>
              View My Orders
            </button>
          </div>
        )}

      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </main>
  )
}
