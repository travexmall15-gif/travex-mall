'use client'
import { useState, useMemo, useRef } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { sb } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight, ArrowLeft, Check, Store, Shirt, Car, Smartphone,
  Upload, Loader2, AlertCircle, CheckCircle2, MessageCircle,
} from 'lucide-react'

// ── Marketplace → category map (matches existing pending_payments schema) ──
const MARKET_CATS: Record<string, string[]> = {
  fashion:     ['Clothing', 'Shoes', 'Accessories', 'Beauty', 'Jewelry', 'Sports & Fitness', 'Arts & Crafts'],
  vehicle:     ['Cars', 'Motorcycles', 'Spare Parts', 'Tyres', 'Auto Accessories'],
  electronics: ['Phones', 'Laptops', 'TVs', 'Audio', 'Appliances', 'Gaming', 'Other Electronics'],
}

const REGIONS = ['Dar es Salaam', 'Arusha', 'Mwanza', 'Dodoma', 'Tanga']

const BRAND_COLORS = ['#7800FF', '#050B2E', '#059669', '#DC2626', '#D97706', '#7C3AED', '#0891B2', '#BE185D']

const PRICE = { basic: 25000, premium: 45000 }

type FormData = {
  ownerName: string
  ownerPhone: string
  ownerEmail: string
  pin: string
  market: string
  shopName: string
  category: string
  region: string
  shopWhatsapp: string
  desc: string
  color: string
  plan: 'basic' | 'premium'
}

const EMPTY: FormData = {
  ownerName: '', ownerPhone: '', ownerEmail: '', pin: '',
  market: '', shopName: '', category: '', region: '', shopWhatsapp: '',
  desc: '', color: BRAND_COLORS[0], plan: 'basic',
}

const fmt = (n: number) => 'TZS ' + n.toLocaleString('en-US')

export default function OpenStorePage() {
  const { t } = useTranslation()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>(EMPTY)
  const [err, setErr] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const STEPS = [
    t('apply.stepAccount'), t('apply.stepMarketplace'), t('apply.stepShopInfo'),
    t('apply.stepPlan'), t('apply.stepReview'), t('apply.stepSubmit'),
  ]

  const set = <K extends keyof FormData>(k: K, v: FormData[K]) => setForm(f => ({ ...f, [k]: v }))

  const categories = useMemo(() => MARKET_CATS[form.market] || [], [form.market])

  const goNext = () => {
    setErr('')
    if (step === 1) {
      if (!form.ownerName.trim() || !form.ownerPhone.trim() || !form.ownerEmail.trim() || !form.pin.trim()) {
        setErr(t('apply.errRequired')); return
      }
      if (!form.ownerEmail.includes('@')) { setErr(t('apply.errEmail')); return }
      if (!/^\d{4}$/.test(form.pin)) { setErr(t('apply.errPin')); return }
    }
    if (step === 2 && !form.market) { setErr(t('apply.errRequired')); return }
    if (step === 3) {
      if (!form.shopName.trim() || !form.category || !form.region || !form.shopWhatsapp.trim() || !form.desc.trim()) {
        setErr(t('apply.errRequired')); return
      }
      if (form.desc.trim().length < 20) { setErr(t('apply.errDesc')); return }
    }
    setStep(s => Math.min(6, s + 1))
  }
  const goBack = () => { setErr(''); setStep(s => Math.max(1, s - 1)) }

  const onLogoPick = (file: File | null) => {
    if (!file) {return}
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { setErr(t('apply.errGeneric')); return }
    if (file.size > 2.5 * 1024 * 1024) { setErr(t('apply.errGeneric')); return }
    setLogoFile(file)
    const reader = new FileReader()
    reader.onload = e => setLogoPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const submit = async () => {
    setSubmitting(true)
    setErr('')
    try {
      let shop_logo: string | undefined
      if (logoFile) {
        setUploading(true)
        try {
          const ext = logoFile.name.split('.').pop()?.toLowerCase() || 'jpg'
          const path = `logos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
          const { error } = await sb.storage.from('shop-assets').upload(path, logoFile, { cacheControl: '3600', upsert: true })
          if (!error) {shop_logo = sb.storage.from('shop-assets').getPublicUrl(path).data.publicUrl}
        } catch {}
        setUploading(false)
      }

      const payload = {
        owner_name: form.ownerName.trim(),
        owner_phone: form.ownerPhone.trim(),
        owner_email: form.ownerEmail.trim().toLowerCase(),
        shop_name: form.shopName.trim(),
        shop_category: form.category,
        shop_region: form.region,
        shop_whatsapp: form.shopWhatsapp.trim(),
        shop_desc: form.desc.trim(),
        shop_color: form.color,
        shop_market: form.market,
        plan: form.plan,
        login_password: form.pin.trim(),
        ...(shop_logo ? { shop_logo } : {}),
      }

      const res = await fetch('/api/register-store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15000),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {throw new Error(data.error || t('apply.errGeneric'))}

      try { localStorage.setItem('sn_applied_email', payload.owner_email) } catch {}
      setSuccess(true)
    } catch (e: any) {
      setErr(e?.message || t('apply.errGeneric'))
    } finally {
      setSubmitting(false)
    }
  }

  const isPremium = form.plan === 'premium'

  return (
    <main style={{ fontFamily: 'var(--sn-font)', background: 'var(--sn-page)', minHeight: '100vh' }}>
      {success ? (
        <section style={{ maxWidth: 560, margin: '0 auto', padding: '7rem 6% 5rem', textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(5,150,105,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <CheckCircle2 size={36} color="#059669" />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--sn-text)', marginBottom: '0.75rem' }}>{t('apply.successTitle')}</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--sn-muted)', lineHeight: 1.7, marginBottom: '2rem' }}>{t('apply.successDesc')}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', textAlign: 'left', background: 'var(--sn-bg)', border: `1px solid var(--sn-border)`, borderRadius: 16, padding: '1.25rem', marginBottom: '2rem' }}>
            {[t('apply.next1'), t('apply.next2'), t('apply.next3'), t('apply.next4')].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg,#FF0080,#7800FF)', color: 'var(--sn-primary-fg)', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</div>
                <span style={{ fontSize: '0.82rem', color: 'var(--sn-text)' }}>{s}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/market" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg,#FF0080,#7800FF)', color: 'var(--sn-primary-fg)', padding: '0.75rem 1.5rem', borderRadius: 999, fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>
              <Store size={15} /> {t('apply.viewMarket')}
            </Link>
            <a href="https://wa.me/255651919915" target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#25D366', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: 999, fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>
              <MessageCircle size={15} /> {t('apply.whatsappSupport')}
            </a>
          </div>
        </section>
      ) : (
        <>
          {/* Hero */}
          <section style={{ paddingBottom: '1.5rem', textAlign: 'center', padding: '128px 6% 1.5rem' }}>
            <h1 style={{ fontSize: 'clamp(1.5rem,4vw,2.1rem)', fontWeight: 900, color: 'var(--sn-text)', letterSpacing: '-0.02em', marginBottom: 6 }}>
              {t('openStore.heroH1')} <span style={{ color: 'var(--sn-primary)' }}>{t('openStore.heroH1Store')}</span>
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--sn-muted)', maxWidth: 440, margin: '0 auto' }}>{t('openStore.bizDescFull')}</p>
          </section>

          {/* Progress */}
          <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 6%' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {STEPS.map((_, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'initial' }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.65rem', fontWeight: 800, flexShrink: 0, border: `2px solid ${i + 1 <= step ? 'var(--sn-primary)' : 'var(--sn-border)'}`,
                    background: i + 1 < step ? 'var(--sn-primary)' : i + 1 === step ? 'var(--sn-primary)' : 'var(--sn-bg)',
                    color: i + 1 <= step ? '#fff' : 'var(--sn-subtle)',
                  }}>
                    {i + 1 < step ? <Check size={12} /> : i + 1}
                  </div>
                  {i < STEPS.length - 1 && <div style={{ flex: 1, height: 2, margin: '0 3px', background: i + 1 < step ? 'var(--sn-primary)' : 'var(--sn-border)' }} />}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, marginBottom: '1.5rem' }}>
              {STEPS.map((s, i) => (
                <span key={i} style={{ fontSize: '0.56rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: i + 1 === step ? 'var(--sn-primary)' : i + 1 < step ? '#059669' : 'var(--sn-subtle)', flex: 1, textAlign: i === 0 ? 'left' : i === STEPS.length - 1 ? 'right' : 'center' }}>
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Form body */}
          <section style={{ maxWidth: 640, margin: '0 auto', padding: '0 6% 6rem' }}>
            {err && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)', color: '#DC2626', borderRadius: 12, padding: '0.75rem 1rem', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
                <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} /> {err}
              </div>
            )}

            {/* STEP 1 — Account */}
            {step === 1 && (
              <Card>
                <StepHeading title={t('apply.accountTitle')} sub={t('apply.accountSub')} />
                <Field label={t('apply.fullName')} required>
                  <input style={inputStyle} placeholder={t('apply.fullNamePh')} value={form.ownerName} onChange={e => set('ownerName', e.target.value)} />
                </Field>
                <Row2>
                  <Field label={t('apply.whatsapp')} required>
                    <input style={inputStyle} type="tel" placeholder={t('apply.whatsappPh')} value={form.ownerPhone} onChange={e => set('ownerPhone', e.target.value)} />
                  </Field>
                  <Field label={t('apply.email')} required>
                    <input style={inputStyle} type="email" placeholder={t('apply.emailPh')} value={form.ownerEmail} onChange={e => set('ownerEmail', e.target.value)} />
                  </Field>
                </Row2>
                <Field label={t('apply.choosePin')} required hint={t('apply.pinHint')}>
                  <input style={{ ...inputStyle, maxWidth: 140, letterSpacing: '0.3em', fontWeight: 800 }} inputMode="numeric" maxLength={4} placeholder="••••"
                    value={form.pin} onChange={e => set('pin', e.target.value.replace(/\D/g, '').slice(0, 4))} />
                </Field>
              </Card>
            )}

            {/* STEP 2 — Marketplace */}
            {step === 2 && (
              <Card>
                <StepHeading title={t('apply.marketTitle')} sub={t('apply.marketSub')} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12 }}>
                  {[
                    { key: 'fashion', icon: Shirt, label: t('apply.marketFashion'), desc: t('apply.marketFashionDesc') },
                    { key: 'vehicle', icon: Car, label: t('apply.marketVehicle'), desc: t('apply.marketVehicleDesc') },
                    { key: 'electronics', icon: Smartphone, label: t('apply.marketElectronics'), desc: t('apply.marketElectronicsDesc') },
                  ].map(m => {
                    const sel = form.market === m.key
                    return (
                      <button key={m.key} onClick={() => { set('market', m.key); set('category', '') }}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10, textAlign: 'left', padding: '1.25rem 1rem', borderRadius: 16, border: `2px solid ${sel ? 'var(--sn-primary)' : 'var(--sn-border)'}`, background: sel ? 'color-mix(in srgb, var(--sn-primary) 8%, var(--sn-bg))' : 'var(--sn-bg)', cursor: 'pointer', fontFamily: 'var(--sn-font)', transition: 'all .15s' }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: sel ? 'var(--sn-primary)' : 'var(--sn-page)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <m.icon size={18} color={sel ? '#fff' : 'var(--sn-muted)'} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--sn-text)' }}>{m.label}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--sn-subtle)', marginTop: 2, lineHeight: 1.4 }}>{m.desc}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </Card>
            )}

            {/* STEP 3 — Shop Info */}
            {step === 3 && (
              <Card>
                <StepHeading title={t('apply.shopInfoTitle')} sub={t('apply.shopInfoSub')} />
                <Field label={t('apply.shopName')} required>
                  <input style={inputStyle} placeholder={t('apply.shopNamePh')} value={form.shopName} onChange={e => set('shopName', e.target.value)} />
                </Field>
                <Row2>
                  <Field label={t('apply.category')} required>
                    <select style={inputStyle} value={form.category} onChange={e => set('category', e.target.value)}>
                      <option value="">{t('apply.categoryPh')}</option>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </Field>
                  <Field label={t('apply.region')} required>
                    <select style={inputStyle} value={form.region} onChange={e => set('region', e.target.value)}>
                      <option value="">{t('apply.regionPh')}</option>
                      {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </Field>
                </Row2>
                <Field label={t('apply.businessWhatsapp')} required>
                  <input style={inputStyle} type="tel" placeholder={t('apply.whatsappPh')} value={form.shopWhatsapp} onChange={e => set('shopWhatsapp', e.target.value)} />
                </Field>
                <Field label={t('apply.description')} required hint={t('apply.descriptionHint')}>
                  <textarea style={{ ...inputStyle, minHeight: 88, resize: 'vertical' }} placeholder={t('apply.descriptionPh')} value={form.desc} onChange={e => set('desc', e.target.value)} />
                </Field>
                <Field label={t('apply.logo')} hint={t('apply.logoHint')}>
                  <div onClick={() => fileInputRef.current?.click()}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, border: `1.5px dashed var(--sn-border)`, borderRadius: 12, padding: '0.75rem 1rem', cursor: 'pointer' }}>
                    <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={e => onLogoPick(e.target.files?.[0] || null)} />
                    {logoPreview ? (
                      <Image src={logoPreview} alt="" width={44} height={44} style={{ borderRadius: 10, objectFit: 'cover', width: 44, height: 44 }} />
                    ) : (
                      <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--sn-page)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Upload size={17} color="var(--sn-subtle)" />
                      </div>
                    )}
                    <span style={{ fontSize: '0.8rem', color: 'var(--sn-muted)', fontWeight: 600 }}>{logoFile ? logoFile.name : t('apply.logo')}</span>
                  </div>
                </Field>
                <Field label={t('apply.brandColor')}>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {BRAND_COLORS.map(c => (
                      <button key={c} onClick={() => set('color', c)} aria-label={c}
                        style={{ width: 30, height: 30, borderRadius: 9, background: c, cursor: 'pointer', border: form.color === c ? '2.5px solid var(--sn-text)' : '2.5px solid transparent', transform: form.color === c ? 'scale(1.12)' : 'none', transition: 'all .15s' }} />
                    ))}
                  </div>
                </Field>
              </Card>
            )}

            {/* STEP 4 — Plan */}
            {step === 4 && (
              <Card>
                <StepHeading title={t('apply.planTitle')} sub={t('apply.planSub')} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
                  {(['basic', 'premium'] as const).map(p => {
                    const sel = form.plan === p
                    const premium = p === 'premium'
                    return (
                      <button key={p} onClick={() => set('plan', p)}
                        style={{ position: 'relative', textAlign: 'left', padding: '1.4rem', borderRadius: 16, border: `2px solid ${sel ? 'var(--sn-primary)' : 'var(--sn-border)'}`, background: sel ? 'color-mix(in srgb, var(--sn-primary) 6%, var(--sn-bg))' : 'var(--sn-bg)', cursor: 'pointer', fontFamily: 'var(--sn-font)' }}>
                        {premium && (
                          <span style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#FF0080,#7800FF)', color: '#fff', fontSize: '0.58rem', fontWeight: 800, padding: '2px 10px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                            {t('apply.mostPopular')}
                          </span>
                        )}
                        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--sn-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{premium ? t('apply.premiumPlan') : t('apply.basicPlan')}</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--sn-text)', marginTop: 2 }}>{fmt(PRICE[p])}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--sn-subtle)', marginBottom: '1rem' }}>{t('apply.perMonth')}</div>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {(premium ? [t('apply.premF1'), t('apply.premF2'), t('apply.premF3')] : [t('apply.basicF1'), t('apply.basicF2'), t('apply.basicF3')]).map(f => (
                            <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: '0.76rem', color: 'var(--sn-muted)' }}>
                              <Check size={13} color="var(--sn-primary)" style={{ flexShrink: 0, marginTop: 2 }} /> {f}
                            </li>
                          ))}
                        </ul>
                      </button>
                    )
                  })}
                </div>
              </Card>
            )}

            {/* STEP 5 — Review */}
            {step === 5 && (
              <Card>
                <StepHeading title={t('apply.reviewTitle')} sub={t('apply.reviewSub')} />
                <ReviewSection title={t('apply.stepAccount')} onEdit={() => setStep(1)}
                  rows={[[t('apply.fullName'), form.ownerName], [t('apply.whatsapp'), form.ownerPhone], [t('apply.email'), form.ownerEmail]]} />
                <ReviewSection title={t('apply.stepMarketplace')} onEdit={() => setStep(2)}
                  rows={[[t('apply.stepMarketplace'), form.market ? t(`apply.market${form.market[0].toUpperCase()}${form.market.slice(1)}`) : '-']]} />
                <ReviewSection title={t('apply.stepShopInfo')} onEdit={() => setStep(3)}
                  rows={[[t('apply.shopName'), form.shopName], [t('apply.category'), form.category], [t('apply.region'), form.region], [t('apply.description'), form.desc]]} />
                <ReviewSection title={t('apply.stepPlan')} onEdit={() => setStep(4)}
                  rows={[[t('apply.stepPlan'), isPremium ? t('apply.premiumPlan') : t('apply.basicPlan')], [t('apply.perMonth'), fmt(PRICE[form.plan])]]} />
              </Card>
            )}

            {/* STEP 6 — Submit */}
            {step === 6 && (
              <Card>
                <StepHeading title={t('apply.submitTitle')} sub={t('apply.submitSub')} />
                <button onClick={submit} disabled={submitting}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'linear-gradient(135deg,#FF0080,#7800FF)', color: 'var(--sn-primary-fg)', border: 'none', borderRadius: 14, padding: '1rem', fontWeight: 800, fontSize: '0.92rem', cursor: submitting ? 'default' : 'pointer', opacity: submitting ? 0.75 : 1, fontFamily: 'var(--sn-font)' }}>
                  {submitting ? (<><Loader2 size={16} className="spin" /> {uploading ? t('apply.logo') + '…' : t('apply.submitting')}</>) : (<>{t('apply.submitBtn')} <ArrowRight size={15} /></>)}
                </button>
              </Card>
            )}

            {/* Nav buttons */}
            {step < 6 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.25rem' }}>
                <button onClick={goBack} disabled={step === 1}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: step === 1 ? 'var(--sn-subtle)' : 'var(--sn-muted)', fontWeight: 700, fontSize: '0.85rem', cursor: step === 1 ? 'default' : 'pointer', visibility: step === 1 ? 'hidden' : 'visible', fontFamily: 'var(--sn-font)' }}>
                  <ArrowLeft size={15} /> {t('apply.back')}
                </button>
                <button onClick={goNext}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg,#FF0080,#7800FF)', color: 'var(--sn-primary-fg)', border: 'none', borderRadius: 999, padding: '0.7rem 1.6rem', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'var(--sn-font)' }}>
                  {t('apply.continue')} <ArrowRight size={15} />
                </button>
              </div>
            )}
            {step === 6 && (
              <div style={{ marginTop: '1rem' }}>
                <button onClick={goBack} disabled={submitting}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--sn-muted)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'var(--sn-font)' }}>
                  <ArrowLeft size={15} /> {t('apply.back')}
                </button>
              </div>
            )}

            <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--sn-subtle)', marginTop: '2rem' }}>
              <Link href="/dashboard/open-store-v2" style={{ color: 'var(--sn-primary)', fontWeight: 600, textDecoration: 'none' }}>{t('apply.checkStatus')}</Link>
            </p>
          </section>
        </>
      )}
      <style>{`.spin{animation:snspin 1s linear infinite}@keyframes snspin{to{transform:rotate(360deg)}}`}</style>
    </main>
  )
}

// ── Small presentational helpers ──────────────────────────
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.62rem 0.85rem', border: '1.5px solid var(--sn-input-border)', borderRadius: 10,
  fontSize: '0.85rem', fontFamily: 'var(--sn-font)', color: 'var(--sn-text)', outline: 'none', background: 'var(--sn-input)',
}

function Card({ children }: { children: React.ReactNode }) {
  return <div style={{ background: 'var(--sn-bg)', border: '1.5px solid var(--sn-border)', borderRadius: 20, padding: '1.5rem', boxShadow: '0 2px 12px rgba(5,11,46,0.04)' }}>{children}</div>
}

function StepHeading({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--sn-text)', marginBottom: 4 }}>{title}</h2>
      <p style={{ fontSize: '0.8rem', color: 'var(--sn-muted)', lineHeight: 1.6 }}>{sub}</p>
    </div>
  )
}

function Row2({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem' }}>{children}</div>
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: 'var(--sn-text)', marginBottom: 5 }}>
        {label} {required && <em style={{ color: '#DC2626', fontStyle: 'normal' }}>*</em>}
      </label>
      {children}
      {hint && <div style={{ fontSize: '0.7rem', color: 'var(--sn-subtle)', marginTop: 4, lineHeight: 1.5 }}>{hint}</div>}
    </div>
  )
}

function ReviewSection({ title, rows, onEdit }: { title: string; rows: [string, string][]; onEdit: () => void }) {
  const { t } = useTranslation()
  return (
    <div style={{ marginBottom: '1rem', border: '1px solid var(--sn-border)', borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 1rem', background: 'var(--sn-page)' }}>
        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--sn-text)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{title}</span>
        <button onClick={onEdit} style={{ background: 'none', border: 'none', color: 'var(--sn-primary)', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>{t('apply.edit')}</button>
      </div>
      <div style={{ padding: '0.75rem 1rem' }}>
        {rows.map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '0.3rem 0', fontSize: '0.8rem' }}>
            <span style={{ color: 'var(--sn-subtle)' }}>{k}</span>
            <span style={{ color: 'var(--sn-text)', fontWeight: 600, textAlign: 'right' }}>{v || '-'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
