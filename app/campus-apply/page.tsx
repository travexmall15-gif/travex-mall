'use client'

import { useState } from 'react'
import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { sb } from '@/lib/supabase'
import { CheckCircle, Upload, ChevronRight, ChevronLeft } from 'lucide-react'

const UNIS = [
  { abbr: 'ARU', name: 'Ardhi University', city: 'Dar es Salaam' },
  { abbr: 'UDSM', name: 'University of Dar es Salaam', city: 'Dar es Salaam' },
  { abbr: 'UDOM', name: 'University of Dodoma', city: 'Dodoma' },
  { abbr: 'TIA', name: 'Tanzania Institute of Accountancy', city: 'Dar es Salaam' },
]
const CATS = ['Fashion & Clothing','Food & Snacks','Electronics & Accessories','Beauty & Health','Books & Stationery','Services','Other']
const YEARS = ['Year 1','Year 2','Year 3','Year 4','Year 5','Postgraduate']

export default function ApplyPage() {
  const [step, setStep] = useState(1)
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState({ fullName:'', email:'', phone:'', whatsapp:'', uniAbbr:'', uniName:'', year:'', shopName:'', category:'', description:'', idFile: null as File | null, idPreview:'' })

  function set(key: string, val: string) { setForm(f => ({...f, [key]: val})); setErrors(e => ({...e, [key]: ''})) }

  function validate() {
    const e: Record<string, string> = {}
    if (step === 1) {
      if (!form.fullName.trim()) e.fullName = 'Required'
      if (!form.email.trim()) e.email = 'Required'
      if (!form.phone.trim()) e.phone = 'Required'
    }
    if (step === 2 && !form.uniAbbr) e.uni = 'Select a university'
    if (step === 3) {
      if (!form.shopName.trim()) e.shopName = 'Required'
      if (!form.category) e.category = 'Required'
      if (form.description.length < 20) e.description = 'Minimum 20 characters'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function submit() {
    setLoading(true)
    let idCardUrl = null
    if (form.idFile) {
      const ext = form.idFile.name.split('.').pop()
      const { data } = await sb.storage.from('campus-assets').upload(`id-cards/${Date.now()}.${ext}`, form.idFile)
      if (data) { const { data: url } = sb.storage.from('campus-assets').getPublicUrl(data.path); idCardUrl = url.publicUrl }
    }
    await sb.from('campus_applications').insert({
      full_name: form.fullName, email: form.email, phone: form.phone,
      whatsapp_number: form.whatsapp || form.phone,
      university: form.uniName, university_abbr: form.uniAbbr,
      year_of_study: form.year, region: '',
      business_category: form.category,
      business_description: 'SHOP:' + form.shopName + '\n' + form.description,
      id_card_url: idCardUrl, status: 'pending'
    })
    await sb.from('admin_notifications').insert({
      type: 'campus_application', title: `🎓 New Application — ${form.shopName}`,
      body: `${form.fullName} from ${form.uniAbbr} applied for "${form.shopName}" (${form.category})`,
      is_read: false
    })
    setDone(true)
    setLoading(false)
  }

  function next() { if (validate()) setStep(s => Math.min(5, s + 1)) }
  function back() { setStep(s => Math.max(1, s - 1)) }

  if (done) return (
    <main className="bg-offwhite min-h-screen"><SiteNav />
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md px-4">
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6"><CheckCircle className="h-10 w-10 text-green-500" /></div>
          <h1 className="text-3xl font-bold text-navy mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>Application Submitted! 🎉</h1>
          <p className="text-gray-500 mb-8">We'll review your application for <strong>{form.shopName}</strong> and notify you within 24 hours via email.</p>
          <a href="/" className="inline-block px-8 py-3 rounded-xl font-bold text-navy" style={{ background: '#C9A84C' }}>Back to Home</a>
        </div>
      </div>
    </main>
  )

  return (
    <main className="bg-offwhite min-h-screen"><SiteNav />
      <div className="mx-auto max-w-2xl px-4 pt-28 pb-16">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-navy mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Apply for Your Campus Shop</h1>
          <p className="text-gray-500">60 slots per university — apply now to secure yours</p>
        </div>

        {/* Progress */}
        <div className="flex items-center mb-10">
          {[1,2,3,4,5].map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${s < step ? 'bg-green-500 text-white' : s === step ? 'text-white' : 'bg-gray-200 text-gray-500'}`}
                style={s === step ? { background: '#0D1B3E' } : {}}>
                {s < step ? <CheckCircle className="h-4 w-4" /> : s}
              </div>
              {i < 4 && <div className="flex-1 h-0.5 mx-1 transition-all" style={{ background: s < step ? '#059669' : '#E5E7EB' }} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-navy mb-6">Personal Information</h2>
              {[['fullName','Full Name','text','e.g. Amina Hassan'],['email','Email Address','email','your@email.com'],['phone','Phone Number','tel','+255 7XX XXX XXX'],['whatsapp','WhatsApp Number','tel','+255 7XX XXX XXX']].map(([key, label, type, ph]) => (
                <div key={key}>
                  <label className="block text-sm font-semibold text-navy mb-1.5">{label}{key !== 'whatsapp' ? ' *' : ''}</label>
                  <input type={type} value={form[key as keyof typeof form] as string} onChange={e => set(key, e.target.value)}
                    placeholder={ph} className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all focus:border-navy"
                    style={{ borderColor: errors[key] ? '#ef4444' : '#E5E7EB' }} />
                  {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key]}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold text-navy mb-6">Select Your University</h2>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {UNIS.map(u => (
                  <button key={u.abbr} onClick={() => { set('uniAbbr', u.abbr); set('uniName', u.name) }}
                    className="p-4 rounded-xl border-2 text-left transition-all"
                    style={{ borderColor: form.uniAbbr === u.abbr ? '#0D1B3E' : '#E5E7EB', background: form.uniAbbr === u.abbr ? '#F8F9FC' : 'white' }}>
                    <div className="text-2xl font-bold mb-1" style={{ color: '#C9A84C' }}>{u.abbr}</div>
                    <div className="text-xs font-semibold text-navy">{u.name}</div>
                    <div className="text-xs text-gray-400">{u.city}</div>
                  </button>
                ))}
              </div>
              {errors.uni && <p className="text-red-500 text-xs mb-4">{errors.uni}</p>}
              <div>
                <label className="block text-sm font-semibold text-navy mb-1.5">Year of Study</label>
                <select value={form.year} onChange={e => set('year', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none">
                  <option value="">Select year</option>
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-navy mb-6">Shop Details</h2>
              <div>
                <label className="block text-sm font-semibold text-navy mb-1.5">Shop Name *</label>
                <input value={form.shopName} onChange={e => set('shopName', e.target.value)} placeholder="e.g. Amina Fashion Store"
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none" style={{ borderColor: errors.shopName ? '#ef4444' : '#E5E7EB' }} />
                {errors.shopName && <p className="text-red-500 text-xs mt-1">{errors.shopName}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy mb-1.5">Category *</label>
                <select value={form.category} onChange={e => set('category', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none">
                  <option value="">Select category</option>
                  {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy mb-1.5">Business Description *</label>
                <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={4}
                  placeholder="Describe what you sell, your target customers, and what makes your shop unique..."
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none" style={{ borderColor: errors.description ? '#ef4444' : '#E5E7EB' }} />
                <div className="flex justify-between mt-1">
                  {errors.description ? <p className="text-red-500 text-xs">{errors.description}</p> : <span />}
                  <span className="text-xs text-gray-400">{form.description.length}/200</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 4 */}
          {step === 4 && (
            <div>
              <h2 className="text-xl font-bold text-navy mb-6">ID Verification</h2>
              <div className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all"
                style={{ borderColor: form.idFile ? '#059669' : '#E5E7EB', background: form.idFile ? '#f0fdf4' : '#fafafa' }}
                onClick={() => document.getElementById('idInput')?.click()}>
                {form.idPreview ? (
                  <img src={form.idPreview} alt="ID" className="max-h-48 mx-auto rounded-lg object-contain" />
                ) : (
                  <div>
                    <Upload className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-navy mb-1">Upload Student ID Card</p>
                    <p className="text-xs text-gray-400">JPG, PNG — max 5MB</p>
                  </div>
                )}
                <input id="idInput" type="file" accept="image/*" className="hidden" onChange={e => {
                  const f = e.target.files?.[0]
                  if (f) { setForm(prev => ({ ...prev, idFile: f, idPreview: URL.createObjectURL(f) })) }
                }} />
              </div>
              {form.idFile && <p className="text-green-600 text-sm mt-3 text-center">✅ {form.idFile.name}</p>}
            </div>
          )}

          {/* Step 5 Review */}
          {step === 5 && (
            <div>
              <h2 className="text-xl font-bold text-navy mb-6">Review & Submit</h2>
              <div className="space-y-4">
                {[['Personal Info', [['Name', form.fullName], ['Email', form.email], ['Phone', form.phone]]],
                  ['University', [['University', form.uniAbbr + ' — ' + form.uniName], ['Year', form.year]]],
                  ['Shop', [['Shop Name', form.shopName], ['Category', form.category]]]
                ].map(([section, items]) => (
                  <div key={section as string} className="rounded-xl border border-gray-100 overflow-hidden">
                    <div className="px-4 py-2.5 text-xs font-bold uppercase tracking-wide" style={{ background: '#F8F9FC', color: '#6B7280' }}>{section as string}</div>
                    {(items as [string, string][]).map(([k, v]) => (
                      <div key={k} className="flex justify-between px-4 py-2.5 border-t border-gray-50 text-sm">
                        <span className="text-gray-500">{k}</span>
                        <span className="font-semibold text-navy">{v || '—'}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
            {step > 1 ? (
              <button onClick={back} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-navy transition-all hover:bg-gray-50">
                <ChevronLeft className="h-4 w-4" /> Back
              </button>
            ) : <div />}
            {step < 5 ? (
              <button onClick={next} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-navy"
                style={{ background: '#C9A84C' }}>
                Next <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button onClick={submit} disabled={loading}
                className="px-8 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                style={{ background: '#0D1B3E' }}>
                {loading ? 'Submitting...' : 'Submit Application 🚀'}
              </button>
            )}
          </div>
        </div>
      </div>
      <SiteFooter />
    </main>
  )
}
