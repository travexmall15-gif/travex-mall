'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { sb } from '@/lib/supabase'

// ── Types ──────────────────────────────────────────────────
type Result = {
  id: string
  shop_name: string
  shop_slug: string
  shop_category: string
  shop_city: string
  logo_url: string
  rating: number
  match_reason: string
  products: { name: string; price: number }[]
}

type Step = 'idle' | 'asking' | 'searching' | 'done'

// ── Quick filters ──────────────────────────────────────────
const CATEGORIES = ['Electronics','Fashion','Food','Beauty','Home','Books','Sports','Accessories','Kids','Health']
const CITIES     = ['Dar es Salaam','Arusha','Mwanza','Dodoma','Moshi','Zanzibar','Tanga','Morogoro']

export default function AiPage() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  // Form state
  const [query,    setQuery]    = useState('')
  const [budget,   setBudget]   = useState('')
  const [category, setCategory] = useState('')
  const [city,     setCity]     = useState('')
  const [step,     setStep]     = useState<Step>('idle')
  const [results,  setResults]  = useState<Result[]>([])
  const [aiMsg,    setAiMsg]    = useState('')
  const [dots,     setDots]     = useState('.')

  // Animated dots while searching
  useEffect(() => {
    if (step !== 'searching') return
    const t = setInterval(() => setDots(d => d.length >= 3 ? '.' : d + '.'), 400)
    return () => clearInterval(t)
  }, [step])

  // ── AI typing effect ────────────────────────────────────
  function typeMessage(msg: string) {
    setAiMsg('')
    let i = 0
    const t = setInterval(() => {
      setAiMsg(msg.slice(0, i + 1))
      i++
      if (i >= msg.length) clearInterval(t)
    }, 18)
  }

  // ── Search ──────────────────────────────────────────────
  async function runSearch() {
    if (!query.trim()) { inputRef.current?.focus(); return }

    setStep('searching')
    setResults([])
    setAiMsg('')

    const budgetNum = budget ? parseInt(budget.replace(/,/g,'')) * (budget.toLowerCase().includes('k') ? 1000 : 1) : 0
    const lq = query.toLowerCase()

    // Detect category from query if not selected
    const CAT_MAP: Record<string,string[]> = {
      Electronics: ['simu','phone','laptop','computer','gadget','charger','tv','electronics'],
      Fashion:     ['shoes','viatu','nguo','clothes','dress','shirt','bag','fashion','jeans'],
      Food:        ['chakula','food','groceries','mkate','nyama','matunda','mboga','juice'],
      Beauty:      ['beauty','makeup','skin','hair','nywele','sabuni','lotion','perfume'],
    }
    let detectedCat = category
    if (!detectedCat) {
      for (const [cat, kws] of Object.entries(CAT_MAP)) {
        if (kws.some(k => lq.includes(k))) { detectedCat = cat; break }
      }
    }

    // City from query
    const CITY_KW: Record<string,string[]> = {
      'Dar es Salaam': ['dar','kariakoo','ubungo','temeke'],
      'Arusha':        ['arusha'],
      'Mwanza':        ['mwanza'],
      'Zanzibar':      ['zanzibar','unguja'],
    }
    let detectedCity = city
    if (!detectedCity) {
      for (const [c, kws] of Object.entries(CITY_KW)) {
        if (kws.some(k => lq.includes(k))) { detectedCity = c; break }
      }
    }

    try {
      // Build shop query
      let q2 = sb.from('shops')
        .select('id,shop_name,shop_slug,shop_category,shop_city,logo_url,rating,is_verified,shop_description')
        .eq('is_verified', true)
        .limit(30)

      if (detectedCat) q2 = q2.ilike('shop_category', `%${detectedCat}%`)
      if (detectedCity) q2 = q2.ilike('shop_city', `%${detectedCity}%`)

      const { data: shops } = await q2

      const enriched: Result[] = []

      for (const shop of (shops || []).slice(0, 15)) {
        let pq = sb.from('products')
          .select('name,price')
          .eq('shop_id', shop.id)
          .eq('is_available', true)
          .limit(4)

        if (budgetNum > 0) pq = pq.lte('price', budgetNum)

        // Search product name from query
        const searchTerms = query.split(' ').filter(w => w.length > 2 &&
          !['nataka','ninatafuta','tafuta','find','nipe','please','na','ya','la','wa','za','kwa'].includes(w.toLowerCase())
        )
        if (searchTerms.length) pq = pq.or(searchTerms.map(t => `name.ilike.%${t}%`).join(','))

        const { data: products } = await pq

        // Text fallback search on shops
        const textMatch = searchTerms.some(t =>
          shop.shop_name?.toLowerCase().includes(t.toLowerCase()) ||
          shop.shop_description?.toLowerCase().includes(t.toLowerCase())
        )

        if (products?.length || textMatch) {
          const reasons: string[] = []
          if (products?.length)             reasons.push(`${products.length} product${products.length > 1 ? 's' : ''} zinazolingana`)
          if (budgetNum > 0 && products?.length) reasons.push(`ndani ya TZS ${budgetNum.toLocaleString()}`)
          if (detectedCity)                 reasons.push(`📍 ${detectedCity}`)

          enriched.push({
            ...shop,
            match_reason: reasons.join(' · ') || 'Verified store',
            products: products || [],
            rating: shop.rating || 0,
          })
        }
      }

      // Fallback — text search on shops if still empty
      if (!enriched.length) {
        const { data: fallback } = await sb.from('shops')
          .select('id,shop_name,shop_slug,shop_category,shop_city,logo_url,rating')
          .or(`shop_name.ilike.%${query}%,shop_description.ilike.%${query}%,shop_category.ilike.%${query}%`)
          .limit(6)
        for (const s of (fallback || [])) {
          enriched.push({ ...s, match_reason: 'Matches search', products: [], rating: s.rating || 0 })
        }
      }

      const sorted = enriched.sort((a,b) => b.products.length - a.products.length).slice(0, 8)
      setResults(sorted)
      setStep('done')

      // AI message
      if (sorted.length === 0) {
        typeMessage(`Samahani, sikupata maduka yanayofanana na "${query}". Jaribu maneno tofauti au angalia market yote.`)
      } else {
        const summary = `Nimepata maduka ${sorted.length} yanayofanana na ulichotafuta${budgetNum ? ` ndani ya TZS ${budgetNum.toLocaleString()}` : ''}${detectedCity ? ` huko ${detectedCity}` : ''}. Angalia orodha hapa chini! 👇`
        typeMessage(summary)
      }

    } catch (e) {
      setStep('done')
      typeMessage('Tatizo limetokea. Jaribu tena.')
    }
  }

  const canSearch = query.trim().length > 1

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: "'Inter',sans-serif" }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#080F37,#0D1B3E)', padding: '0 5%', position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '12px', height: '56px' }}>
          <button onClick={() => router.back()} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', width: '32px', height: '32px', borderRadius: '10px', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
          <span style={{ fontSize: '1.1rem' }}>✨</span>
          <div>
            <div style={{ fontWeight: 800, color: '#fff', fontSize: '0.92rem', letterSpacing: '-0.01em' }}>360 AI</div>
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>Smart Store Finder</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6ee7b7' }} />
            <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>Online</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '24px 16px 120px' }}>

        {/* Welcome state */}
        {step === 'idle' && (
          <div style={{ textAlign: 'center', padding: '32px 0 28px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🔍</div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>Niambie unataka nini</h1>
            <p style={{ color: '#64748B', fontSize: '0.88rem', lineHeight: 1.6 }}>Andika bidhaa, budget, na eneo lako — 360 AI itakutafutia maduka yanayofaa</p>

            {/* Quick examples */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '20px' }}>
              {[
                'Shoes za chini ya 50k Dar',
                'Laptop under 800,000',
                'Chakula cha haraka Arusha',
                'Nguo za watoto budget 30k',
                'Phone accessories online',
                'Beauty products affordable',
              ].map((s, i) => (
                <button key={i} onClick={() => { setQuery(s); setTimeout(runSearch, 50) }}
                  style={{ padding: '7px 14px', borderRadius: '999px', background: '#F1F5F9', border: '1px solid #E2E8F0', color: '#475569', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'Inter,sans-serif', transition: 'all .2s' }}
                  onMouseOver={e => { (e.target as HTMLElement).style.background = '#E2E8F0' }}
                  onMouseOut={e => { (e.target as HTMLElement).style.background = '#F1F5F9' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* AI typing message */}
        {aiMsg && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg,#0D1B3E,#1a2a5e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0 }}>✨</div>
            <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '0 16px 16px 16px', padding: '12px 16px', fontSize: '0.88rem', color: '#334155', lineHeight: 1.6, boxShadow: '0 1px 6px rgba(0,0,0,0.05)', maxWidth: '85%' }}>
              {aiMsg}
              {step === 'searching' && <span style={{ opacity: 0.5 }}>{dots}</span>}
            </div>
          </div>
        )}

        {/* Searching skeleton */}
        {step === 'searching' && !aiMsg && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg,#0D1B3E,#1a2a5e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0 }}>✨</div>
            <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '0 16px 16px 16px', padding: '12px 16px', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
              <span style={{ color: '#94A3B8', fontSize: '0.85rem' }}>Ninasearch maduka{dots}</span>
            </div>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px' }}>
            {results.map((store, i) => (
              <a key={store.id} href={`/store/${store.shop_slug}`}
                style={{ display: 'flex', alignItems: 'center', gap: '14px', background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: '16px', padding: '14px 16px', textDecoration: 'none', color: 'inherit', boxShadow: '0 1px 6px rgba(0,0,0,0.04)', transition: 'all .2s', animationDelay: `${i * 60}ms` }}
                onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = '#C9A84C'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(201,168,76,0.12)' }}
                onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = '#E2E8F0'; (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 6px rgba(0,0,0,0.04)' }}>

                {/* Logo */}
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0, background: store.logo_url ? `url(${store.logo_url}) center/cover` : 'linear-gradient(135deg,#0D1B3E,#1a2a5e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', color: '#C9A84C', fontWeight: 800, border: '1px solid #E2E8F0' }}>
                  {!store.logo_url && (store.shop_name?.[0]?.toUpperCase() || '🏪')}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                    <span style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.92rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{store.shop_name}</span>
                    {store.rating > 0 && <span style={{ fontSize: '0.68rem', color: '#C9A84C', flexShrink: 0 }}>⭐ {store.rating.toFixed(1)}</span>}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginBottom: '5px', display: 'flex', gap: '8px' }}>
                    {store.shop_category && <span>{store.shop_category}</span>}
                    {store.shop_city && <span>📍 {store.shop_city}</span>}
                  </div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.68rem', color: '#059669', background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.15)', borderRadius: '999px', padding: '2px 8px' }}>
                    ✓ {store.match_reason}
                  </span>
                  {store.products.length > 0 && (
                    <div style={{ marginTop: '7px', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      {store.products.slice(0,3).map((p,j) => (
                        <span key={j} style={{ fontSize: '0.68rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '2px 8px', color: '#475569' }}>
                          {p.name} · <strong>TZS {p.price?.toLocaleString()}</strong>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <span style={{ color: '#CBD5E1', fontSize: '1.2rem', flexShrink: 0 }}>›</span>
              </a>
            ))}

            <a href={`/market?q=${encodeURIComponent(query)}`}
              style={{ display: 'block', textAlign: 'center', padding: '12px', color: '#3B82F6', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none', borderRadius: '12px', background: '#EFF6FF', border: '1px solid #DBEAFE' }}>
              Angalia maduka yote kwenye Market →
            </a>
          </div>
        )}

        {/* No results */}
        {step === 'done' && results.length === 0 && (
          <div style={{ textAlign: 'center', padding: '24px', color: '#94A3B8', fontSize: '0.85rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔎</div>
            Hakuna maduka yaliyopatikana.<br/>
            <a href="/market" style={{ color: '#3B82F6', textDecoration: 'none', fontWeight: 600 }}>Angalia market yote →</a>
          </div>
        )}
      </div>

      {/* ── Fixed bottom input ─────────────────────────────── */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid #E2E8F0', padding: '12px 16px 20px', zIndex: 100 }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>

          {/* Filters row */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
            {/* Budget */}
            <input
              value={budget}
              onChange={e => setBudget(e.target.value)}
              placeholder="💰 Budget (e.g. 50000)"
              style={{ minWidth: '150px', flex: '0 0 auto', padding: '7px 12px', borderRadius: '999px', border: '1.5px solid #E2E8F0', fontSize: '0.75rem', fontFamily: 'Inter,sans-serif', outline: 'none', color: '#334155' }}
              onFocus={e => e.target.style.borderColor = '#C9A84C'}
              onBlur={e => e.target.style.borderColor = '#E2E8F0'}
            />
            {/* Category */}
            <select value={category} onChange={e => setCategory(e.target.value)}
              style={{ minWidth: '130px', flex: '0 0 auto', padding: '7px 10px', borderRadius: '999px', border: '1.5px solid #E2E8F0', fontSize: '0.75rem', fontFamily: 'Inter,sans-serif', color: category ? '#334155' : '#94A3B8', outline: 'none', background: '#fff', cursor: 'pointer' }}>
              <option value="">📦 Category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {/* City */}
            <select value={city} onChange={e => setCity(e.target.value)}
              style={{ minWidth: '130px', flex: '0 0 auto', padding: '7px 10px', borderRadius: '999px', border: '1.5px solid #E2E8F0', fontSize: '0.75rem', fontFamily: 'Inter,sans-serif', color: city ? '#334155' : '#94A3B8', outline: 'none', background: '#fff', cursor: 'pointer' }}>
              <option value="">📍 City</option>
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Main input */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && runSearch()}
              placeholder="Niambie unataka nini... e.g. 'nataka shoes'"
              style={{ flex: 1, padding: '13px 16px', borderRadius: '14px', border: '1.5px solid #E2E8F0', fontSize: '0.88rem', fontFamily: 'Inter,sans-serif', outline: 'none', color: '#0F172A' }}
              onFocus={e => e.target.style.borderColor = '#C9A84C'}
              onBlur={e => e.target.style.borderColor = '#E2E8F0'}
            />
            <button onClick={runSearch} disabled={!canSearch || step === 'searching'}
              style={{ padding: '13px 22px', borderRadius: '14px', background: canSearch ? '#0D1B3E' : '#E2E8F0', border: 'none', color: canSearch ? '#C9A84C' : '#94A3B8', fontWeight: 700, fontSize: '0.85rem', cursor: canSearch ? 'pointer' : 'default', fontFamily: 'Inter,sans-serif', transition: 'all .2s', whiteSpace: 'nowrap' }}>
              {step === 'searching' ? '...' : 'Search ✨'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
