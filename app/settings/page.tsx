'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import { sb } from '@/lib/supabase'
import { useState, useEffect } from 'react'
import { Bell, Lock, Info, LogOut, ChevronRight, Shield, FileText, HelpCircle, Trash2, User } from 'lucide-react'

export default function SettingsPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [user, setUser] = useState<{name:string; email:string} | null>(null)
  const [showDelete, setShowDelete] = useState(false)

  useEffect(() => {
    sb.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const m = session.user.user_metadata
        setUser({ name: m?.display_name || m?.username || 'User', email: session.user.email || '' })
        return
      }
      // Fallback: OTP customer session (localStorage)
      try {
        const raw = localStorage.getItem('sn_customer_session')
        if (raw) {
          const sess = JSON.parse(raw)
          if (sess?.id && sess?.name) {
            setUser({ name: sess.name, email: sess.email || '' })
            return
          }
        }
      } catch {}
      router.replace('/auth')
    }).catch(() => {
      try {
        const raw = localStorage.getItem('sn_customer_session')
        if (raw) {
          const sess = JSON.parse(raw)
          if (sess?.id && sess?.name) { setUser({ name: sess.name, email: sess.email || '' }); return }
        }
      } catch {}
      router.replace('/auth')
    })
  }, [router])

  const handleLogout = async () => {
    const CLEAR_KEYS = [
      'sn_customer_session', 'sn_welcomed', 'sn_saved_shops',
      'sn_notif', 'sn_shopping_prefs',
      'travex_session', 'travex_plan', 'travex_shop_name',
      'travex_owner_name', 'travex_category', 'travex_region',
      'travex_user_id', 'travex_email',
    ]
    CLEAR_KEYS.forEach(k => localStorage.removeItem(k))
    await sb.auth.signOut().catch(() => {})
    window.location.replace('/welcome')
  }

  const SECTIONS = [
    {
      title: t('settings.sectionAccount'),
      items: [
        { icon: User,       label: t('menuPage.editProfile'),      sub: t('settings.labelProfileSub'),       href: '/settings/profile',       color: '#3B82F6' },
        { icon: Lock,       label: t('settings.security'),          sub: t('settings.labelSecuritySub'),      href: '/settings/security',      color: 'var(--sn-primary)' },
      ],
    },
    {
      title: t('settings.sectionPrefs'),
      items: [
        { icon: Bell,       label: t('settings.notifications'),     sub: t('settings.labelNotificationsSub'), href: '/settings/notifications', color: 'var(--sn-primary)' },
      ],
    },
    {
      title: t('settings.sectionLegal'),
      items: [
        { icon: HelpCircle, label: t('settings.labelHelp'),         sub: t('settings.labelHelpSub'),          href: '/settings/about',         color: '#10B981' },
        { icon: Shield,     label: t('settings.privacyPolicy'),     sub: t('settings.labelPrivacySub'),       href: '/privacy',                color: 'var(--sn-muted)' },
        { icon: FileText,   label: t('settings.labelTerms'),        sub: t('settings.labelTermsSub'),         href: '/privacy',                color: 'var(--sn-muted)' },
      ],
    },
  ]

  return (
    <main style={{ minHeight:'100vh', background:'var(--sn-page)', paddingTop: 118, fontFamily:"'Inter',sans-serif" }}>
      <div style={{ maxWidth:520, margin:'0 auto', padding:'1.5rem 5% 4rem' }}>

        <h1 style={{ fontSize:'1.25rem', fontWeight:800, color:'#0D1B3E', marginBottom:'1.5rem', letterSpacing:'-0.025em' }}>{t('settings.title')}</h1>

        {/* Profile card */}
        <Link href="/settings/profile" style={{ textDecoration:'none', display:'block', marginBottom:'1.25rem' }}>
          <div style={{ background:'var(--sn-bg)', borderRadius:18, padding:'1.1rem 1.25rem', display:'flex', alignItems:'center', gap:14, cursor:'pointer', transition:'opacity .2s' }}
            onMouseOver={e => (e.currentTarget as HTMLElement).style.opacity='0.9'}
            onMouseOut={e  => (e.currentTarget as HTMLElement).style.opacity='1'}>
            <div style={{ width:50, height:50, borderRadius:'50%', background:'var(--sn-primary)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, border:'2px solid #E5E7EB', fontSize:'1.05rem', fontWeight:900 }}>
              {user ? user.name.slice(0,2).toUpperCase() : '?'}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:'1rem', fontWeight:700, color:'var(--sn-text)', marginBottom:3 }}>{user?.name || t('common.loading')}</div>
              <div style={{ fontSize:'0.72rem', color:'var(--sn-subtle)' }}>{user?.email || ''}</div>
            </div>
            <ChevronRight size={18} color="#9CA3AF" />
          </div>
        </Link>

        {/* Sections */}
        {SECTIONS.map((section, si) => (
          <div key={si} style={{ marginBottom:'1.1rem' }}>
            <div style={{ fontSize:'0.62rem', fontWeight:700, color:'var(--sn-subtle)', textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:'0.5rem', paddingLeft:4 }}>
              {section.title}
            </div>
            <div style={{ background:'var(--sn-bg)', borderRadius:16, border:'1.5px solid #E2E8F0', overflow:'hidden', boxShadow:'0 1px 4px rgba(15,23,42,0.04)' }}>
              {section.items.map((item, i) => (
                <Link key={i} href={item.href} style={{ textDecoration:'none' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 16px', borderBottom: i < section.items.length-1 ? '1px solid #F1F5F9' : 'none', transition:'background .15s', cursor:'pointer' }}
                    onMouseOver={e => (e.currentTarget as HTMLElement).style.background='#F8FAFF'}
                    onMouseOut={e  => (e.currentTarget as HTMLElement).style.background='transparent'}>
                    <div style={{ width:36, height:36, borderRadius:10, background:`${item.color}18`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <item.icon size={17} color={item.color} />
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--sn-text)', lineHeight:1.2 }}>{item.label}</div>
                      <div style={{ fontSize:'0.7rem', color:'var(--sn-subtle)', marginTop:2 }}>{item.sub}</div>
                    </div>
                    <ChevronRight size={14} color="#CBD5E1" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* Danger zone */}
        <div style={{ marginBottom:'1.1rem' }}>
          <div style={{ fontSize:'0.62rem', fontWeight:700, color:'var(--sn-subtle)', textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:'0.5rem', paddingLeft:4 }}>
            {t('settings.dangerZone')}
          </div>
          <div style={{ background:'var(--sn-bg)', borderRadius:16, border:'1.5px solid #FEE2E2', overflow:'hidden' }}>
            <button onClick={() => setShowDelete(true)}
              style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:'13px 16px', background:'none', border:'none', cursor:'pointer', fontFamily:"'Inter',sans-serif", transition:'background .15s', textAlign:'left' }}
              onMouseOver={e => (e.currentTarget as HTMLElement).style.background='#FFF1F2'}
              onMouseOut={e  => (e.currentTarget as HTMLElement).style.background='transparent'}>
              <div style={{ width:36, height:36, borderRadius:10, background:'rgba(239,68,68,0.10)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Trash2 size={16} color="#EF4444" />
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:'0.875rem', fontWeight:600, color:'#EF4444' }}>{t('settings.deleteAccount')}</div>
                <div style={{ fontSize:'0.7rem', color:'var(--sn-subtle)', marginTop:2 }}>{t('settings.deleteAccountDesc')}</div>
              </div>
            </button>
          </div>
        </div>

        {/* Log Out */}
        <div style={{ background:'var(--sn-bg)', borderRadius:16, border:'1.5px solid #FEE2E2', overflow:'hidden', marginBottom:'1.5rem' }}>
          <button onClick={handleLogout}
            style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:'13px 16px', background:'none', border:'none', cursor:'pointer', fontFamily:"'Inter',sans-serif", transition:'background .15s', textAlign:'left' }}
            onMouseOver={e => (e.currentTarget as HTMLElement).style.background='#FFF1F2'}
            onMouseOut={e  => (e.currentTarget as HTMLElement).style.background='transparent'}>
            <div style={{ width:36, height:36, borderRadius:10, background:'rgba(239,68,68,0.10)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <LogOut size={16} color="#EF4444" />
            </div>
            <span style={{ fontSize:'0.875rem', fontWeight:700, color:'#EF4444' }}>{t('settings.logOut')}</span>
          </button>
        </div>

        <p style={{ textAlign:'center', fontSize:'0.65rem', color:'#CBD5E1', letterSpacing:'0.05em' }}>
          ShopNekt v1.0.0 &middot; from QNEX360
        </p>
      </div>

      {/* Delete modal */}
      {showDelete && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
          <div style={{ background:'var(--sn-bg)', borderRadius:20, padding:'1.5rem', maxWidth:340, width:'100%', boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ fontSize:'1.5rem', textAlign:'center', marginBottom:12 }}>⚠️</div>
            <h3 style={{ fontSize:'1rem', fontWeight:800, color:'#0D1B3E', textAlign:'center', marginBottom:8 }}>{t('settings.deleteConfirmTitle')}</h3>
            <p style={{ fontSize:'0.82rem', color:'var(--sn-muted)', textAlign:'center', lineHeight:1.6, marginBottom:'1.25rem' }}>
              {t('settings.deleteConfirmDesc')}
            </p>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={() => setShowDelete(false)}
                style={{ flex:1, padding:'11px', background:'var(--sn-bg)', border:'none', borderRadius:12, fontWeight:600, cursor:'pointer', fontFamily:"'Inter',sans-serif", fontSize:'0.875rem' }}>
                {t('common.cancel')}
              </button>
              <button onClick={async () => { await sb.auth.signOut(); window.location.replace('/welcome') }}
                style={{ flex:1, padding:'11px', background:'#EF4444', border:'none', borderRadius:12, fontWeight:700, cursor:'pointer', fontFamily:"'Inter',sans-serif", fontSize:'0.875rem', color:'var(--sn-text)' }}>
                {t('settings.deleteBtn')}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
