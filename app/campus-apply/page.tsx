'use client'

import React from 'react'
import { useState } from 'react'
import Link from 'next/link'
import { sb } from '@/lib/supabase'
import { SiteNav } from '@/components/site-nav'
import { ArrowLeft, CheckCircle, Loader2, GraduationCap, Store, MessageCircle } from 'lucide-react'

const UNIVERSITIES = [
  { abbr: 'UDSM',  name: 'University of Dar es Salaam' },
  { abbr: 'ARU',   name: 'Ardhi University' },
  { abbr: 'UDOM',  name: 'University of Dodoma' },
  { abbr: 'NIT',   name: 'National Institute of Transport' },
  { abbr: 'TIA',   name: 'Tanzania Institute of Accountancy' },
]

const CATEGORIES = ['Fashion','Food','Electronics','Beauty','Books','Services','Other']

type Form = {
  ownerName: string
  phone: string
  email: string
  university: string
  storeName: string
  category: string
  description: string
  idFile: File | null
}

const EMPTY: Form = {
  ownerName: '', phone: '', email: '', university: '',
  storeName: '', category: '', description: '', idFile: null,
}

export default function CampusApplyPage() {
  const [form, setForm]       = useState<Form>(EMPTY)
  const [step, setStep]       = useState(1)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState('')

  const set = (key: keyof Form, val: string) => setForm(f => ({ ...f, [key]: val }))

  const next = () => {
    setError('')
    if (step === 1) {
      if (!form.ownerName.trim()) return setError('Enter your full name')
      if (!form.phone.trim())     return setError('Enter your phone number')
      if (!form.email.trim() || !form.email.includes('@')) return setError('Enter a valid email')
      if (!form.university)       return setError('Select your university')
    }
    if (step === 2) {
      if (!form.storeName.trim()) return setError('Enter your shop name')
      if (!form.category)         return setError('Select a category')
      if (form.description.length < 20) return setError('Description must be at least 20 characters')
    }
    setStep(s => s + 1)
  }

  const back = () => { setError(''); setStep(s => s - 1) }

  const submit = async () => {
    setLoading(true); setError('')
    try {
      let idCardUrl = ''
      if (form.idFile) {
        const ext = form.idFile.name.split('.').pop()
        const { data } = await sb.storage.from('campus-assets')
          .upload(`id-cards/${Date.now()}.${ext}`, form.idFile)
        if (data) {
          const { data: url } = sb.storage.from('campus-assets').getPublicUrl(data.path)
          idCardUrl = url.publicUrl
        }
      }

      await sb.from('campus_applications').insert({
        owner_name:      form.ownerName.trim(),
        phone:           form.phone.trim(),
        email:           form.email.trim(),
        university_abbr: form.university,
        store_name:      form.storeName.trim(),
        category:        form.category,
        description:     form.description.trim(),
        id_card_url:     idCardUrl,
        status:          'pending',
      })

      await sb.from('admin_notifications').insert({
        title: `New Campus Application — ${form.storeName}`,
        body:  `${form.ownerName} from ${form.university} wants to open a campus shop.`,
        type:  'campus_application',
        is_read: false,
      })

      setSuccess(true)
    } catch (e: any) {
      setError(e.message || 'Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  // ── Success ──
  if (success) return (
    <main style={{ minHeight: '100vh', background: '#060C1A' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Inter:wght@400;500;600;700&display=swap');*{box-sizing:border-box}`}</style>
      <SiteNav />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: 'calc(100vh - 64px)', padding: '2rem 5%' }}>
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(34,197,94,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <CheckCircle style={{ width: 36, height: 36, color: '#22C55E' }} />
          </div>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.8rem', color: '#fff',
            fontWeight: 900, marginBottom: '0.75rem' }}>Application Submitted! 🎓</h2>
          <p style={{ color: 'rgba(255,255,255,0.50)', fontSize: 14, lineHeight: 1.8, marginBottom: '1.5rem' }}>
            Your campus shop application for <strong style={{ color: '#C9A84C' }}>{form.storeName}</strong> at{' '}
            <strong style={{ color: '#fff' }}>{form.university}</strong> has been received.
            We will review and respond within 24 hours via WhatsApp.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="https://wa.me/255651919915" target="_blank" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, background: '#25D366',
              color: '#fff', padding: '11px 20px', borderRadius: 999,
              fontWeight: 700, fontSize: 13, textDecoration: 'none',
            }}>
              <MessageCircle size={15} /> Follow Up on WhatsApp
            </a>
            <Link href="/campus" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,0.08)', color: '#fff',
              border: '1px solid rgba(255,255,255,0.12)',
              padding: '11px 20px', borderRadius: 999, fontWeight: 600, fontSize: 13, textDecoration: 'none',
            }}>
              Browse Campus Market
            </Link>
          </div>
        </div>
      </div>
    </main>
  )

  const inputStyle: import("react").CSSProperties = {
    width: '100%', padding: '11px 14px',
    background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.12)',
    borderRadius: 10, color: '#fff', fontSize: 14, outline: 'none',
    fontFamily: "'Inter',sans-serif", transition: 'all 0.15s',
  }
  const labelStyle: import("react").CSSProperties = {
    display: 'block', fontSize: 12, fontWeight: 600,
    color: 'rgba(255,255,255,0.55)', marginBottom: 6,
    textTransform: 'uppercase', letterSpacing: '0.06em',
  }

  return (
    <main style={{ minHeight: '100vh', background: '#060C1A', fontFamily: "'Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Inter:wght@300;400;500;600;700;800&display=swap');
        *{box-sizing:border-box}
        input:focus,select:focus,textarea:focus{border-color:#C9A84C!important;background:rgba(255,255,255,0.10)!important}
        input::placeholder,textarea::placeholder{color:rgba(255,255,255,0.28)}
        select option{background:#0D1B3E;color:#fff}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      <SiteNav />

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '3rem 5% 5rem', paddingTop: 'calc(64px + 2rem)' }}>

        {/* Back */}
        <Link href="/campus" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          color: 'rgba(255,255,255,0.50)', textDecoration: 'none', fontSize: 13, marginBottom: '2rem',
        }}>
          <ArrowLeft size={14} /> Back to Campus Market
        </Link>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: '0 auto 1rem',
            background: 'linear-gradient(135deg, #C9A84C, #F0C96B)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <GraduationCap style={{ width: 26, height: 26, color: '#0F172A' }} />
          </div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.7rem',
            fontWeight: 900, color: '#fff', marginBottom: 8 }}>Open Your Campus Shop</h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>
            Free this month — TZS 10,000/month after
          </p>
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', gap: 6, marginBottom: '2rem' }}>
          {[1, 2, 3].map(n => (
            <div key={n} style={{ flex: 1, height: 4, borderRadius: 999,
              background: n <= step ? '#C9A84C' : 'rgba(255,255,255,0.10)',
              transition: 'background 0.3s' }} />
          ))}
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20, padding: '2rem',
        }}>

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <>
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.15rem',
                color: '#fff', fontWeight: 800, marginBottom: '1.25rem' }}>Your Details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Full Name *</label>
                  <input style={inputStyle} value={form.ownerName}
                    onChange={e => set('ownerName', e.target.value)} placeholder="e.g. Amina Hassan" />
                </div>
                <div>
                  <label style={labelStyle}>Phone / WhatsApp *</label>
                  <input style={inputStyle} value={form.phone} type="tel"
                    onChange={e => set('phone', e.target.value)} placeholder="+255 7XX XXX XXX" />
                </div>
                <div>
                  <label style={labelStyle}>Email Address *</label>
                  <input style={inputStyle} value={form.email} type="email"
                    onChange={e => set('email', e.target.value)} placeholder="student@university.ac.tz" />
                </div>
                <div>
                  <label style={labelStyle}>Your University *</label>
                  <select style={inputStyle} value={form.university}
                    onChange={e => set('university', e.target.value)}>
                    <option value="">Select university...</option>
                    {UNIVERSITIES.map(u => (
                      <option key={u.abbr} value={u.abbr}>{u.name} ({u.abbr})</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <>
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.15rem',
                color: '#fff', fontWeight: 800, marginBottom: '1.25rem' }}>Shop Details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Shop Name *</label>
                  <input style={inputStyle} value={form.storeName}
                    onChange={e => set('storeName', e.target.value)} placeholder="e.g. Amina's Fashion" />
                </div>
                <div>
                  <label style={labelStyle}>Category *</label>
                  <select style={inputStyle} value={form.category}
                    onChange={e => set('category', e.target.value)}>
                    <option value="">Select category...</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Shop Description *</label>
                  <textarea style={{ ...inputStyle, minHeight: 90, resize: 'vertical' } as React.CSSProperties}
                    value={form.description}
                    onChange={e => set('description', e.target.value)}
                    placeholder="Tell customers what you sell, your quality, your service..." />
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.30)', marginTop: 4 }}>
                    {form.description.length}/20 minimum
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Student ID Card (optional)</label>
                  <input type="file" accept="image/*,.pdf"
                    onChange={e => setForm(f => ({ ...f, idFile: e.target.files?.[0] || null }))}
                    style={{ ...inputStyle, padding: '8px 14px' } as React.CSSProperties} />
                </div>
              </div>
            </>
          )}

          {/* ── STEP 3 — Review ── */}
          {step === 3 && (
            <>
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.15rem',
                color: '#fff', fontWeight: 800, marginBottom: '1.25rem' }}>Review & Submit</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: '1.25rem' }}>
                {[
                  ['Name', form.ownerName],
                  ['Phone', form.phone],
                  ['Email', form.email],
                  ['University', form.university],
                  ['Shop Name', form.storeName],
                  ['Category', form.category],
                ].map(([label, val]) => (
                  <div key={label} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.07)',
                  }}>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>{label}</span>
                    <span style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>{val}</span>
                  </div>
                ))}
              </div>
              <div style={{
                background: 'rgba(201,168,76,0.10)', border: '1px solid rgba(201,168,76,0.25)',
                borderRadius: 10, padding: '12px 14px', marginBottom: '1.25rem',
              }}>
                <div style={{ fontSize: 13, color: '#C9A84C', fontWeight: 700, marginBottom: 4 }}>
                  🎁 Free This Month!
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.50)', lineHeight: 1.6 }}>
                  Your shop will go live within 24 hours after approval.
                  You will receive your login details via WhatsApp.
                </div>
              </div>
            </>
          )}

          {/* Error */}
          {error && (
            <div style={{
              marginTop: 12, padding: '10px 14px', background: 'rgba(220,38,38,0.12)',
              border: '1px solid rgba(220,38,38,0.25)', borderRadius: 10,
              color: '#FCA5A5', fontSize: 13,
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 8, marginTop: '1.5rem' }}>
            {step > 1 && (
              <button onClick={back} style={{
                flex: 1, padding: '12px', borderRadius: 999, background: 'rgba(255,255,255,0.07)',
                color: '#fff', border: '1px solid rgba(255,255,255,0.12)',
                cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: "'Inter',sans-serif",
              }}>
                ← Back
              </button>
            )}
            <button
              onClick={step === 3 ? submit : next}
              disabled={loading}
              style={{
                flex: 2, padding: '12px', borderRadius: 999, background: '#C9A84C',
                color: '#0F172A', border: 'none', fontWeight: 800, fontSize: 13,
                cursor: loading ? 'wait' : 'pointer', fontFamily: "'Inter',sans-serif",
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                opacity: loading ? 0.8 : 1,
              }}>
              {loading ? (
                <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Submitting...</>
              ) : step === 3 ? (
                <><Store size={15} /> Submit Application</>
              ) : (
                'Continue →'
              )}
            </button>
          </div>
        </div>

        {/* Info below */}
        <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.30)', marginTop: '1.5rem', lineHeight: 1.7 }}>
          After approval you will receive your login details via WhatsApp within 24 hours.<br />
          Questions? <a href="https://wa.me/255651919915" target="_blank" style={{ color: '#C9A84C' }}>Contact us on WhatsApp</a>
        </p>
      </div>
    </main>
  )
}
