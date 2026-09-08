'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { sb } from '@/lib/supabase'
import { getTemplatesForMarket } from '@/lib/webstore/templates'
import { categoriesForMarket } from '@/lib/shopnekt-ai/data-core'
import { EMPTY_DRAFT, type WebstoreDraft, type Market, type WebstoreTemplateMeta } from '@/lib/webstore/types'
import { ArrowLeft, ArrowRight, Loader2, Shirt, Car, Smartphone, Check, Upload, Monitor, Smartphone as MobileIcon } from 'lucide-react'
// ═══════════════════════════════════════════════════════════
// SHOPNEKT WEBSTORE BUILDER — Phase 1
// ═══════════════════════════════════════════════════════════
// Replaces the old /open-store 6-step form entirely, per explicit
// instruction. Follows the exact stage order specified:
// Business -> Contact -> Location -> Social -> Branding -> Marketplace
// -> Template -> Preview -> Submit.
//
// Nothing here is faked: the shop_name/desc/contact/location/social
// fields are real columns (see the Phase 1 migration), file uploads go
// to the real 'shop-assets' storage bucket already used elsewhere in
// this app, templates come from a real webstore_templates query, and
// submission sets a real webstore_status the admin panel can act on.

const TOTAL_STEPS = 9
const MARKETS: { id: Market; label: string; icon: typeof Shirt }[] = [
  { id: 'fashion', label: 'Fashion', icon: Shirt },
  { id: 'vehicle', label: 'Vehicles', icon: Car },
  { id: 'electronics', label: 'Electronics', icon: Smartphone },
]

export default function WebstoreBuilderPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [draft, setDraft] = useState<WebstoreDraft>(EMPTY_DRAFT)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [templates, setTemplates] = useState<WebstoreTemplateMeta[]>([])
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('mobile')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (draft.market) {getTemplatesForMarket(draft.market).then(setTemplates)}
  }, [draft.market])

  const set = <K extends keyof WebstoreDraft>(key: K, value: WebstoreDraft[K]) =>
    setDraft(prev => ({ ...prev, [key]: value }))

  const canProceed = (): boolean => {
    switch (step) {
      case 1: return draft.shop_name.trim().length > 1 && draft.shop_desc.trim().length > 5
      case 2: return draft.owner_phone.trim().length >= 9 && draft.shop_whatsapp.trim().length >= 9
      case 3: return draft.shop_region.trim().length > 0
      case 4: return true // social is optional
      case 5: return true // branding optional in Phase 1 (upload happens at submit)
      case 6: return !!draft.market && draft.shop_category.trim().length > 0
      case 7: return !!draft.selected_template
      default: return true
    }
  }

  const next = () => setStep(s => Math.min(TOTAL_STEPS, s + 1))
  const back = () => step === 1 ? router.back() : setStep(s => s - 1)

  const uploadAsset = async (file: File, kind: 'logo' | 'cover'): Promise<string | null> => {
    const ext = file.name.split('.').pop()
    const path = `webstore/${Date.now()}-${kind}.${ext}`
    const { error } = await sb.storage.from('shop-assets').upload(path, file, { cacheControl: '3600', upsert: true })
    if (error) {return null}
    return sb.storage.from('shop-assets').getPublicUrl(path).data.publicUrl
  }

  const handleSubmit = useCallback(async () => {
    setSubmitting(true)
    setError(null)
    try {
      let logo_url = draft.shop_logo_url
      let cover_url = draft.shop_cover_url
      if (logoFile) {logo_url = await uploadAsset(logoFile, 'logo')}
      if (coverFile) {cover_url = await uploadAsset(coverFile, 'cover')}

      const { data: { session } } = await sb.auth.getSession()

      const { error: insertError } = await sb.from('pending_payments').insert({
        owner_name: session?.user?.user_metadata?.full_name || draft.shop_name,
        owner_phone: draft.owner_phone,
        owner_email: draft.owner_email || null,
        shop_name: draft.shop_name,
        shop_desc: draft.shop_desc,
        shop_category: draft.shop_category,
        shop_region: draft.shop_region,
        shop_city: draft.shop_city || null,
        shop_address: draft.shop_address || null,
        shop_whatsapp: draft.shop_whatsapp,
        shop_instagram: draft.shop_instagram || null,
        shop_facebook: draft.shop_facebook || null,
        shop_tiktok: draft.shop_tiktok || null,
        shop_logo_url: logo_url,
        shop_cover_url: cover_url,
        selected_template: draft.selected_template,
        webstore_status: 'submitted',
        webstore_submitted_at: new Date().toISOString(),
        status: 'pending',
        plan: 'basic',
      })

      if (insertError) {throw insertError}
      setStep(TOTAL_STEPS + 1) // "submitted" confirmation screen
    } catch {
      setError('Imeshindikana kutuma. Tafadhali jaribu tena.')
    } finally {
      setSubmitting(false)
    }
  }, [draft, logoFile, coverFile])

  if (step === TOTAL_STEPS + 1) {
    return (
      <main style={{ minHeight: '100vh', background: 'var(--sn-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'var(--sn-font)' }}>
        <div style={{ textAlign: 'center', maxWidth: 380 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#FF0080,#7800FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <Check size={32} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--sn-text)', marginBottom: 8 }}>Under Review</h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--sn-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            Your WebStore has been submitted and is awaiting admin review. You&apos;ll be notified once it&apos;s reviewed.
          </p>
          <button onClick={() => router.push('/home')}
            style={{ background: 'linear-gradient(135deg,#FF0080,#7800FF)', color: '#fff', border: 'none', borderRadius: 999, padding: '12px 32px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'var(--sn-font)' }}>
            Done
          </button>
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--sn-page)', display: 'flex', flexDirection: 'column', fontFamily: 'var(--sn-font)' }}>
      {/* Header + progress */}
      <div style={{ padding: '14px 5%', borderBottom: '1px solid var(--sn-border)', background: 'var(--sn-bg)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <button onClick={back} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sn-muted)', display: 'flex' }}>
            <ArrowLeft size={18} />
          </button>
          <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--sn-text)' }}>Build Your WebStore</div>
          <div style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--sn-subtle)', fontWeight: 700 }}>{step}/{TOTAL_STEPS}</div>
        </div>
        <div style={{ height: 4, background: 'var(--sn-border)', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(step / TOTAL_STEPS) * 100}%`, background: 'linear-gradient(135deg,#FF0080,#7800FF)', transition: 'width .3s' }} />
        </div>
      </div>

      <div style={{ flex: 1, padding: '1.5rem 5% 6rem', maxWidth: 560, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        {step === 1 && (
          <Step title="Business Information">
            <Field label="Business Name"><Input value={draft.shop_name} onChange={v => set('shop_name', v)} placeholder="e.g. Niffer Outfit" /></Field>
            <Field label="What does your business sell?"><TextArea value={draft.shop_desc} onChange={v => set('shop_desc', v)} placeholder="Describe your business in a sentence or two..." /></Field>
          </Step>
        )}

        {step === 2 && (
          <Step title="Contact Information">
            <Field label="Phone Number"><Input value={draft.owner_phone} onChange={v => set('owner_phone', v)} placeholder="0712 345 678" type="tel" /></Field>
            <Field label="WhatsApp Number"><Input value={draft.shop_whatsapp} onChange={v => set('shop_whatsapp', v)} placeholder="0712 345 678" type="tel" /></Field>
            <Field label="Email (optional)"><Input value={draft.owner_email} onChange={v => set('owner_email', v)} placeholder="you@example.com" type="email" /></Field>
          </Step>
        )}

        {step === 3 && (
          <Step title="Location">
            <Field label="Region"><Input value={draft.shop_region} onChange={v => set('shop_region', v)} placeholder="e.g. Dar es Salaam" /></Field>
            <Field label="City / District"><Input value={draft.shop_city} onChange={v => set('shop_city', v)} placeholder="e.g. Kinondoni" /></Field>
            <Field label="Physical Address (optional)"><Input value={draft.shop_address} onChange={v => set('shop_address', v)} placeholder="Street, building..." /></Field>
          </Step>
        )}

        {step === 4 && (
          <Step title="Social Media (optional)">
            <Field label="Instagram"><Input value={draft.shop_instagram} onChange={v => set('shop_instagram', v)} placeholder="@yourbusiness" /></Field>
            <Field label="Facebook"><Input value={draft.shop_facebook} onChange={v => set('shop_facebook', v)} placeholder="facebook.com/yourbusiness" /></Field>
            <Field label="TikTok"><Input value={draft.shop_tiktok} onChange={v => set('shop_tiktok', v)} placeholder="@yourbusiness" /></Field>
          </Step>
        )}

        {step === 5 && (
          <Step title="Branding & Media">
            <Field label="Business Logo">
              <FileUpload file={logoFile} onSelect={setLogoFile} accept="image/*" />
            </Field>
            <Field label="Cover / Hero Image">
              <FileUpload file={coverFile} onSelect={setCoverFile} accept="image/*" />
            </Field>
          </Step>
        )}

        {step === 6 && (
          <Step title="Choose Marketplace">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: '1.25rem' }}>
              {MARKETS.map(m => (
                <button key={m.id} onClick={() => { set('market', m.id); set('shop_category', '') }}
                  style={{ padding: '16px 8px', borderRadius: 14, border: draft.market === m.id ? '2px solid transparent' : '1.5px solid var(--sn-border)', background: draft.market === m.id ? 'linear-gradient(135deg,#FF0080,#7800FF)' : 'var(--sn-bg)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <m.icon size={22} color={draft.market === m.id ? '#fff' : 'var(--sn-muted)'} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: draft.market === m.id ? '#fff' : 'var(--sn-text)' }}>{m.label}</span>
                </button>
              ))}
            </div>
            {draft.market && (
              <Field label="Category">
                <select value={draft.shop_category} onChange={e => set('shop_category', e.target.value)}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: '1.5px solid var(--sn-input-border)', background: 'var(--sn-input)', color: 'var(--sn-text)', fontSize: '0.88rem', fontFamily: 'var(--sn-font)' }}>
                  <option value="">Select a category</option>
                  {categoriesForMarket(draft.market).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
            )}
          </Step>
        )}

        {step === 7 && draft.market && (
          <Step title="Choose WebStore Template">
            {templates.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--sn-muted)' }}>Loading templates...</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {templates.map(tpl => (
                  <button key={tpl.id} onClick={() => set('selected_template', tpl.id)}
                    style={{ textAlign: 'left', padding: '14px 16px', borderRadius: 16, border: draft.selected_template === tpl.id ? '2px solid transparent' : '1.5px solid var(--sn-border)', background: draft.selected_template === tpl.id ? 'rgba(120,0,255,0.06)' : 'var(--sn-bg)', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--sn-text)' }}>{tpl.name}</span>
                      {draft.selected_template === tpl.id && (
                        <span style={{ background: 'linear-gradient(135deg,#FF0080,#7800FF)', color: '#fff', borderRadius: 999, padding: '2px 10px', fontSize: '0.65rem', fontWeight: 700 }}>Selected</span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--sn-muted)', margin: 0 }}>{tpl.description}</p>
                  </button>
                ))}
              </div>
            )}
          </Step>
        )}

        {step === 8 && (
          <Step title="Preview Your WebStore">
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <button onClick={() => setPreviewMode('mobile')} style={{ flex: 1, padding: '8px', borderRadius: 10, border: 'none', background: previewMode === 'mobile' ? 'var(--sn-text)' : 'var(--sn-border)', color: previewMode === 'mobile' ? 'var(--sn-page)' : 'var(--sn-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', fontFamily: 'var(--sn-font)', fontWeight: 700, fontSize: '0.78rem' }}>
                <MobileIcon size={14} /> Mobile
              </button>
              <button onClick={() => setPreviewMode('desktop')} style={{ flex: 1, padding: '8px', borderRadius: 10, border: 'none', background: previewMode === 'desktop' ? 'var(--sn-text)' : 'var(--sn-border)', color: previewMode === 'desktop' ? 'var(--sn-page)' : 'var(--sn-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', fontFamily: 'var(--sn-font)', fontWeight: 700, fontSize: '0.78rem' }}>
                <Monitor size={14} /> Desktop
              </button>
            </div>
            <WebstorePreviewFrame draft={draft} mode={previewMode} logoFile={logoFile} coverFile={coverFile} />
            {error && <p style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: 12 }}>{error}</p>}
          </Step>
        )}
      </div>

      {/* Footer nav */}
      {step <= TOTAL_STEPS && (
        <div style={{ padding: '12px 5% calc(12px + env(safe-area-inset-bottom))', borderTop: '1px solid var(--sn-border)', background: 'var(--sn-bg)', position: 'sticky', bottom: 0 }}>
          <div style={{ maxWidth: 560, margin: '0 auto' }}>
            {step < 8 ? (
              <button onClick={next} disabled={!canProceed()}
                style={{ width: '100%', padding: '13px', borderRadius: 999, border: 'none', background: canProceed() ? 'linear-gradient(135deg,#FF0080,#7800FF)' : 'var(--sn-btn-disabled-bg, #E5E7EB)', color: canProceed() ? '#fff' : 'var(--sn-btn-disabled-fg, #9CA3AF)', fontWeight: 700, fontSize: '0.9rem', cursor: canProceed() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'var(--sn-font)' }}>
                Continue <ArrowRight size={16} />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={submitting}
                style={{ width: '100%', padding: '13px', borderRadius: 999, border: 'none', background: 'linear-gradient(135deg,#FF0080,#7800FF)', color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: submitting ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'var(--sn-font)' }}>
                {submitting ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Submitting...</> : 'Submit for Review'}
              </button>
            )}
          </div>
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </main>
  )
}

// ── small shared building blocks ──

function Step({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--sn-text)', marginBottom: '1.25rem' }}>{title}</h1>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '1.1rem' }}>
      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--sn-muted)', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  )
}

function Input({ value, onChange, placeholder, type = 'text' }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} type={type}
      style={{ width: '100%', boxSizing: 'border-box', padding: '11px 14px', borderRadius: 12, border: '1.5px solid var(--sn-input-border)', background: 'var(--sn-input)', color: 'var(--sn-text)', fontSize: '0.88rem', fontFamily: 'var(--sn-font)', outline: 'none' }} />
  )
}

function TextArea({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={4}
      style={{ width: '100%', boxSizing: 'border-box', padding: '11px 14px', borderRadius: 12, border: '1.5px solid var(--sn-input-border)', background: 'var(--sn-input)', color: 'var(--sn-text)', fontSize: '0.88rem', fontFamily: 'var(--sn-font)', outline: 'none', resize: 'vertical' }} />
  )
}

function FileUpload({ file, onSelect, accept }: { file: File | null; onSelect: (f: File | null) => void; accept: string }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px', borderRadius: 12, border: '1.5px dashed var(--sn-input-border)', cursor: 'pointer', background: 'var(--sn-input)' }}>
      <Upload size={18} color="var(--sn-muted)" />
      <span style={{ fontSize: '0.82rem', color: file ? 'var(--sn-text)' : 'var(--sn-subtle)' }}>{file ? file.name : 'Tap to upload'}</span>
      <input type="file" accept={accept} onChange={e => onSelect(e.target.files?.[0] || null)} style={{ display: 'none' }} />
    </label>
  )
}

function WebstorePreviewFrame({ draft, mode, logoFile, coverFile }: { draft: WebstoreDraft; mode: 'desktop' | 'mobile'; logoFile: File | null; coverFile: File | null }) {
  const logoUrl = logoFile ? URL.createObjectURL(logoFile) : draft.shop_logo_url
  const coverUrl = coverFile ? URL.createObjectURL(coverFile) : draft.shop_cover_url
  return (
    <div style={{ border: '1.5px solid var(--sn-border)', borderRadius: 16, overflow: 'hidden', maxWidth: mode === 'mobile' ? 300 : '100%', margin: '0 auto', background: '#fff' }}>
      <div style={{ height: mode === 'mobile' ? 110 : 180, background: coverUrl ? `url(${coverUrl}) center/cover` : 'linear-gradient(135deg,#FF0080,#7800FF)' }} />
      <div style={{ padding: 16, marginTop: -32 }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: logoUrl ? `url(${logoUrl}) center/cover` : 'linear-gradient(135deg,#FF0080,#7800FF)', border: '3px solid #fff', marginBottom: 10 }} />
        <div style={{ fontWeight: 800, fontSize: '1rem', color: '#111827' }}>{draft.shop_name || 'Your Business Name'}</div>
        <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: 4 }}>{draft.shop_desc || 'Your business description will appear here.'}</div>
        <div style={{ fontSize: '0.7rem', color: '#9CA3AF', marginTop: 8 }}>{[draft.shop_city, draft.shop_region].filter(Boolean).join(', ')}</div>
      </div>
    </div>
  )
}
