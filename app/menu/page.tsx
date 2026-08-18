'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import { useLang } from '@/lib/lang-context'
import { sb } from '@/lib/supabase'
import {
  ArrowLeft, ChevronRight, Store, ShoppingCart,
  MessageSquare, Settings, Shield, Info, LogOut, User, Globe,
  Zap, Users, Home, Sparkles,
} from 'lucide-react'

export default function MenuPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { lang, setLang, meta } = useLang()
  const [user, setUser] = useState<{name:string; email:string} | null>(null)
  const [showLogout, setShowLogout] = useState(false)

  useEffect(() => {
    // 1. Check Supabase Auth (sellers / Google users)
    sb.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const m = session.user.user_metadata
        setUser({
          email: session.user.email || '',
          name: m?.display_name || m?.username || session.user.email?.split('@')[0] || 'User',
        })
        return
      }
      // 2. Check customer session (localStorage — our OTP flow)
      try {
        const raw = localStorage.getItem('sn_customer_session')
        if (raw) {
          const sess = JSON.parse(raw)
          if (sess?.id && sess?.name) {
            setUser({ name: sess.name, email: sess.email || '' })
          }
        }
      } catch {}
    }).catch(() => {
      // Supabase failed — still try localStorage
      try {
        const raw = localStorage.getItem('sn_customer_session')
        if (raw) {
          const sess = JSON.parse(raw)
          if (sess?.id && sess?.name) {
            setUser({ name: sess.name, email: sess.email || '' })
          }
        }
      } catch {}
    })
  }, [])

  const handleLogout = async () => {
    // Futa session zote za mtumiaji
    const CLEAR_KEYS = [
      'sn_customer_session',
      'sn_welcomed',
      'sn_saved_shops',
      'sn_notif',
      'sn_shopping_prefs',
      'travex_session',
      'travex_plan',
      'travex_shop_name',
      'travex_owner_name',
      'travex_category',
      'travex_region',
      'travex_user_id',
      'travex_email',
    ]
    CLEAR_KEYS.forEach(k => localStorage.removeItem(k))
    await sb.auth.signOut().catch(() => {})
    // Rudisha kwenye mwanzo — welcome page (kuchagua lugha → kujaza taarifa upya)
    window.location.replace('/welcome')
  }

  const SECTIONS = [
    {
      label: t('menuPage.quickNav'),
      items: [
        { icon: Home,           label: t('menuPage.home'),          href: '/home',               color: '#0D1B3E' },
        { icon: Sparkles,       label: t('menuPage.vybe'),          href: '/vybe',               color: 'var(--sn-text)' },
        { icon: Store,          label: t('menuPage.market'),        href: '/market',             color: '#3B82F6' },
        { icon: Zap,            label: t('menuPage.flashDeals'),    href: '/flash-deals',        color: '#EF4444' },
        { icon: Users,          label: t('menuPage.groupBuy'),      href: '/group-buy',          color: '#10B981' },
      ],
    },
    {
      label: t('menuPage.storeSelling'),
      items: [
        { icon: Store,          label: t('menuPage.openShop'),     href: '/open-store',              color: 'var(--sn-text)' },
        { icon: ShoppingCart,   label: t('menuPage.shoppingPrefs'), href: '/settings/shopping',       color: 'var(--sn-text)' },
      ],
    },
    {
      label: t('menuPage.communication'),
      items: [
        { icon: Sparkles,       label: t('menuPage.aiAssistant'), href: '/ai',       color: 'var(--sn-text)' },
        { icon: MessageSquare,  label: t('menuPage.messages'),    href: '/messages', color: '#6366F1' },
      ],
    },
    {
      label: t('menuPage.accountApp'),
      items: [
        { icon: User,     label: t('menuPage.editProfile'),       href: '/settings/profile', color: '#3B82F6' },
        { icon: Settings, label: t('menuPage.settings'),          href: '/settings',         color: 'var(--sn-muted)' },
        { icon: Shield,   label: t('menuPage.privacyPolicyItem'), href: '/privacy',          color: 'var(--sn-muted)' },
        { icon: Info,     label: t('menuPage.aboutApp'),          href: '/settings/about',   color: 'var(--sn-muted)' },
      ],
    },
  ]

  return (
    <div style={{ minHeight:'100vh', background:'var(--sn-page)', fontFamily:"'Inter',sans-serif", paddingBottom:32 }}>
      <style>{`.menu-item:hover { background: var(--sn-page) !important; }`}</style>

      {/* Header */}
      <div style={{ background:'var(--sn-bg)', padding:'60px 20px 16px', position:'sticky', top:0, zIndex:10, borderBottom:'1px solid var(--sn-border)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <button onClick={() => window.history.length > 1 ? router.back() : (window.location.href='/home')}
            style={{ background:'var(--sn-bg)', border:'none', borderRadius:'50%', width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--sn-text)' }}>
            <ArrowLeft size={17} color="var(--sn-text)" />
          </button>
          <div style={{ display:'flex', alignItems:'center', gap:0 }}>
            <span style={{ fontSize:'1rem', fontWeight:900, color:'#111827', letterSpacing:'-0.03em' }}>Shop</span>
            <span style={{ fontSize:'1rem', fontWeight:900, color:'var(--sn-primary)', letterSpacing:'-0.03em' }}>Nekt</span>
          </div>
          <div style={{ width:36 }} />
        </div>
        <a href="/settings/profile" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:14, background:'var(--sn-bg)', borderRadius:18, padding:'14px 16px', border:'1px solid var(--sn-border)' }}>
          <div style={{ width:52, height:52, borderRadius:'50%', background:'var(--sn-primary)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, border:'2.5px solid #D1D5DB', fontSize:'1.1rem', fontWeight:900, color:'var(--sn-text)' }}>
            {user ? user.name.slice(0,2).toUpperCase() : '?'}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:'1rem', fontWeight:800, color:'var(--sn-text)', letterSpacing:'-0.01em' }}>{user ? user.name : t('menuPage.guest')}</div>
            <div style={{ fontSize:'0.72rem', color:'var(--sn-subtle)', marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {user ? user.email : t('menuPage.signInToContinue')}
            </div>
          </div>
          <ChevronRight size={18} color="#D1D5DB" />
        </a>
      </div>

      {/* Language toggle */}
      <div style={{ padding:'14px 16px', background:'var(--sn-bg)', borderBottom:'1px solid #F1F5F9', display:'flex', alignItems:'center', gap:12 }}>
        <Globe size={16} color="#64748B" />
        <span style={{ fontSize:'0.82rem', fontWeight:600, color:'var(--sn-muted)', flex:1 }}>{t('menuPage.language')}</span>
        <div style={{ display:'flex', background:'var(--sn-bg)', borderRadius:10, padding:3, gap:3, flexWrap:'wrap' }}>
          {(['en','sw','fr','de','pt','ar'] as const).map(code => (
            <button key={code} onClick={() => setLang(code)}
              style={{ padding:'5px 10px', borderRadius:8, border:'none', fontFamily:"'Inter',sans-serif", fontSize:'0.72rem', fontWeight:700, cursor:'pointer', transition:'all .2s', background: lang===code ? '#0D1B3E' : 'transparent', color: lang===code ? '#1D4ED8' : '#64748B' }}>
              {code.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Sections */}
      <div style={{ padding:'10px 16px' }}>
        {SECTIONS.map((section, si) => (
          <div key={si} style={{ marginBottom:'1.1rem' }}>
            <p style={{ fontSize:'0.62rem', fontWeight:700, color:'var(--sn-subtle)', textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:6, paddingLeft:4 }}>
              {section.label}
            </p>
            <div style={{ background:'var(--sn-bg)', borderRadius:16, border:'1.5px solid #E2E8F0', overflow:'hidden', boxShadow:'0 1px 4px rgba(15,23,42,0.04)' }}>
              {section.items.map((item, i) => (
                <a key={i} href={item.href} style={{ textDecoration:'none', display:'block' }}>
                  <div className="menu-item" style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px', borderBottom: i < section.items.length-1 ? '1px solid #F1F5F9' : 'none', background:'transparent', transition:'background .15s', cursor:'pointer' }}>
                    <div style={{ width:38, height:38, borderRadius:11, background:`${item.color}15`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <item.icon size={18} color={item.color} strokeWidth={1.8} />
                    </div>
                    <span style={{ fontSize:'0.9rem', fontWeight:600, color:'var(--sn-text)', flex:1 }}>{item.label}</span>
                    <ChevronRight size={15} color="#CBD5E1" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        ))}

        {/* Log out */}
        <div style={{ background:'var(--sn-bg)', borderRadius:16, border:'1.5px solid #FEE2E2', overflow:'hidden', marginTop:4 }}>
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
          ShopNekt v1.0.0 &middot; from QNEX360
        </p>
      </div>

      {/* Logout modal */}
      {showLogout && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:999, display:'flex', alignItems:'flex-end', justifyContent:'center', padding:16 }}>
          <div style={{ background:'var(--sn-bg)', borderRadius:20, padding:'1.5rem', width:'100%', maxWidth:400, boxShadow:'0 -8px 40px rgba(0,0,0,0.15)' }}>
            <h3 style={{ fontSize:'1rem', fontWeight:800, color:'#0D1B3E', textAlign:'center', marginBottom:8 }}>{t('menuPage.logOutConfirm')}</h3>
            <p style={{ fontSize:'0.82rem', color:'var(--sn-muted)', textAlign:'center', marginBottom:'1.25rem' }}>{t('menuPage.logOutDesc')}</p>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={() => setShowLogout(false)}
                style={{ flex:1, padding:'12px', background:'var(--sn-bg)', border:'none', borderRadius:12, fontWeight:600, cursor:'pointer', fontFamily:"'Inter',sans-serif", fontSize:'0.9rem', color:'var(--sn-muted)' }}>
                {t('common.cancel')}
              </button>
              <button onClick={handleLogout}
                style={{ flex:1, padding:'12px', background:'#EF4444', border:'none', borderRadius:12, fontWeight:700, cursor:'pointer', fontFamily:"'Inter',sans-serif", fontSize:'0.9rem', color:'var(--sn-text)' }}>
                {t('menuPage.logOutBtn')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
