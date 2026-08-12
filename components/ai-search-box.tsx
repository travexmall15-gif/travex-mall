'use client'
import { useTranslation } from "@/hooks/useTranslation"
import { useState, useRef } from 'react'
import { sb } from '@/lib/supabase'

type StoreResult = {
  id: string
  shop_name: string
  shop_slug: string
  shop_category: string
  shop_city: string
  shop_description: string
  logo_url: string
  rating: number
  match_reason: string
  products?: { name: string; price: number }[]
}

const SUGGESTIONS = [
  'Nataka shoes za chini ya 50,000',
  'Duka la electronics Dar es Salaam',
  'Chakula cha haraka chini ya 10,000',
  'Clothes za watoto budget 30k',
  'Phone accessories near me',
  'Groceries online delivery',
]

export default function AiSearchBox() {
  const { t } = useTranslation()
  const [query, setQuery]     = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<StoreResult[]>([])
  const [searched, setSearched] = useState(false)
  const [error, setError]     = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // ── Parse query into filters ────────────────────────────
  function parseQuery(q: string) {
    const lq = q.toLowerCase()

    // Budget extraction
    const budgetMatch = lq.match(/(\d[\d,]*)\s*(k|elfu|thousand)?/)
    let budget = 0
    if (budgetMatch) {
      budget = parseInt(budgetMatch[1].replace(/,/g,''))
      if (budgetMatch[2]) budget *= 1000
    }

    // Category keywords
    const categories: Record<string, string[]> = {
      'electronics':  ['electronics','simu','phone','laptop','computer','gadget','tech'],
      'fashion':      ['shoes','nguo','clothes','fashion','viatu','dress','shirt','bag','mfuko'],
      'food':         ['chakula','food','groceries','mkate','nyama','matunda','vegetables','mboga'],
      'beauty':       ['beauty','makeup','cosmetics','skin','hair','nywele','sabuni'],
      'home':         ['furniture','nyumba','home','kitchen','sufuria','bedding'],
      'books':        ['books','vitabu','stationery','school','shule'],
      'sports':       ['sports','gym','fitness','football','mpira','michezo'],
      'accessories':  ['accessories','watch','saa','jewellery','hereni','bangili'],
    }

    let detectedCategory = ''
    for (const [cat, keywords] of Object.entries(categories)) {
      if (keywords.some(k => lq.includes(k))) {
        detectedCategory = cat
        break
      }
    }

    // Location
    const cities = ['dar es salaam','dar','mwanza','arusha','dodoma','moshi','tanga','zanzibar','morogoro','iringa']
    const city = cities.find(c => lq.includes(c)) || ''

    // Extract product terms (remove common words)
    const stopWords = ['nataka','ninatafuta','tafuta','find','search','nilete','nipe','please','tafadhali','nionyeshe','duka','la','za','ya','wa','na','kwa','chini','juu','karibu','near','me','online']
    const terms = q.split(/\s+/).filter(w => !stopWords.includes(w.toLowerCase()) && w.length > 2).join(' ')

    return { budget, category: detectedCategory, city, terms }
  }

  // ── Search Supabase ────────────────────────────────────
  async function search() {
    if (!query.trim()) return
    setLoading(true)
    setSearched(true)
    setResults([])
    setError('')

    try {
      const { budget, category, city, terms } = parseQuery(query)

      // Build shop query
      let shopQuery = sb
        .from('shops')
        .select('id,shop_name,shop_slug,shop_category,shop_city,shop_description,logo_url,rating,is_verified')
        .eq('is_verified', true)
        .limit(20)

      if (category) shopQuery = shopQuery.ilike('shop_category', `%${category}%`)
      if (city)     shopQuery = shopQuery.ilike('shop_city', `%${city}%`)

      const { data: shops } = await shopQuery

      // For each shop, search products
      const enriched: StoreResult[] = []

      for (const shop of (shops || []).slice(0, 10)) {
        let prodQuery = sb
          .from('products')
          .select('name,price')
          .eq('shop_id', shop.id)
          .eq('is_available', true)
          .limit(5)

        if (budget > 0)  prodQuery = prodQuery.lte('price', budget)
        if (terms)       prodQuery = prodQuery.ilike('name', `%${terms}%`)

        const { data: products } = await prodQuery

        // Score relevance
        let score = 0
        if (products?.length) score += products.length * 10
        if (category && shop.shop_category?.toLowerCase().includes(category)) score += 20
        if (city && shop.shop_city?.toLowerCase().includes(city)) score += 15
        if (shop.rating) score += shop.rating * 3

        if (products?.length || score > 20) {
          // Build match reason
          const reasons = []
          if (products?.length)    reasons.push(`${products.length} product${products.length > 1 ? 's' : ''} found`)
          if (budget > 0 && products?.length) reasons.push(`within TZS ${budget.toLocaleString()} budget`)
          if (city)                reasons.push(`in ${city}`)

          enriched.push({
            ...shop,
            match_reason: reasons.join(' · ') || 'Verified store',
            products: products || [],
            rating: shop.rating || 0,
          })
        }
      }

      // Also do text search on shops if no results
      if (!enriched.length && terms) {
        const { data: textShops } = await sb
          .from('shops')
          .select('id,shop_name,shop_slug,shop_category,shop_city,shop_description,logo_url,rating')
          .or(`shop_name.ilike.%${terms}%,shop_description.ilike.%${terms}%,shop_category.ilike.%${terms}%`)
          .limit(8)

        for (const shop of (textShops || [])) {
          enriched.push({ ...shop, match_reason: 'Matches your search', products: [] })
        }
      }

      // Sort by score
      enriched.sort((a, b) => (b.products?.length || 0) - (a.products?.length || 0))
      setResults(enriched.slice(0, 8))

    } catch (e) {
      setError('Tatizo limetokea. Jaribu tena.')
    }

    setLoading(false)
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') search()
  }

  return (
    <div>
      {/* Input row */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.1rem' }}>✨</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Describe what you need... e.g. 'shoes chini ya 50k Dar'"
            style={{
              width: '100%', padding: '14px 16px 14px 44px',
              background: 'rgba(255,255,255,0.07)',
              border: '1.5px solid rgba(255,255,255,0.15)',
              borderRadius: '16px', color: '#0F172A',
              fontSize: '0.9rem', outline: 'none',
              transition: 'border-color 0.2s',
              fontFamily: 'Inter, sans-serif',
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(29,78,216,0.6)'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
          />
        </div>
        <button
          onClick={search}
          disabled={loading || !query.trim()}
          style={{
            padding: '14px 24px', borderRadius: '16px',
            background: query.trim() ? '#1D4ED8' : 'rgba(29,78,216,0.3)',
            border: 'none', color: query.trim() ? '#111' : 'rgba(255,255,255,0.4)',
            fontWeight: 700, fontSize: '0.85rem', cursor: query.trim() ? 'pointer' : 'default',
            transition: 'all 0.2s', whiteSpace: 'nowrap',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {loading ? '...' : 'Search'}
        </button>
      </div>

      {/* Suggestions */}
      {!searched && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
          {SUGGESTIONS.map((s, i) => (
            <button
              key={i}
              onClick={() => { setQuery(s); setTimeout(search, 100) }}
              style={{
                padding: '5px 12px', borderRadius: '999px',
                background: '#fff',
                border: '1px solid #E2E8F0',
                color: 'rgba(255,255,255,0.55)', fontSize: '0.72rem',
                cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                transition: 'all 0.2s',
              }}
              onMouseOver={e => { (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.12)'; (e.target as HTMLElement).style.color = '#fff' }}
              onMouseOut={e => { (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.55)' }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #F1F5F9', borderRadius: '14px', padding: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#F1F5F9', flexShrink: 0 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ height: '12px', width: '40%', background: '#F1F5F9', borderRadius: '6px' }} />
                <div style={{ height: '10px', width: '60%', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ marginTop: '16px', padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', color: '#FCA5A5', fontSize: '0.85rem' }}>
          {error}
        </div>
      )}

      {/* Results */}
      {!loading && searched && results.length === 0 && !error && (
        <div style={{ marginTop: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', padding: '24px' }}>
          Hakuna maduka yaliyopatikana kwa &quot;{query}&quot;.<br/>
          <span style={{ fontSize: '0.8rem' }}>{t('ai.noResultsDesc')} <a href="/market" style={{ color: '#1D4ED8', textDecoration: 'none' }}>{t('ai.browseAll')}</a></span>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
            {results.length} store{results.length > 1 ? 's' : ''} found for &quot;{query}&quot;
          </div>

          {results.map((store, i) => (
            <a
              key={store.id}
              href={`/store/${store.shop_slug}`}
              className="ai-result-item"
              style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid #F1F5F9',
                borderRadius: '14px', padding: '14px 16px',
                textDecoration: 'none', color: 'inherit',
                transition: 'all 0.2s',
                animationDelay: `${i * 80}ms`,
              }}
              onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.09)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(29,78,216,0.3)' }}
              onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)' }}
            >
              {/* Logo */}
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                background: store.logo_url ? `url(${store.logo_url}) center/cover` : 'linear-gradient(135deg,#1a2a5e,#0D1B3E)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.2rem', color: '#1D4ED8', fontWeight: 800,
                border: '1px solid rgba(255,255,255,0.1)',
              }}>
                {!store.logo_url && (store.shop_name?.[0] || '🏪')}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                  <span style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {store.shop_name}
                  </span>
                  {store.rating > 0 && (
                    <span style={{ fontSize: '0.68rem', color: '#1D4ED8', flexShrink: 0 }}>⭐ {store.rating.toFixed(1)}</span>
                  )}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginBottom: '4px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {store.shop_category && <span>{store.shop_category}</span>}
                  {store.shop_city && <span>📍 {store.shop_city}</span>}
                </div>
                {store.match_reason && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.68rem', color: '#6ee7b7', background: 'rgba(110,231,183,0.08)', border: '1px solid rgba(110,231,183,0.15)', borderRadius: '999px', padding: '2px 8px' }}>
                    ✓ {store.match_reason}
                  </span>
                )}
                {store.products && store.products.length > 0 && (
                  <div style={{ marginTop: '6px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {store.products.slice(0,3).map((p,j) => (
                      <span key={j} style={{ fontSize: '0.68rem', background: '#fff', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '6px', padding: '2px 8px', color: 'rgba(255,255,255,0.55)' }}>
                        {p.name} · TZS {p.price?.toLocaleString()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Arrow */}
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '1rem', flexShrink: 0 }}>›</span>
            </a>
          ))}

          {/* See all */}
          <a
            href={`/market?q=${encodeURIComponent(query)}`}
            style={{ display: 'block', textAlign: 'center', padding: '12px', color: '#1D4ED8', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none', marginTop: '4px' }}
          >
            Angalia maduka yote kwenye Market →
          </a>
        </div>
      )}
    </div>
  )
}
