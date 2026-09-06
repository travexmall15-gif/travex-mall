'use client'
import { Suspense, useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslation } from '@/hooks/useTranslation'
import { searchShops, searchProducts, type ShopSearchResult, type ProductSearchResult } from '@/lib/search'
import { getCurrentBuyerId, likeShop, unlikeShop } from '@/lib/shop-likes'
import { sb } from '@/lib/supabase'
import { Search, Heart, Store, MapPin, Loader2, AlertCircle, ShoppingBag } from 'lucide-react'

const fmt = (n: number) => 'TZS ' + Number(n).toLocaleString('en-US')

function SearchPageInner() {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQ = searchParams?.get('q') || ''

  const [q, setQ] = useState(initialQ)
  const [tab, setTab] = useState<'all' | 'shops' | 'products'>('all')
  const [shops, setShops] = useState<ShopSearchResult[]>([])
  const [products, setProducts] = useState<ProductSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [searched, setSearched] = useState(false)
  const [buyerId, setBuyerId] = useState<string | null>(null)
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { getCurrentBuyerId().then(setBuyerId) }, [])

  const runSearch = useCallback(async (query: string) => {
    if (!query.trim()) { setShops([]); setProducts([]); setSearched(false); return }
    setLoading(true); setError(false)
    try {
      const [s, p] = await Promise.all([searchShops(query, 12), searchProducts(query, 20)])
      setShops(s); setProducts(p); setSearched(true)

      if (buyerId && s.length > 0) {
        const { data } = await sb.from('shop_likes').select('store_id').eq('user_id', buyerId).in('store_id', s.map(x => x.id))
        setLikedIds(new Set((data || []).map((r: any) => r.store_id)))
      }
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [buyerId])

  // Search on mount if a query is present in the URL
  useEffect(() => { if (initialQ) runSearch(initialQ) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const onChange = (val: string) => {
    setQ(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      router.replace(`/search?q=${encodeURIComponent(val)}`, { scroll: false })
      runSearch(val)
    }, 350)
  }

  const toggleLike = async (storeId: string) => {
    if (!buyerId) { router.push('/auth'); return }
    const wasLiked = likedIds.has(storeId)
    setLikedIds(prev => {
      const next = new Set(prev)
      wasLiked ? next.delete(storeId) : next.add(storeId)
      return next
    })
    setShops(prev => prev.map(s => s.id === storeId ? { ...s, like_count: Math.max(0, s.like_count + (wasLiked ? -1 : 1)) } : s))
    const { error } = wasLiked ? await unlikeShop(storeId, buyerId) : await likeShop(storeId, buyerId)
    if (error) {
      setLikedIds(prev => { const n = new Set(prev); wasLiked ? n.add(storeId) : n.delete(storeId); return n })
      setShops(prev => prev.map(s => s.id === storeId ? { ...s, like_count: Math.max(0, s.like_count + (wasLiked ? 1 : -1)) } : s))
    }
  }

  const fmtCount = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K` : String(n)

  const showShops = tab === 'all' || tab === 'shops'
  const showProducts = tab === 'all' || tab === 'products'
  const noResults = searched && !loading && shops.length === 0 && products.length === 0

  return (
    <main style={{ minHeight: '100vh', background: 'var(--sn-page)', paddingTop: 118, fontFamily: 'var(--sn-font)' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 5% 4rem' }}>

        {/* Search input */}
        <div style={{ position: 'relative', marginBottom: '1rem' }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--sn-subtle)' }} />
          <input
            autoFocus value={q} onChange={e => onChange(e.target.value)}
            placeholder={t('search.placeholder')}
            style={{ width: '100%', boxSizing: 'border-box', paddingLeft: 38, paddingRight: 16, paddingTop: 12, paddingBottom: 12, border: '1.5px solid var(--sn-input-border)', borderRadius: 12, fontSize: '0.9rem', outline: 'none', background: 'var(--sn-input)', color: 'var(--sn-text)' }}
          />
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: '1.25rem' }}>
          {([['all', t('search.tabAll')], ['shops', t('search.tabShops')], ['products', t('search.tabProducts')]] as const).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              style={{ padding: '6px 16px', borderRadius: 999, fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', border: tab === key ? 'none' : '1.5px solid var(--sn-border)', background: tab === key ? 'var(--sn-text)' : 'var(--sn-bg)', color: tab === key ? 'var(--sn-page)' : 'var(--sn-muted)' }}>
              {label}
            </button>
          ))}
        </div>

        {q.trim() && (
          <p style={{ fontSize: '0.78rem', color: 'var(--sn-subtle)', marginBottom: '1rem' }}>
            {t('search.resultsFor')} "{q}"
          </p>
        )}

        {/* States */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <Loader2 size={28} style={{ animation: 'snspin 1s linear infinite', color: 'var(--sn-text)' }} />
            <style>{`@keyframes snspin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {!loading && error && (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <AlertCircle size={32} color="#DC2626" style={{ marginBottom: 10 }} />
            <p style={{ color: 'var(--sn-muted)', fontSize: '0.85rem' }}>{t('search.errorLoading')}</p>
          </div>
        )}

        {!loading && !error && !searched && (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <Search size={36} color="var(--sn-subtle)" style={{ marginBottom: 12 }} />
            <p style={{ color: 'var(--sn-muted)', fontSize: '0.85rem' }}>{t('search.emptyPrompt')}</p>
          </div>
        )}

        {noResults && (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div style={{ fontSize: '2rem', marginBottom: 10 }}>🔍</div>
            <p style={{ fontWeight: 700, color: 'var(--sn-text)', marginBottom: 4 }}>{t('search.noResults')}</p>
            <p style={{ fontSize: '0.82rem', color: 'var(--sn-subtle)' }}>{t('search.noResultsDesc')}</p>
          </div>
        )}

        {/* Shops */}
        {!loading && !error && showShops && shops.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            {tab === 'all' && <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--sn-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('search.shopsSection')}</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {shops.map(shop => (
                <div key={shop.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--sn-bg)', border: '1.5px solid var(--sn-border)', borderRadius: 14, padding: '12px 14px' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--sn-page)', border: '1.5px solid var(--sn-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                    {shop.shop_logo ? <img src={shop.shop_logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Store size={18} color="#1D4ED8" />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--sn-text)', display: 'flex', alignItems: 'center', gap: 5 }}>
                      {shop.shop_name}
                      {shop.plan === 'premium' && <span style={{ color: '#1D4ED8', fontSize: '0.7rem' }}>✓</span>}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--sn-subtle)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      {shop.shop_category}
                      {shop.shop_region && <><MapPin size={9} /> {shop.shop_region}</>}
                    </div>
                  </div>
                  <button onClick={() => toggleLike(shop.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--sn-page)', border: '1.5px solid var(--sn-border)', borderRadius: 999, padding: '5px 10px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700, color: likedIds.has(shop.id) ? '#EF4444' : 'var(--sn-muted)', flexShrink: 0 }}>
                    <Heart size={11} fill={likedIds.has(shop.id) ? 'currentColor' : 'none'} /> {shop.like_count > 0 && fmtCount(shop.like_count)}
                  </button>
                  <Link href={`/store/${shop.id}`}
                    style={{ background: 'linear-gradient(135deg,#FF0080,#7800FF)', color: '#fff', borderRadius: 999, padding: '6px 14px', fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none', flexShrink: 0 }}>
                    {t('store.visitShop') || 'Visit'}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Products */}
        {!loading && !error && showProducts && products.length > 0 && (
          <div>
            {tab === 'all' && <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--sn-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('search.productsSection')}</div>}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 10 }}>
              {products.map(p => (
                <Link key={p.id} href={`/store/${p.store_id}?product=${p.id}`} style={{ textDecoration: 'none', border: '1.5px solid var(--sn-border)', borderRadius: 14, overflow: 'hidden', background: 'var(--sn-bg)' }}>
                  <div style={{ position: 'relative', height: 110, background: 'var(--sn-page)' }}>
                    {p.image_url ? <Image src={p.image_url} alt={p.name} fill style={{ objectFit: 'cover' }} /> : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}><ShoppingBag size={24} color="var(--sn-subtle)" /></div>}
                  </div>
                  <div style={{ padding: 10 }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--sn-text)', marginBottom: 2, display: '-webkit-box', WebkitLineClamp: 1 as any, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden' }}>{p.name}</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 900, color: 'var(--sn-primary)', marginBottom: 2 }}>{fmt(p.price)}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--sn-subtle)' }}>{p.shop_name}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchPageInner />
    </Suspense>
  )
}
