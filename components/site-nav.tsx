'use client'
import { LangSwitcher } from "@/components/lang-switcher"
import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Home, Store, GraduationCap, MessageCircle, Zap,
  Users, Truck, Search, Menu, Loader2, MessageSquare
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
  { href: '/vybe',        Icon: MessageCircle, labelKey: 'nav.vybeLabel'       },
  { href: '/market',      Icon: Store,         labelKey: 'nav.businessLabel'   },
  { href: '/campus',      Icon: GraduationCap, labelKey: 'nav.campusLabel'     },
  { href: '/flash-deals', Icon: Zap,           labelKey: 'nav.flashDealsLabel' },
  { href: '/group-buy',   Icon: Users,         labelKey: 'nav.groupBuyLabel'   },
  { href: '/messages',    Icon: MessageSquare, labelKey: 'nav.messagesLabel'   },
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
  const debounceRef = useRef<NodeJS.Timeout>()

  // Close on outside click
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDrop(false)
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

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Search icon — circle button */}
        <button
          onClick={() => { const el = document.getElementById('nav-search-input'); el ? (el as HTMLInputElement).focus() : null }}
          style={{ width: 38, height: 38, borderRadius: '50%', background: '#F1F5F9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.2s' }}
          onMouseOver={e => (e.currentTarget as HTMLElement).style.background='#E2E8F0'}
          onMouseOut={e  => (e.currentTarget as HTMLElement).style.background='#F1F5F9'}>
          {searching
            ? <Loader2 size={16} color="#64748B" style={{ animation: 'spin .8s linear infinite' }} />
            : <Search size={16} color="#475569" />}
        </button>

        {/* Move / Truck icon */}
        <Link href="/move"
          style={{ width: 38, height: 38, borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, textDecoration: 'none', transition: 'background 0.2s' }}
          onMouseOver={e => (e.currentTarget as HTMLElement).style.background='#E2E8F0'}
          onMouseOut={e  => (e.currentTarget as HTMLElement).style.background='#F1F5F9'}>
          <Truck size={16} color="#475569" />
        </Link>

        {/* Language Switcher */}
        <LangSwitcher compact />

        {/* Menu button — direct navigation to /menu */}
        <button onClick={() => { window.location.href = '/menu' }}
          style={{ width:38, height:38, borderRadius:'50%', background:'#F1F5F9', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, border:'none', cursor:'pointer', transition:'background .2s' }}
          onMouseOver={e => (e.currentTarget as HTMLElement).style.background='#E2E8F0'}
          onMouseOut={e  => (e.currentTarget as HTMLElement).style.background='#F1F5F9'}>
          <Menu size={18} color="#475569" />
        </button>
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

      <style>{`@keyframes spin { to { transform: rotate(360deg) } } @keyframes slideIn { from { transform: translateX(100%) } to { transform: translateX(0) } } @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }`}</style>
    </header>
  )
}
