'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Home, Store, GraduationCap, MessageCircle, Zap,
  Users, Truck, Search, Menu, Lock, ShoppingBag, Globe, X, ArrowRight, Loader2
} from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { useLang } from '@/lib/lang-context'
import { sb } from '@/lib/supabase'

type ShopResult = {
  id: string
  shop_name: string
  shop_city?: string
  source: 'business' | 'campus'
}

const NAV_ICON_DATA = [
  { href: '/home',        Icon: Home,          labelKey: 'nav.homeLabel'       },
  { href: '/market',      Icon: Store,         labelKey: 'nav.businessLabel'   },
  { href: '/campus',      Icon: GraduationCap, labelKey: 'nav.campusLabel'     },
  { href: '/vybe',        Icon: MessageCircle, labelKey: 'nav.vybeLabel'       },
  { href: '/flash-deals', Icon: Zap,           labelKey: 'nav.flashDealsLabel' },
  { href: '/group-buy',   Icon: Users,         labelKey: 'nav.groupBuyLabel'   },
  { href: '/move',        Icon: Truck,         labelKey: 'nav.moveLabel'       },
]

export function SiteNav() {
  const { t } = useTranslation()
  const pathname = usePathname()
  const router   = useRouter()
  const { lang, setLang } = useLang()

  const [query,     setQuery]     = useState('')
  const [results,   setResults]   = useState<ShopResult[]>([])
  const [searching, setSearching] = useState(false)
  const [showDrop,  setShowDrop]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)
  const [user, setUser] = useState<{email:string, name:string} | null>(null)
  useEffect(() => {
    sb.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const m = session.user.user_metadata
        setUser({ email: session.user.email || '', name: m?.display_name || m?.username || session.user.email?.split('@')[0] || 'User' })
      }
    })
    const { data: { subscription } } = sb.auth.onAuthStateChange((_evt, session) => {
      if (session?.user) {
        const m = session.user.user_metadata
        setUser({ email: session.user.email || '', name: m?.display_name || m?.username || 'User' })
      } else { setUser(null) }
    })
    return () => subscription.unsubscribe()
  }, [])


  const searchRef = useRef<HTMLDivElement>(null)
  const menuRef   = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()

  // Close on outside click
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDrop(false)
      }
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  // Search
  const handleSearch = useCallback((val: string) => {
    setQuery(val)
    clearTimeout(debounceRef.current)
    if (!val.trim()) { setResults([]); setShowDrop(false); return }

    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const [{ data: biz }, { data: campus }] = await Promise.all([
          sb.from('pending_payments')
            .select('id,shop_name,shop_city')
            .ilike('shop_name', `%${val}%`)
            .eq('status', 'approved')
            .limit(5),
          sb.from('campus_stores')
            .select('id,shop_name,university_abbr')
            .ilike('shop_name', `%${val}%`)
            .eq('is_active', true)
            .limit(4),
        ])
        const combined: ShopResult[] = [
          ...(biz    || []).map((s: any) => ({ id: s.id, shop_name: s.shop_name, shop_city: s.shop_city, source: 'business' as const })),
          ...(campus || []).map((s: any) => ({ id: s.id, shop_name: s.shop_name, shop_city: s.university_abbr, source: 'campus' as const })),
        ]
        setResults(combined)
        setShowDrop(true)
      } catch {}
      setSearching(false)
    }, 300)
  }, [])

  const goToShop = (id: string) => {
    setShowDrop(false); setQuery('')
    router.push(`/store/${id}`)
  }

  const isActive = (href: string) =>
    href === '/home'
      ? pathname === '/' || pathname === '/home'
      : pathname.startsWith(href)

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 999,
      background: '#fff',
      borderBottom: '1px solid #E2E8F0',
      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      fontFamily: "'Inter', sans-serif",
    }}>

      {/* ── ROW 1: Brand | [spacer] | Search | Menu ── */}
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: '10px 5%', gap: '14px',
      }}>

        {/* Brand */}
        <Link href="/home" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flexShrink: 0 }}>
          <img
            src="/icon-192.png" alt="ShopNekt"
            style={{ height: '52px', width: '52px', objectFit: 'contain', borderRadius: '12px' }}
          />
          <span style={{
            fontFamily: "'Inter',sans-serif",
            fontSize: '1.35rem', fontWeight: 900,
            color: '#0D1B3E', letterSpacing: '-0.04em',
            lineHeight: 1,
          }}>
            Shop<span style={{ color: '#F97316' }}>Nekt</span>
          </span>
        </Link>

        {/* Push search + menu to right */}
        <div style={{ flex: 1 }} />

        {/* Search bar */}
        <div ref={searchRef} style={{ position: 'relative', width: 'clamp(180px, 38%, 420px)' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            {searching
              ? <Loader2 size={15} style={{ position: 'absolute', left: 11, color: '#94A3B8', animation: 'spin .8s linear infinite' }} />
              : <Search size={15} style={{ position: 'absolute', left: 11, color: '#94A3B8' }} />
            }
            <input
              type="text"
              value={query}
              onChange={e => handleSearch(e.target.value)}
              onFocus={() => results.length && setShowDrop(true)}
              placeholder="Search shops..."
              style={{
                width: '100%', boxSizing: 'border-box' as const,
                padding: '8px 14px 8px 34px',
                background: '#F1F5F9',
                border: '1.5px solid transparent',
                borderRadius: '999px', fontSize: '0.83rem',
                color: '#0F172A', outline: 'none',
                fontFamily: "'Inter', sans-serif",
                transition: 'all 0.2s',
              }}
              onFocus={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#0D1B3E' }}
              onBlur={e => { if (!showDrop) { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.borderColor = 'transparent' } }}
            />
          </div>

          {/* Dropdown results */}
          {showDrop && results.length > 0 && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
              background: '#fff', borderRadius: '14px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
              border: '1px solid #E2E8F0', overflow: 'hidden', zIndex: 400,
            }}>
              {results.map(r => (
                <div
                  key={r.id}
                  onClick={() => goToShop(r.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', cursor: 'pointer', transition: 'background .15s' }}
                  onMouseOver={e => (e.currentTarget.style.background = '#F8FAFF')}
                  onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{
                    width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0,
                    background: r.source === 'business' ? 'rgba(201,168,76,0.12)' : 'rgba(59,130,246,0.10)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {r.source === 'business'
                      ? <Store size={14} color="#C9A84C" />
                      : <GraduationCap size={14} color="#3B82F6" />
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.shop_name}</div>
                    <div style={{ fontSize: '10px', color: '#94A3B8' }}>
                      {r.source === 'business' ? t('nav.businessMarket') : t('nav.campusMarket')}{r.shop_city ? ` · ${r.shop_city}` : ''}
                    </div>
                  </div>
                  <ArrowRight size={13} color="#CBD5E1" />
                </div>
              ))}
              <div style={{ padding: '8px 14px 10px', borderTop: '1px solid #F1F5F9' }}>
                <Link
                  href={`/market?search=${encodeURIComponent(query)}`}
                  onClick={() => setShowDrop(false)}
                  style={{ fontSize: '12px', color: '#0D1B3E', fontWeight: 600, textDecoration: 'none' }}
                >
                  {t('nav.searchAll')} "{query}" →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Menu button */}
        <div ref={menuRef} style={{ position: 'relative', flexShrink: 0 }}>
          <button
            onClick={() => setMenuOpen(v => !v)}
            style={{
              width: '38px', height: '38px', borderRadius: '50%',
              background: menuOpen ? '#0D1B3E' : '#F1F5F9',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
            }}
          >
            {menuOpen
              ? <X size={18} color="#C9A84C" />
              : <Menu size={18} color="#475569" />
            }
          </button>

          {/* ── Dropdown Menu ── */}
          {menuOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              background: '#fff', borderRadius: '18px',
              boxShadow: '0 12px 40px rgba(0,0,0,0.16)',
              border: '1px solid #E2E8F0', minWidth: '230px',
              overflow: 'hidden', zIndex: 400,
            }}>

              {/* ── Profile section ── */}
              <div style={{ padding: '14px 16px 12px', background: 'linear-gradient(135deg,#0D1B3E,#1B3A8A)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#F97316', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '2px solid rgba(255,255,255,0.2)' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff' }}>
                    {user ? user.name.slice(0,2).toUpperCase() : '?'}
                  </span>
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user ? user.name : 'Guest'}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.45)', whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user ? user.email : 'Not signed in'}
                  </div>
                </div>
              </div>

              {/* ── Menu items ── */}
              {[
                { icon: '🏪', label: t('nav.openYourShop'),    href: '/open-store',                 color: '#C9A84C' },
                { icon: '📊', label: t('nav.loginDashboard'),  href: '/dashboard/login.html',        color: '#3B82F6' },
              ].map((item, i) => (
                <a key={i} href={item.href}
                  onClick={() => setMenuOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 16px', textDecoration: 'none', color: '#0F172A', transition: 'background .15s', cursor: 'pointer' }}
                  onMouseOver={e => (e.currentTarget as HTMLElement).style.background = '#F8FAFF'}
                  onMouseOut={e  => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                  <span style={{ fontSize: '0.95rem' }}>{item.icon}</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0F172A' }}>{item.label}</span>
                </a>
              ))}

              <div style={{ height: '1px', background: '#F1F5F9', margin: '2px 0' }} />

              {/* ── Language ── */}
              <div style={{ padding: '10px 16px' }}>
                <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: '7px', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Globe size={10} /> {t('nav.language')}
                </div>
                <div style={{ display: 'flex', gap: '5px' }}>
                  {(['en','sw'] as const).map(code => (
                    <button key={code} onClick={() => { setLang(code); setMenuOpen(false) }}
                      style={{ flex:1, padding:'6px', background: lang===code ? '#0D1B3E' : '#F1F5F9', color: lang===code ? '#C9A84C' : '#64748B', border:'none', borderRadius:'8px', fontSize:'0.7rem', fontWeight:700, cursor:'pointer', fontFamily:"'Inter',sans-serif", transition:'all 0.2s' }}>
                      {code === 'en' ? '🇬🇧 EN' : '🇹🇿 SW'}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ height: '1px', background: '#F1F5F9', margin: '2px 0' }} />

              {/* ── Settings + Privacy ── */}
              {[
                { icon: '⚙️', label: 'Settings',       href: '/settings' },
                { icon: '🔒', label: 'Privacy Policy',  href: '/privacy'  },
              ].map((item, i) => (
                <a key={i} href={item.href}
                  onClick={() => setMenuOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', textDecoration: 'none', color: '#0F172A', transition: 'background .15s' }}
                  onMouseOver={e => (e.currentTarget as HTMLElement).style.background = '#F8FAFF'}
                  onMouseOut={e  => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                  <span style={{ fontSize: '0.9rem' }}>{item.icon}</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748B' }}>{item.label}</span>
                </a>
              ))}

              <div style={{ height: '1px', background: '#F1F5F9', margin: '2px 0' }} />

              {/* ── Sign In / Log Out ── */}
              {user ? (
                <button
                  onClick={async () => { await sb.auth.signOut(); setUser(null); setMenuOpen(false); router.push('/auth') }}
                  style={{ width:'100%', display:'flex', alignItems:'center', gap:'12px', padding:'11px 16px', background:'none', border:'none', cursor:'pointer', fontFamily:"'Inter',sans-serif", transition:'background .15s', textAlign:'left' as const }}
                  onMouseOver={e => (e.currentTarget as HTMLElement).style.background = '#FFF1F2'}
                  onMouseOut={e  => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                  <span style={{ fontSize: '0.9rem' }}>🚪</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#EF4444' }}>Log Out</span>
                </button>
              ) : (
                <a href="/auth"
                  onClick={() => setMenuOpen(false)}
                  style={{ display:'flex', alignItems:'center', gap:'12px', padding:'11px 16px', textDecoration:'none', transition:'background .15s' }}
                  onMouseOver={e => (e.currentTarget as HTMLElement).style.background = '#F0FDF4'}
                  onMouseOut={e  => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                  <span style={{ fontSize: '0.9rem' }}>👤</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#059669' }}>Sign In</span>
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── ROW 2: Icon Nav ─── */}
      <div style={{
        display: 'flex', alignItems: 'stretch',
        borderTop: '1px solid #F1F5F9',
        padding: '0 5%',
      }}>
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
              <Icon
                size={22}
                color={active ? '#0D1B3E' : '#94A3B8'}
                strokeWidth={active ? 2.2 : 1.8}
              />
            </Link>
          )
        })}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </header>
  )
}
