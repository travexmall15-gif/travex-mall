'use client'
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslation } from '@/hooks/useTranslation'
import { searchMarketplace, type MarketplaceSearchKind, type MarketplaceSearchResult } from '@/lib/search'
import { getCurrentBuyerId, getLikedStoreIds, likeShop, unlikeShop } from '@/lib/shop-likes'
import { Search, Heart, Store, MapPin, Loader2, AlertCircle, ShoppingBag, Image as ImageIcon, Zap, Users, BriefcaseBusiness, SearchX, ArrowRight } from 'lucide-react'

const fmt = (n: number) => 'TZS ' + Number(n).toLocaleString('en-US')
const RESULT_KINDS: MarketplaceSearchKind[] = ['store', 'vybe', 'flash_deal', 'product', 'service', 'group_buy']
const RESULT_LABELS: Record<MarketplaceSearchKind, string> = {
  store: 'WebStores', vybe: 'Vybe', flash_deal: 'Flash Deals', product: 'Products', service: 'Services', group_buy: 'Group Buy',
}
const RESULT_ICONS = {
  store: Store, vybe: ImageIcon, flash_deal: Zap, product: ShoppingBag, service: BriefcaseBusiness, group_buy: Users,
} satisfies Record<MarketplaceSearchKind, typeof Store>

function SearchPageInner() {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const initialCategory = searchParams.get('category') || ''

  const [q, setQ] = useState(initialQuery || initialCategory)
  const [category, setCategory] = useState(initialCategory)
  const [tab, setTab] = useState<'all' | MarketplaceSearchKind>('all')
  const [results, setResults] = useState<MarketplaceSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [searched, setSearched] = useState(false)
  const [buyerId, setBuyerId] = useState<string | null>(null)
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { getCurrentBuyerId().then(setBuyerId) }, [])

  const runSearch = useCallback(async (query: string, categoryFilter = '') => {
    if (!query.trim() && !categoryFilter.trim()) {
      setResults([]); setSearched(false); setError(false); return
    }
    setLoading(true); setError(false)
    try {
      const found = await searchMarketplace({ query, category: categoryFilter, limit: 8 })
      setResults(found)
      setSearched(true)
      const storeIds = found.filter(item => item.kind === 'store' || item.kind === 'service').map(item => item.id)
      setLikedIds(buyerId && storeIds.length ? await getLikedStoreIds(storeIds) : new Set())
    } catch {
      setError(true)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [buyerId])

  useEffect(() => {
    if (initialQuery || initialCategory) {runSearch(initialQuery, initialCategory)}
    return () => { if (debounceRef.current) {clearTimeout(debounceRef.current)} }
  // The URL is used only for the initial search; typing below owns subsequent requests.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onChange = (value: string) => {
    setQ(value)
    setCategory('')
    if (debounceRef.current) {clearTimeout(debounceRef.current)}
    debounceRef.current = setTimeout(() => {
      router.replace(value.trim() ? `/search?q=${encodeURIComponent(value.trim())}` : '/search', { scroll: false })
      runSearch(value, '')
    }, 300)
  }

  const toggleLike = async (storeId: string) => {
    if (!buyerId) {router.push('/auth'); return}
    const wasLiked = likedIds.has(storeId)
    setLikedIds(previous => {
      const next = new Set(previous)
      wasLiked ? next.delete(storeId) : next.add(storeId)
      return next
    })
    setResults(previous => previous.map(item => (item.id === storeId && (item.kind === 'store' || item.kind === 'service'))
      ? { ...item, likeCount: Math.max(0, (item.likeCount || 0) + (wasLiked ? -1 : 1)) }
      : item))
    const { error: likeError } = wasLiked ? await unlikeShop(storeId, buyerId) : await likeShop(storeId, buyerId)
    if (likeError) {
      setLikedIds(previous => {
        const next = new Set(previous)
        wasLiked ? next.add(storeId) : next.delete(storeId)
        return next
      })
      setResults(previous => previous.map(item => (item.id === storeId && (item.kind === 'store' || item.kind === 'service'))
        ? { ...item, likeCount: Math.max(0, (item.likeCount || 0) + (wasLiked ? 1 : -1)) }
        : item))
    }
  }

  const visibleKinds = tab === 'all' ? RESULT_KINDS : [tab]
  const filteredResults = useMemo(() => tab === 'all' ? results : results.filter(item => item.kind === tab), [results, tab])
  const noResults = searched && !loading && filteredResults.length === 0
  const labelFor = (kind: MarketplaceSearchKind) => kind === 'store' ? t('search.tabShops') : kind === 'product' ? t('search.tabProducts') : RESULT_LABELS[kind]

  return (
    <main style={{ minHeight: '100vh', background: 'var(--sn-page)', paddingTop: 118, fontFamily: 'var(--sn-font)' }}>
      <div style={{ maxWidth: 920, margin: '0 auto', padding: '0 5% 4rem' }}>
        <div style={{ position: 'relative', marginBottom: '1rem' }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--sn-subtle)' }} />
          <input
            autoFocus value={q} onChange={event => onChange(event.target.value)}
            aria-label={t('search.placeholder')} placeholder={t('search.placeholder')}
            className="sn-field"
            style={{ width: '100%', boxSizing: 'border-box', paddingLeft: 38, paddingRight: 16, paddingTop: 12, paddingBottom: 12, fontSize: '0.9rem' }}
          />
        </div>

        {category && !initialQuery && (
          <p style={{ margin: '0 0 1rem', color: 'var(--sn-muted)', fontSize: '0.82rem' }}>
            Products in <strong>{category}</strong>
          </p>
        )}

        <div role="tablist" aria-label="Search result categories" style={{ display: 'flex', gap: 6, marginBottom: '1.25rem', overflowX: 'auto', paddingBottom: 4 }}>
          {(['all', ...RESULT_KINDS] as const).map(key => {
            const label = key === 'all' ? t('search.tabAll') : labelFor(key)
            return (
              <button key={key} role="tab" aria-selected={tab === key} onClick={() => setTab(key)}
                className="sn-search-tab"
                style={{ padding: '6px 14px', borderRadius: 999, fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', border: tab === key ? 'none' : '1px solid var(--sn-border)', background: tab === key ? 'var(--sn-text)' : 'var(--sn-bg)', color: tab === key ? 'var(--sn-page)' : 'var(--sn-muted)' }}>
                {label}
              </button>
            )
          })}
        </div>

        {q.trim() && (
          <p style={{ fontSize: '0.78rem', color: 'var(--sn-subtle)', marginBottom: '1rem' }}>
            {t('search.resultsFor')} “{q}”
          </p>
        )}

        {loading && (
          <div role="status" style={{ textAlign: 'center', padding: '3rem 0' }}>
            <Loader2 size={28} style={{ animation: 'snspin 1s linear infinite', color: 'var(--sn-text)' }} />
            <style>{`@keyframes snspin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {!loading && error && (
          <div role="alert" style={{ textAlign: 'center', padding: '3rem 0' }}>
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
            <SearchX size={32} color="var(--sn-subtle)" style={{ marginBottom: 10 }} />
            <p style={{ fontWeight: 700, color: 'var(--sn-text)', marginBottom: 4 }}>{t('search.noResults')}</p>
            <p style={{ fontSize: '0.82rem', color: 'var(--sn-subtle)' }}>{t('search.noResultsDesc')}</p>
          </div>
        )}

        {!loading && !error && searched && visibleKinds.map(kind => {
          const sectionResults = results.filter(item => item.kind === kind)
          if (sectionResults.length === 0 || (tab === 'all' && sectionResults.length === 0)) {return null}
          const items = tab === 'all' ? sectionResults.slice(0, 4) : sectionResults
          const Icon = RESULT_ICONS[kind]
          return (
            <section key={kind} aria-label={labelFor(kind)} style={{ marginBottom: '1.5rem' }}>
              {tab === 'all' && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--sn-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{labelFor(kind)}</div>
                  {sectionResults.length > items.length && (
                    <button onClick={() => setTab(kind)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, border: 0, background: 'none', color: 'var(--sn-primary)', cursor: 'pointer', fontWeight: 700, fontSize: '0.75rem' }}>
                      View all <ArrowRight size={13} />
                    </button>
                  )}
                </div>
              )}

              {kind === 'product' ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 10 }}>
                  {items.map(item => <ProductResultCard key={item.id} item={item} />)}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {items.map(item => (
                    <div key={`${item.kind}:${item.id}`} className="sn-card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px' }}>
                      <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--sn-page)', border: '1px solid var(--sn-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                        {item.imageUrl ? <Image src={item.imageUrl} alt="" fill sizes="48px" style={{ objectFit: 'cover' }} /> : <Icon size={19} color="var(--sn-primary)" />}
                      </div>
                      <Link href={item.href} style={{ flex: 1, minWidth: 0, textDecoration: 'none', color: 'inherit' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--sn-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--sn-subtle)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                          {item.subtitle}
                          {item.region && <><MapPin size={10} />{item.region}</>}
                        </div>
                        {item.description && <div style={{ fontSize: '0.72rem', color: 'var(--sn-muted)', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.description}</div>}
                      </Link>
                      {(kind === 'store' || kind === 'service') && (
                        <button onClick={() => toggleLike(item.id)} aria-label={likedIds.has(item.id) ? 'Remove preferred shop' : 'Prefer this shop'}
                          style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--sn-page)', border: '1px solid var(--sn-border)', borderRadius: 999, padding: '6px 10px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700, color: likedIds.has(item.id) ? '#EF4444' : 'var(--sn-muted)', flexShrink: 0 }}>
                          <Heart size={12} fill={likedIds.has(item.id) ? 'currentColor' : 'none'} />
                          {item.likeCount ? item.likeCount.toLocaleString() : ''}
                        </button>
                      )}
                      {item.price !== undefined && <span style={{ color: 'var(--sn-primary)', fontWeight: 800, fontSize: '0.76rem', whiteSpace: 'nowrap' }}>{fmt(item.price)}</span>}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )
        })}
      </div>
    </main>
  )
}

function ProductResultCard({ item }: { item: MarketplaceSearchResult }) {
  return (
    <Link href={item.href} className="sn-card" style={{ textDecoration: 'none', overflow: 'hidden' }}>
      <div style={{ position: 'relative', height: 110, background: 'var(--sn-page)' }}>
        {item.imageUrl ? <Image src={item.imageUrl} alt={item.title} fill sizes="(max-width: 640px) 45vw, 180px" style={{ objectFit: 'cover' }} /> : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}><ShoppingBag size={24} color="var(--sn-subtle)" /></div>}
      </div>
      <div style={{ padding: 10 }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--sn-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
        {item.price !== undefined && <div style={{ fontSize: '0.82rem', fontWeight: 900, color: 'var(--sn-primary)', marginTop: 2 }}>{fmt(item.price)}</div>}
        <div style={{ fontSize: '0.68rem', color: 'var(--sn-subtle)', marginTop: 2 }}>{item.subtitle}</div>
      </div>
    </Link>
  )
}

export default function SearchPage() {
  return <Suspense fallback={null}><SearchPageInner /></Suspense>
}
