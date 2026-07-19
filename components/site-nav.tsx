'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Home, Store, GraduationCap, MessageCircle, Zap,
  Users, Truck, Search, Menu, Lock, ShoppingBag, Globe, X, ArrowRight, Loader2, MessageSquare
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

          {/* ── Full Page Menu ── */}
          {menuOpen && (
            <>
              {/* Backdrop */}
              <div onClick={() => setMenuOpen(false)}
                style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:490, backdropFilter:'blur(2px)', animation:'fadeIn .2s ease' }} />

              {/* Full page drawer from right */}
              <div style={{
                position: 'fixed', top:0, right:0, bottom:0,
                width: 'min(320px, 88vw)',
                background: '#fff', zIndex:500,
                display: 'flex', flexDirection:'column',
                boxShadow: '-8px 0 40px rgba(0,0,0,0.18)',
                animation: 'slideIn .25s cubic-bezier(0.34,1.1,0.64,1)',
                overflowY: 'auto',
              }}>

                {/* ── Header ── */}
                <div style={{ background:'linear-gradient(135deg,#0D1B3E,#1B3A8A)', padding:'48px 20px 20px', flexShrink:0 }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                      <div style={{ width:52, height:52, borderRadius:'50%', background:'#F97316', display:'flex', alignItems:'center', justifyContent:'center', border:'2.5px solid rgba(255,255,255,0.25)', fontSize:'1.1rem', fontWeight:900, color:'#fff', flexShrink:0 }}>
                        {user ? user.name.slice(0,2).toUpperCase() : '?'}
                      </div>
                      <div style={{ minWidth:0 }}>
                        <div style={{ fontSize:'1rem', fontWeight:800, color:'#fff', letterSpacing:'-0.01em' }}>{user ? user.name : 'Guest'}</div>
                        <div style={{ fontSize:'0.7rem', color:'rgba(255,255,255,0.45)', marginTop:2 }}>{user ? user.email : 'Not signed in'}</div>
                      </div>
                    </div>
                    <button onClick={() => setMenuOpen(false)}
                      style={{ background:'rgba(255,255,255,0.1)', border:'none', borderRadius:'50%', width:34, height:34, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
                      <X size={16} color="#fff" />
                    </button>
                  </div>
                  <a href="/settings/profile" onClick={() => setMenuOpen(false)}
                    style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:999, padding:'5px 14px', textDecoration:'none', fontSize:'0.72rem', fontWeight:600, color:'rgba(255,255,255,0.8)' }}>
                    Edit Profile →
                  </a>
                </div>

                {/* ── Menu body ── */}
                <div style={{ flex:1, padding:'8px 0' }}>

                  {/* Main actions */}
                  <div style={{ padding:'6px 12px' }}>
                    <p style={{ fontSize:'0.6rem', fontWeight:700, color:'#94A3B8', textTransform:'uppercase' as const, letterSpacing:'0.09em', padding:'8px 8px 4px' }}>Store</p>
                    {[
                      { icon:'🏪', label:'Open Shop',            href:'/open-store',           bold:true  },
                      { icon:'📊', label:'Seller Dashboard',     href:'/dashboard/login.html', bold:false },
                    ].map((item,i) => (
                      <a key={i} href={item.href} onClick={() => setMenuOpen(false)}
                        style={{ display:'flex', alignItems:'center', gap:14, padding:'13px 12px', borderRadius:14, textDecoration:'none', color:'#0F172A', transition:'background .15s', marginBottom:2 }}
                        onMouseOver={e => (e.currentTarget as HTMLElement).style.background='#F8FAFF'}
                        onMouseOut={e  => (e.currentTarget as HTMLElement).style.background='transparent'}>
                        <span style={{ fontSize:'1.15rem', width:32, textAlign:'center' as const }}>{item.icon}</span>
                        <span style={{ fontSize:'0.9rem', fontWeight: item.bold ? 700 : 600, color:'#0F172A' }}>{item.label}</span>
                      </a>
                    ))}
                  </div>

                  <div style={{ height:1, background:'#F1F5F9', margin:'4px 12px' }} />

                  {/* Shopping */}
                  <div style={{ padding:'6px 12px' }}>
                    <p style={{ fontSize:'0.6rem', fontWeight:700, color:'#94A3B8', textTransform:'uppercase' as const, letterSpacing:'0.09em', padding:'8px 8px 4px' }}>Shopping</p>
                    {[
                      { icon:'🛒', label:'Shopping Preferences', href:'/settings/shopping' },
                      { icon:'💬', label:'Messages',             href:'/messages'          },
                    ].map((item,i) => (
                      <a key={i} href={item.href} onClick={() => setMenuOpen(false)}
                        style={{ display:'flex', alignItems:'center', gap:14, padding:'13px 12px', borderRadius:14, textDecoration:'none', color:'#0F172A', transition:'background .15s', marginBottom:2 }}
                        onMouseOver={e => (e.currentTarget as HTMLElement).style.background='#F8FAFF'}
                        onMouseOut={e  => (e.currentTarget as HTMLElement).style.background='transparent'}>
                        <span style={{ fontSize:'1.15rem', width:32, textAlign:'center' as const }}>{item.icon}</span>
                        <span style={{ fontSize:'0.9rem', fontWeight:600, color:'#0F172A' }}>{item.label}</span>
                      </a>
                    ))}
                  </div>

                  <div style={{ height:1, background:'#F1F5F9', margin:'4px 12px' }} />

                  {/* Language */}
                  <div style={{ padding:'14px 20px' }}>
                    <p style={{ fontSize:'0.6rem', fontWeight:700, color:'#94A3B8', textTransform:'uppercase' as const, letterSpacing:'0.09em', marginBottom:8 }}>Language</p>
                    <div style={{ display:'flex', gap:8 }}>
                      {(['en','sw'] as const).map(code => (
                        <button key={code} onClick={() => { setLang(code); setMenuOpen(false) }}
                          style={{ flex:1, padding:'10px 8px', background: lang===code ? '#0D1B3E' : '#F1F5F9', color: lang===code ? '#C9A84C' : '#64748B', border:'none', borderRadius:12, fontSize:'0.8rem', fontWeight:700, cursor:'pointer', fontFamily:"'Inter',sans-serif", transition:'all 0.2s' }}>
                          {code === 'en' ? '🇬🇧 English' : '🇹🇿 Kiswahili'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ height:1, background:'#F1F5F9', margin:'4px 12px' }} />

                  {/* Settings & Legal */}
                  <div style={{ padding:'6px 12px' }}>
                    <p style={{ fontSize:'0.6rem', fontWeight:700, color:'#94A3B8', textTransform:'uppercase' as const, letterSpacing:'0.09em', padding:'8px 8px 4px' }}>Account</p>
                    {[
                      { icon:'⚙️', label:'Settings',      href:'/settings' },
                      { icon:'🔒', label:'Privacy Policy', href:'/privacy'  },
                      { icon:'ℹ️', label:'About ShopNekt', href:'/settings/about' },
                    ].map((item,i) => (
                      <a key={i} href={item.href} onClick={() => setMenuOpen(false)}
                        style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 12px', borderRadius:14, textDecoration:'none', color:'#0F172A', transition:'background .15s', marginBottom:2 }}
                        onMouseOver={e => (e.currentTarget as HTMLElement).style.background='#F8FAFF'}
                        onMouseOut={e  => (e.currentTarget as HTMLElement).style.background='transparent'}>
                        <span style={{ fontSize:'1.1rem', width:32, textAlign:'center' as const }}>{item.icon}</span>
                        <span style={{ fontSize:'0.875rem', fontWeight:600, color:'#475569' }}>{item.label}</span>
                      </a>
                    ))}
                  </div>
                </div>

                {/* ── Footer — Log Out ── */}
                <div style={{ padding:'12px 20px 28px', borderTop:'1px solid #F1F5F9', flexShrink:0 }}>
                  {user ? (
                    <button onClick={async () => { await sb.auth.signOut(); setUser(null); setMenuOpen(false); router.push('/auth') }}
                      style={{ width:'100%', display:'flex', alignItems:'center', gap:14, padding:'13px 16px', background:'#FFF1F2', border:'1.5px solid #FEE2E2', borderRadius:14, cursor:'pointer', fontFamily:"'Inter',sans-serif", transition:'all .2s' }}
                      onMouseOver={e => (e.currentTarget as HTMLElement).style.background='#FFE4E6'}
                      onMouseOut={e  => (e.currentTarget as HTMLElement).style.background='#FFF1F2'}>
                      <span style={{ fontSize:'1.1rem', width:32, textAlign:'center' as const }}>🚪</span>
                      <span style={{ fontSize:'0.9rem', fontWeight:700, color:'#EF4444' }}>Log Out</span>
                    </button>
                  ) : (
                    <a href="/auth" onClick={() => setMenuOpen(false)}
                      style={{ display:'flex', alignItems:'center', gap:14, padding:'13px 16px', background:'#F0FDF4', border:'1.5px solid #BBF7D0', borderRadius:14, textDecoration:'none', transition:'all .2s' }}>
                      <span style={{ fontSize:'1.1rem', width:32, textAlign:'center' as const }}>👤</span>
                      <span style={{ fontSize:'0.9rem', fontWeight:700, color:'#059669' }}>Sign In</span>
                    </a>
                  )}
                </div>
              </div>
            </>
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

      <style>{`@keyframes spin { to { transform: rotate(360deg) } } @keyframes slideIn { from { transform: translateX(100%) } to { transform: translateX(0) } } @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }`}</style>
    </header>
  )
}
