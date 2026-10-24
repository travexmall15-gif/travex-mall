'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Home, Store, MessageCircle, Zap,
  Users, Truck, Search, Menu, Loader2, MessageSquare, X, ShoppingBag, Image as ImageIcon, BriefcaseBusiness
} from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { useLang } from '@/lib/lang-context'
import { sb } from '@/lib/supabase'
import { searchMarketplace, type MarketplaceSearchResult } from '@/lib/search'

const NAV_ICON_DATA = [
  { href: '/home',        Icon: Home,          labelKey: 'nav.homeLabel'       },
  { href: '/vybe',        Icon: MessageCircle, labelKey: 'nav.vybeLabel'       },
  { href: '/market',      Icon: Store,         labelKey: 'nav.businessLabel'   },
  { href: '/flash-deals', Icon: Zap,           labelKey: 'nav.flashDealsLabel' },
  { href: '/group-buy',   Icon: Users,         labelKey: 'nav.groupBuyLabel'   },
  { href: '/messages',    Icon: MessageSquare, labelKey: 'nav.messagesLabel'   },
]

export function SiteNav() {
  const { t } = useTranslation()
  const pathname = usePathname()
  const router   = useRouter()
  const { lang, setLang } = useLang()

  const [query,      setQuery]      = useState('')
  const [suggestions, setSuggestions] = useState<MarketplaceSearchResult[]>([])
  const [searching,  setSearching]  = useState(false)
  const [showDrop,   setShowDrop]   = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [user, setUser] = useState<{email:string, name:string} | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('travex_session')
      if (raw) {
        const sess = JSON.parse(raw)
        if (sess?.shop_name) {
          setUser({ email: sess.email || '', name: sess.shop_name || 'Seller' })
        }
      }
    } catch {}
    sb.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const m = session.user.user_metadata
        setUser({ email: session.user.email || '', name: m?.display_name || m?.username || session.user.email?.split('@')[0] || 'User' })
      }
    }).catch(() => {})
    const { data: { subscription } } = sb.auth.onAuthStateChange((_evt, session) => {
      if (session?.user) {
        const m = session.user.user_metadata
        setUser({ email: session.user.email || '', name: m?.display_name || m?.username || 'User' })
      } else { setUser(null) }
    })
    return () => subscription.unsubscribe()
  }, [])

  const searchRef   = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const searchRequestRef = useRef(0)

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDrop(false)
      }
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const handleSearch = useCallback((val: string) => {
    setQuery(val)
    if (debounceRef.current) {clearTimeout(debounceRef.current)}
    const requestId = ++searchRequestRef.current
    if (!val.trim()) { setSuggestions([]); setShowDrop(false); setSearching(false); return }
    setSuggestions([])
    setShowDrop(false)

    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const results = await searchMarketplace({ query: val, limit: 3 })
        if (requestId !== searchRequestRef.current) {return}
        setSuggestions(results.slice(0, 12))
        setShowDrop(true)
      } catch {
        if (requestId === searchRequestRef.current) {setShowDrop(false)}
      } finally {
        if (requestId === searchRequestRef.current) {setSearching(false)}
      }
    }, 300)
  }, [])

  const isActive = (href: string) =>
    href === '/home'
      ? pathname === '/' || pathname === '/home'
      : pathname.startsWith(href)

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 999,
      background: 'var(--sn-bg)',
      borderBottom: '1px solid #E2E8F0',
      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      fontFamily: 'var(--sn-font)',
    }}>

      {/* ROW 1: Brand | Search | Move | Menu */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '10px 5%', gap: '14px' }}>

        {/* Brand */}
        <Link href="/home" prefetch={true} aria-label="shopnekt home" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', flexShrink: 0 }}>
          <span style={{ fontFamily: 'var(--sn-font)', fontSize: '1.35rem', fontWeight: 900, color: '#0D1B3E', letterSpacing: '-0.04em', lineHeight: 1 }}>
            shopnekt
          </span>
        </Link>

        <div style={{ flex: 1 }} />

        {/* Search */}
        <div ref={searchRef} style={{ position:'relative', display:'flex', alignItems:'center', flex: searchOpen ? 1 : 'none', transition:'all .25s', maxWidth: searchOpen ? 360 : 38 }}>
          {searchOpen ? (
            <div style={{ display:'flex', alignItems:'center', width:'100%', background:'#F8FAFF', border:'1.5px solid #E2E8F0', borderRadius:999, padding:'0 12px', gap:8 }}>
              {searching
                ? <Loader2 size={15} color="#64748B" style={{ animation:'spin .8s linear infinite', flexShrink:0 }} />
                : <Search size={15} color="#94A3B8" style={{ flexShrink:0 }} />}
              <input
                id="nav-search-input"
                autoFocus
                value={query}
                onChange={e => handleSearch(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Escape') { setSearchOpen(false); setQuery(''); setShowDrop(false) }
                  if (e.key === 'Enter' && query.trim()) { router.push(`/search?q=${encodeURIComponent(query.trim())}`); setSearchOpen(false); setShowDrop(false) }
                }}
                placeholder={t('search.placeholder')}
                style={{ flex:1, border:'none', background:'transparent', fontSize:'0.875rem', color:'var(--sn-text)', outline:'none', padding:'8px 0', fontFamily:"'Inter',sans-serif" }}
              />
              {query && (
                <button onClick={() => { setQuery(''); setSuggestions([]); setShowDrop(false) }}
                  style={{ background:'none', border:'none', cursor:'pointer', padding:'2px', color:'var(--sn-subtle)', flexShrink:0 }}>
                  <X size={14} />
                </button>
              )}
              <button onClick={() => { setSearchOpen(false); setQuery(''); setShowDrop(false) }}
                style={{ background:'none', border:'none', cursor:'pointer', padding:'2px', color:'var(--sn-subtle)', flexShrink:0 }}>
                <X size={15} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              style={{ width:38, height:38, borderRadius:'50%', background:'var(--sn-bg)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'background .2s' }}
              onMouseOver={e => (e.currentTarget as HTMLElement).style.background='var(--sn-border)'}
              onMouseOut={e  => (e.currentTarget as HTMLElement).style.background='var(--sn-page)'}>
              <Search size={16} color="#475569" />
            </button>
          )}

          {/* Search dropdown — shops + products (Home Search: no Vybe/Flash Deals/Group Buy/AI/Orders) */}
          {showDrop && suggestions.length > 0 && (
            <div style={{ position:'absolute', top:'calc(100% + 8px)', left:0, right:0, background:'var(--sn-bg)', border:'1.5px solid var(--sn-border)', borderRadius:16, boxShadow:'0 8px 28px rgba(0,0,0,0.10)', zIndex:9999, overflow:'hidden', maxHeight: 420, overflowY: 'auto' }}>
              {suggestions.map(result => {
                const Icon = result.kind === 'store' ? Store
                  : result.kind === 'product' ? ShoppingBag
                    : result.kind === 'vybe' ? ImageIcon
                      : result.kind === 'flash_deal' ? Zap
                        : result.kind === 'service' ? BriefcaseBusiness : Users
                const typeLabel = result.kind === 'store' ? t('search.tabShops')
                  : result.kind === 'product' ? t('search.tabProducts')
                    : result.kind === 'flash_deal' ? 'Flash Deal'
                      : result.kind === 'group_buy' ? 'Group Buy'
                        : result.kind === 'service' ? 'Service' : 'Vybe'
                return <button key={`${result.kind}:${result.id}`} onClick={() => { setShowDrop(false); setSearchOpen(false); setQuery(''); router.push(result.href) }}
                  style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'11px 14px', border:'none', background:'none', cursor:'pointer', textAlign:'left', transition:'background .15s', fontFamily: 'var(--sn-font)' }}
                  onMouseOver={e => (e.currentTarget as HTMLElement).style.background='var(--sn-page)'}
                  onMouseOut={e  => (e.currentTarget as HTMLElement).style.background='transparent'}>
                  <div style={{ width:32, height:32, borderRadius:8, background:'var(--sn-page)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, overflow: 'hidden' }}>
                    {result.imageUrl ? <img src={result.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Icon size={14} color="var(--sn-primary)" />}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize:'0.82rem', fontWeight:600, color:'var(--sn-text)' }}>{result.title}</div>
                    <div style={{ fontSize:'0.68rem', color:'var(--sn-subtle)', marginTop:1 }}>{typeLabel} · {result.subtitle}</div>
                  </div>
                  {result.price !== undefined && <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--sn-primary)', flexShrink: 0 }}>TZS {result.price.toLocaleString()}</span>}
                </button>
              })}
              <div style={{ padding:'8px 14px', borderTop:'1px solid var(--sn-border)' }}>
                <button onClick={() => { router.push(`/search?q=${encodeURIComponent(query.trim())}`); setSearchOpen(false); setShowDrop(false) }}
                  style={{ width:'100%', background:'none', border:'none', cursor:'pointer', fontSize:'0.75rem', color:'var(--sn-text)', fontWeight:600, textAlign:'left', fontFamily: 'var(--sn-font)' }}>
                  {t('search.seeAllResultsFor')} "{query}" →
                </button>
              </div>
            </div>
          )}
          {showDrop && suggestions.length === 0 && query.trim() && !searching && (
            <div style={{ position:'absolute', top:'calc(100% + 8px)', left:0, right:0, background:'var(--sn-bg)', border:'1.5px solid var(--sn-border)', borderRadius:16, boxShadow:'0 8px 28px rgba(0,0,0,0.10)', zIndex:9999, padding:'1rem', textAlign:'center' }}>
              <div style={{ fontSize:'0.82rem', color:'var(--sn-subtle)' }}>{t('search.noResults')}</div>
            </div>
          )}
        </div>

        {/* Move */}
        <Link href="/move/index.html"
          style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--sn-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, textDecoration: 'none', transition: 'background 0.2s' }}
          onMouseOver={e => (e.currentTarget as HTMLElement).style.background='var(--sn-border)'}
          onMouseOut={e  => (e.currentTarget as HTMLElement).style.background='var(--sn-page)'}>
          <Truck size={16} color="#475569" />
        </Link>

        {/* Menu */}
        <button onClick={() => { window.location.href = '/menu' }}
          style={{ width:38, height:38, borderRadius:'50%', background:'var(--sn-bg)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, border:'none', cursor:'pointer', transition:'background .2s' }}
          onMouseOver={e => (e.currentTarget as HTMLElement).style.background='var(--sn-border)'}
          onMouseOut={e  => (e.currentTarget as HTMLElement).style.background='var(--sn-page)'}>
          <Menu size={18} color="#475569" />
        </button>
      </div>

      {/* ROW 2: Icon Nav */}
      <div style={{ display: 'flex', alignItems: 'stretch', borderTop: '1px solid #F1F5F9', padding: '0 5%' }}>
        {NAV_ICON_DATA.map(({ href, Icon, labelKey }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              title={t(labelKey)}
              style={{
                flex: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '11px 0',
                borderBottom: active ? '3px solid #0D1B3E' : '3px solid transparent',
                textDecoration: 'none',
                transition: 'all 0.15s',
              }}
              onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = '#F8FAFF' }}
              onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              <Icon size={22} color={active ? '#0D1B3E' : '#94A3B8'} strokeWidth={active ? 2.2 : 1.8} />
            </Link>
          )
        })}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </header>
  )
}
