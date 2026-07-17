'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { T } from './T'
import { useLang } from '@/lib/lang-context'
import { sb } from '@/lib/supabase'

type ShopResult = {
  id: string
  shop_name: string
  shop_city?: string
  source: 'business' | 'campus'
}

const NAV_ICONS = [
  { href: '/home',        icon: 'ti-home-2',        label: 'Home'        },
  { href: '/market',      icon: 'ti-building-store', label: 'Business'    },
  { href: '/campus',      icon: 'ti-school',         label: 'Campus'      },
  { href: '/vybe',        icon: 'ti-chart-bubble',   label: 'Social Vybe' },
  { href: '/flash-deals', icon: 'ti-bolt',           label: 'Flash Deals' },
  { href: '/group-buy',   icon: 'ti-users-group',    label: 'Group Buy'   },
  { href: '/move',        icon: 'ti-truck',          label: 'Move'        },
]

export function SiteNav() {
  const pathname  = usePathname()
  const router    = useRouter()
  const { lang, setLang } = useLang()

  const [query,   setQuery]   = useState('')
  const [results, setResults] = useState<ShopResult[]>([])
  const [searching, setSearching] = useState(false)
  const [showDrop, setShowDrop] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const searchRef = useRef<HTMLDivElement>(null)
  const menuRef   = useRef<HTMLDivElement>(null)
  const debounce  = useRef<NodeJS.Timeout>()

  // ── Close dropdowns on outside click ─────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDrop(false)
      }
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // ── Search handler ────────────────────────────────────────
  const handleSearch = useCallback((val: string) => {
    setQuery(val)
    clearTimeout(debounce.current)
    if (!val.trim()) { setResults([]); setShowDrop(false); return }

    debounce.current = setTimeout(async () => {
      setSearching(true)
      const q = val.toLowerCase()
      const [{ data: biz }, { data: campus }] = await Promise.all([
        sb.from('pending_payments')
          .select('id,shop_name,shop_city')
          .ilike('shop_name', `%${q}%`)
          .eq('status','approved')
          .limit(5),
        sb.from('campus_stores')
          .select('id,shop_name,university_abbr')
          .ilike('shop_name', `%${q}%`)
          .eq('is_active', true)
          .limit(4),
      ])
      const combined: ShopResult[] = [
        ...(biz    || []).map((s: any) => ({ id: s.id, shop_name: s.shop_name, shop_city: s.shop_city, source: 'business' as const })),
        ...(campus || []).map((s: any) => ({ id: s.id, shop_name: s.shop_name, shop_city: s.university_abbr, source: 'campus' as const })),
      ]
      setResults(combined)
      setShowDrop(true)
      setSearching(false)
    }, 300)
  }, [])

  const goToShop = (id: string) => {
    setShowDrop(false)
    setQuery('')
    router.push(`/store/${id}`)
  }

  const isActive = (href: string) =>
    href === '/home' ? pathname === '/' || pathname === '/home' : pathname.startsWith(href)

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 200,
      background: '#fff',
      borderBottom: '1px solid #E2E8F0',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    }}>

      {/* ── ROW 1: Logo | Search | Menu ─────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: '10px 5%', gap: '16px',
      }}>

        {/* Brand */}
        <Link href="/home" style={{ display:'flex', alignItems:'center', gap:'8px', textDecoration:'none', flexShrink:0 }}>
          <img src="/icon-192.png" alt="Travex" style={{ width:'34px', height:'34px', borderRadius:'50%', objectFit:'cover' }}/>
          <span style={{
            fontFamily:"'Space Grotesk',sans-serif",
            fontSize:'1.12rem', fontWeight:700,
            color:'#0D1B3E', letterSpacing:'-0.03em',
          }}>
            travex <span style={{ color:'#C9A84C' }}>mall</span>
          </span>
        </Link>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Search bar */}
        <div ref={searchRef} style={{ position:'relative', width:'min(420px,45%)' }}>
          <div style={{ position:'relative' }}>
            <i className="ti ti-search" style={{
              position:'absolute', left:'12px', top:'50%',
              transform:'translateY(-50%)', color:'#94A3B8', fontSize:'15px',
            }}/>
            {searching && (
              <i className="ti ti-loader-2" style={{
                position:'absolute', right:'12px', top:'50%',
                transform:'translateY(-50%)', color:'#94A3B8', fontSize:'14px',
                animation:'spin .8s linear infinite',
              }}/>
            )}
            <input
              type="text"
              value={query}
              onChange={e => handleSearch(e.target.value)}
              onFocus={() => { if (results.length) setShowDrop(true) }}
              placeholder="Search shops, products..."
              style={{
                width:'100%', boxSizing:'border-box' as const,
                padding:'9px 36px 9px 36px',
                background:'#F1F5F9', border:'1.5px solid transparent',
                borderRadius:'999px', fontSize:'0.84rem',
                color:'#0F172A', outline:'none',
                fontFamily:"'Inter',sans-serif",
                transition:'all 0.2s',
              }}
              onMouseOver={e=>(e.currentTarget.style.background='#E8EDF4')}
              onMouseOut={e=>{if(document.activeElement!==e.currentTarget)e.currentTarget.style.background='#F1F5F9'}}
              onFocus={e=>{e.currentTarget.style.background='#fff';e.currentTarget.style.borderColor='#0D1B3E'}}
              onBlur={e=>{e.currentTarget.style.background='#F1F5F9';e.currentTarget.style.borderColor='transparent'}}
            />
          </div>

          {/* Search results dropdown */}
          {showDrop && results.length > 0 && (
            <div style={{
              position:'absolute', top:'calc(100% + 6px)', left:0, right:0,
              background:'#fff', borderRadius:'14px',
              boxShadow:'0 8px 32px rgba(0,0,0,0.14)',
              border:'1px solid #E2E8F0', overflow:'hidden', zIndex:300,
            }}>
              {results.map(r => (
                <div key={r.id} onClick={() => goToShop(r.id)} style={{
                  display:'flex', alignItems:'center', gap:'10px',
                  padding:'10px 16px', cursor:'pointer',
                  transition:'background 0.15s',
                }}
                onMouseOver={e=>(e.currentTarget.style.background='#F8FAFF')}
                onMouseOut={e=>(e.currentTarget.style.background='transparent')}>
                  <div style={{
                    width:'32px', height:'32px', borderRadius:'8px',
                    background: r.source==='business'?'rgba(201,168,76,0.12)':'rgba(59,130,246,0.10)',
                    display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                  }}>
                    <i className={r.source==='business'?'ti ti-building-store':'ti ti-school'}
                      style={{ fontSize:'16px', color:r.source==='business'?'#C9A84C':'#3B82F6' }}/>
                  </div>
                  <div>
                    <div style={{ fontSize:'13px', fontWeight:600, color:'#0F172A' }}>{r.shop_name}</div>
                    <div style={{ fontSize:'11px', color:'#94A3B8' }}>
                      {r.source==='business'?'Business Market':'Campus Market'} {r.shop_city?`· ${r.shop_city}`:''}
                    </div>
                  </div>
                  <i className="ti ti-arrow-right" style={{ marginLeft:'auto', color:'#CBD5E1', fontSize:'14px' }}/>
                </div>
              ))}
              <div style={{ padding:'8px 16px 10px', borderTop:'1px solid #F1F5F9' }}>
                <Link href={`/market?search=${encodeURIComponent(query)}`}
                  onClick={() => setShowDrop(false)}
                  style={{ fontSize:'12px', color:'#0D1B3E', fontWeight:600, textDecoration:'none' }}>
                  View all results for "{query}" →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Menu button */}
        <div ref={menuRef} style={{ position:'relative', flexShrink:0 }}>
          <button onClick={() => setMenuOpen(v => !v)} style={{
            width:'38px', height:'38px', borderRadius:'50%',
            background: menuOpen?'#0D1B3E':'#F1F5F9',
            border:'none', cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
            transition:'all 0.2s',
          }}>
            <i className="ti ti-menu-2" style={{ fontSize:'18px', color: menuOpen?'#C9A84C':'#475569' }}/>
          </button>

          {/* Menu dropdown */}
          {menuOpen && (
            <div style={{
              position:'absolute', top:'calc(100% + 8px)', right:0,
              background:'#fff', borderRadius:'16px',
              boxShadow:'0 8px 32px rgba(0,0,0,0.14)',
              border:'1px solid #E2E8F0',
              minWidth:'200px', overflow:'hidden', zIndex:300,
            }}>
              {/* Login */}
              <Link href="/login" onClick={() => setMenuOpen(false)} style={{
                display:'flex', alignItems:'center', gap:'10px',
                padding:'12px 16px', textDecoration:'none',
                color:'#0F172A', transition:'background 0.15s',
              }}
              onMouseOver={e=>(e.currentTarget.style.background='#F8FAFF')}
              onMouseOut={e=>(e.currentTarget.style.background='transparent')}>
                <i className="ti ti-lock" style={{ fontSize:'18px', color:'#0D1B3E' }}/>
                <span style={{ fontSize:'13px', fontWeight:600 }}><T en="Log In" sw="Ingia" /></span>
              </Link>

              {/* Open Shop */}
              <Link href="/open-store" onClick={() => setMenuOpen(false)} style={{
                display:'flex', alignItems:'center', gap:'10px',
                padding:'12px 16px', textDecoration:'none',
                color:'#0F172A', transition:'background 0.15s',
              }}
              onMouseOver={e=>(e.currentTarget.style.background='#F8FAFF')}
              onMouseOut={e=>(e.currentTarget.style.background='transparent')}>
                <i className="ti ti-store" style={{ fontSize:'18px', color:'#C9A84C' }}/>
                <span style={{ fontSize:'13px', fontWeight:600 }}><T en="Open Your Shop" sw="Fungua Duka Lako" /></span>
              </Link>

              <div style={{ height:'1px', background:'#F1F5F9', margin:'4px 0' }}/>

              {/* Language switcher */}
              <div style={{ padding:'8px 16px 12px' }}>
                <div style={{ fontSize:'11px', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'8px' }}>
                  <T en="Language" sw="Lugha" />
                </div>
                <div style={{ display:'flex', gap:'6px' }}>
                  {(['en','sw'] as const).map(code => (
                    <button key={code} onClick={() => { setLang(code); setMenuOpen(false) }} style={{
                      flex:1, padding:'7px 8px',
                      background: lang===code?'#0D1B3E':'#F1F5F9',
                      color: lang===code?'#fff':'#475569',
                      border:'none', borderRadius:'8px',
                      fontSize:'12px', fontWeight:700,
                      cursor:'pointer', fontFamily:"'Inter',sans-serif",
                      transition:'all 0.2s',
                    }}>
                      {code==='en'?'🇬🇧 English':'🇹🇿 Kiswahili'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── ROW 2: Icon Nav ─────────────────────────────── */}
      <div style={{
        display:'flex', alignItems:'stretch',
        borderTop:'1px solid #F1F5F9',
        padding:'0 5%',
      }}>
        {NAV_ICONS.map(item => (
          <Link key={item.href} href={item.href} title={item.label} style={{
            flex:1, display:'flex', alignItems:'center', justifyContent:'center',
            padding:'10px 0',
            borderBottom: isActive(item.href)?'3px solid #C9A84C':'3px solid transparent',
            textDecoration:'none',
            transition:'all 0.15s',
            minWidth:0,
          }}
          onMouseOver={e=>{(e.currentTarget as HTMLElement).style.background='#F8FAFF'}}
          onMouseOut={e=>{(e.currentTarget as HTMLElement).style.background='transparent'}}>
            <i className={`ti ${item.icon}`} style={{
              fontSize:'22px',
              color: isActive(item.href)?'#C9A84C':'#94A3B8',
              transition:'color 0.15s',
            }}/>
          </Link>
        ))}
      </div>

      <style>{`@keyframes spin{to{transform:translateY(-50%) rotate(360deg)}}`}</style>
    </header>
  )
}
