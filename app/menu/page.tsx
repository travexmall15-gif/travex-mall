'use client'
import { useTranslation } from "@/hooks/useTranslation"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { sb } from '@/lib/supabase'
import { useLang } from '@/lib/lang-context'
import { ArrowLeft, ChevronRight, Store, LayoutDashboard, ShoppingCart, MessageSquare, Settings, Shield, Info, LogOut, User, Globe, Zap, Users, Home, GraduationCap, Sparkles } from 'lucide-react'

export default function MenuPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { lang, setLang } = useLang()
  const [user, setUser] = useState<{name:string, email:string} | null>(null)
  const [showLogout, setShowLogout] = useState(false)

  useEffect(() => {
    sb.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const m = session.user.user_metadata
        setUser({
          email: session.user.email || '',
          name: m?.display_name || m?.username || session.user.email?.split('@')[0] || 'User',
        })
      }
    }).catch(console.error)
  }, [])

  const handleLogout = async () => {
    await sb.auth.signOut()
    router.replace('/auth')
  }

  const SECTIONS = [
    {
      label: 'Quick Navigation',
      items: [
        { icon: Home,           label: 'Home',               href: '/home',         color: '#0D1B3E' },
        { icon: Sparkles,       label: 'Social Vybe',         href: '/vybe',         color: '#7C3AED' },
        { icon: Store,          label: 'Business Market',     href: '/market',       color: '#3B82F6' },
        { icon: GraduationCap,  label: 'Campus Market',       href: '/campus',       color: '#8B5CF6' },
        { icon: Zap,            label: 'Flash Deals',         href: '/flash-deals',  color: '#EF4444' },
        { icon: Users,          label: 'Group Buy',           href: '/group-buy',    color: '#10B981' },
      ]
    },
    {
      label: 'Store & Selling',
      items: [
        { icon: Store,          label: 'Open Your Shop',      href: '/open-store',              color: '#C9A84C' },
        { icon: LayoutDashboard,label: 'Seller Dashboard',    href: '/dashboard/login.html',    color: '#3B82F6' },
        { icon: ShoppingCart,   label: 'Shopping Preferences',href: '/settings/shopping',       color: '#F59E0B' },
      ]
    },
    {
      label: 'Communication',
      items: [
        { icon: Sparkles,       label: '360 AI — Assistant', href: '/ai',           color: '#C9A84C' },
        { icon: MessageSquare,  label: 'Messages',            href: '/messages',     color: '#6366F1' },
      ]
    },
    {
      label: 'Account & App',
      items: [
        { icon: User,           label: 'Edit Profile',        href: '/settings/profile',       color: '#3B82F6' },
        { icon: Settings,       label: 'Settings',            href: '/settings',               color: '#475569' },
        { icon: Shield,         label: 'Privacy Policy',      href: '/privacy',                color: '#64748B' },
        { icon: Info,           label: 'About ShopNekt',      href: '/settings/about',         color: '#64748B' },
      ]
    },
  ]

  return (
    <div style={{ minHeight:'100vh', background:'#F8FAFF', fontFamily:"'Inter',sans-serif", paddingBottom:32 }}>
      <style>{`
         to{opacity:1;transform:translateY(0)} }
        .menu-item:hover { background: #F1F5F9 !important; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ background:'linear-gradient(160deg,#0D1B3E,#1B3A8A)', padding:'52px 20px 24px', position:'sticky', top:0, zIndex:10 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <button onClick={() => { if (window.history.length > 1) { router.back() } else { window.location.href = '/home' } }}
            style={{ background:'rgba(255,255,255,0.10)', border:'none', borderRadius:'50%', width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#fff' }}>
            <ArrowLeft size={17} color="#fff" />
          </button>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ fontSize:'1rem', fontWeight:900, color:'#fff', letterSpacing:'-0.03em' }}>shop</span>
            <span style={{ fontSize:'1rem', fontWeight:900, color:'#F97316', letterSpacing:'-0.03em' }}>nekt</span>
          </div>
          <div style={{ width:36 }} />
        </div>

        {/* Profile section */}
        <a href="/settings/profile" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:14, background:'rgba(255,255,255,0.08)', borderRadius:18, padding:'14px 16px', border:'1px solid rgba(255,255,255,0.12)' }}>
          <div style={{ width:52, height:52, borderRadius:'50%', background:'#F97316', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, border:'2.5px solid rgba(255,255,255,0.25)', fontSize:'1.1rem', fontWeight:900, color:'#fff' }}>
            {user ? user.name.slice(0,2).toUpperCase() : '?'}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:'1rem', fontWeight:800, color:'#fff', letterSpacing:'-0.01em' }}>{user ? user.name : 'Guest'}</div>
            <div style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.45)', marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user ? user.email : 'Sign in to continue'}</div>
          </div>
          <ChevronRight size={18} color="rgba(255,255,255,0.35)" />
        </a>
      </div>

      {/* ── Language Toggle ── */}
      <div style={{ padding:'14px 16px', background:'#fff', borderBottom:'1px solid #F1F5F9', display:'flex', alignItems:'center', gap:12 }}>
        <Globe size={16} color="#64748B" />
        <span style={{ fontSize:'0.82rem', fontWeight:600, color:'#475569', flex:1 }}>{t('menuPage.language')}</span>
        <div style={{ display:'flex', background:'#F1F5F9', borderRadius:10, padding:3, gap:3 }}>
          {(['en','sw'] as const).map(code => (
            <button key={code} onClick={() => setLang(code)}
              style={{ padding:'6px 14px', borderRadius:8, border:'none', fontFamily:"'Inter',sans-serif", fontSize:'0.78rem', fontWeight:700, cursor:'pointer', transition:'all .2s', background: lang===code ? '#0D1B3E' : 'transparent', color: lang===code ? '#C9A84C' : '#64748B' }}>
              {code === 'en' ? '🇬🇧 EN' : '🇹🇿 SW'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Sections ── */}
      <div style={{ padding:'10px 16px', }}>
        {SECTIONS.map((section, si) => (
          <div key={si} style={{ marginBottom:'1.1rem' }}>
            <p style={{ fontSize:'0.62rem', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:6, paddingLeft:4 }}>
              {section.label}
            </p>
            <div style={{ background:'#fff', borderRadius:16, border:'1.5px solid #E2E8F0', overflow:'hidden', boxShadow:'0 1px 4px rgba(15,23,42,0.04)' }}>
              {section.items.map((item, i) => (
                <a href={item.href} style={{ textDecoration:'none', display:'block' }}>
                  <div className="menu-item" style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px', borderBottom: i < section.items.length-1 ? '1px solid #F1F5F9' : 'none', background:'transparent', transition:'background .15s', cursor:'pointer' }}>
                    <div style={{ width:38, height:38, borderRadius:11, background:`${item.color}15`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <item.icon size={18} color={item.color} strokeWidth={1.8} />
                    </div>
                    <span style={{ fontSize:'0.9rem', fontWeight:600, color:'#0F172A', flex:1 }}>{item.label}</span>
                    <ChevronRight size={15} color="#CBD5E1" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        ))}

        {/* ── Log Out ── */}
        <div style={{ background:'#fff', borderRadius:16, border:'1.5px solid #FEE2E2', overflow:'hidden', marginTop:4 }}>
          <button onClick={() => setShowLogout(true)}
            style={{ width:'100%', display:'flex', alignItems:'center', gap:14, padding:'14px 16px', background:'none', border:'none', cursor:'pointer', fontFamily:"'Inter',sans-serif", transition:'background .15s', textAlign:'left' }}
            onMouseOver={e => (e.currentTarget as HTMLElement).style.background='#FFF1F2'}
            onMouseOut={e  => (e.currentTarget as HTMLElement).style.background='transparent'}>
            <div style={{ width:38, height:38, borderRadius:11, background:'rgba(239,68,68,0.10)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <LogOut size={18} color="#EF4444" strokeWidth={1.8} />
            </div>
            <span style={{ fontSize:'0.9rem', fontWeight:700, color:'#EF4444' }}>{t('menuPage.logOut')}</span>
          </button>
        </div>

        <p style={{ textAlign:'center', fontSize:'0.62rem', color:'#CBD5E1', marginTop:'1.5rem', letterSpacing:'0.05em' }}>
          ShopNekt v1.0.0 · from QNEX360
        </p>
      </div>

      {/* ── Logout confirm ── */}
      {showLogout && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:999, display:'flex', alignItems:'flex-end', justifyContent:'center', padding:16 }}>
          <div style={{ background:'#fff', borderRadius:20, padding:'1.5rem', width:'100%', maxWidth:400, boxShadow:'0 -8px 40px rgba(0,0,0,0.15)', }}>
            <h3 style={{ fontSize:'1rem', fontWeight:800, color:'#0D1B3E', textAlign:'center', marginBottom:8 }}>{t('menuPage.logOutConfirm')}</h3>
            <p style={{ fontSize:'0.82rem', color:'#64748B', textAlign:'center', marginBottom:'1.25rem' }}>{t('menuPage.logOutDesc')}</p>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={() => setShowLogout(false)}
                style={{ flex:1, padding:'12px', background:'#F1F5F9', border:'none', borderRadius:12, fontWeight:600, cursor:'pointer', fontFamily:"'Inter',sans-serif", fontSize:'0.9rem', color:'#475569' }}>
                Cancel
              </button>
              <button onClick={handleLogout}
                style={{ flex:1, padding:'12px', background:'#EF4444', border:'none', borderRadius:12, fontWeight:700, cursor:'pointer', fontFamily:"'Inter',sans-serif", fontSize:'0.9rem', color:'#fff' }}>
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
