'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { sb } from '@/lib/supabase'
import { useState, useEffect } from 'react'
import {
  User, Bell, Globe, Palette, Lock, ShoppingBag,
  Info, LogOut, ChevronRight, Shield, FileText, Star,
  HelpCircle, Trash2, Phone
} from 'lucide-react'

export default function SettingsPage() {
  const { t, lang } = useTranslation() as any
  const router = useRouter()
  const [user, setUser] = useState<{name:string, email:string} | null>(null)

  useEffect(() => {
    sb.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const m = session.user.user_metadata
        setUser({ name: m?.display_name || m?.username || 'User', email: session.user.email || '' })
      }
    })
  }, [])

  const handleLogout = async () => {
    await sb.auth.signOut()
    router.replace('/auth')
  }

  const SECTIONS = [
    {
      title: 'Account',
      items: [
        { icon: User,      label: 'Edit Profile',       sub: 'Name, username, photo',          href: '/settings/profile',       color: '#3B82F6' },
        { icon: Lock,      label: 'Security',            sub: 'Password, sessions',             href: '/settings/security',      color: '#8B5CF6' },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { icon: Bell,      label: 'Notifications',       sub: 'Deals, orders, updates',         href: '/settings/notifications', color: '#F59E0B' },
        { icon: Globe,     label: 'Language & Region',   sub: lang === 'sw' ? 'Kiswahili' : 'English', href: '/settings/appearance', color: '#10B981' },
        { icon: Palette,   label: 'Appearance',          sub: 'Theme, font size',               href: '/settings/appearance',    color: '#EC4899' },
      ]
    },
    {
      title: 'Shopping',
      items: [
        { icon: ShoppingBag, label: 'Shopping Preferences', sub: 'Orders, saved items',       href: '/settings/shopping',      color: '#C9A84C' },
      ]
    },
    {
      title: 'Support & Legal',
      items: [
        { icon: HelpCircle, label: 'Help & Support',    sub: 'Contact us, FAQs',              href: '/settings/about',         color: '#64748B' },
        { icon: Shield,     label: 'Privacy Policy',    sub: 'How we use your data',          href: '/privacy',                color: '#64748B' },
        { icon: FileText,   label: 'Terms of Service',  sub: 'Usage terms',                   href: '/privacy',                color: '#64748B' },
        { icon: Info,       label: 'About ShopNekt',    sub: 'Version, licenses',             href: '/settings/about',         color: '#64748B' },
      ]
    },
  ]

  return (
    <main style={{ minHeight: '100vh', background: '#F8FAFF', paddingTop: '108px', fontFamily: "'Inter',sans-serif" }}>
      <SiteNav />

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '1.5rem 5% 4rem' }}>

        {/* Profile card */}
        <Link href="/settings/profile" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'linear-gradient(135deg,#0D1B3E,#1B3A8A)', borderRadius: 20, padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', transition: 'opacity 0.2s' }}
            onMouseOver={e => (e.currentTarget as HTMLElement).style.opacity = '0.9'}
            onMouseOut={e  => (e.currentTarget as HTMLElement).style.opacity = '1'}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#F97316', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '2px solid rgba(255,255,255,0.2)', fontSize: '1.1rem', fontWeight: 900, color: '#fff' }}>
              {user ? user.name.slice(0,2).toUpperCase() : '?'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: 3 }}>{user?.name || 'Guest'}</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>{user?.email || 'Not signed in'}</div>
            </div>
            <ChevronRight size={18} color="rgba(255,255,255,0.4)" />
          </div>
        </Link>

        {/* Settings sections */}
        {SECTIONS.map((section, si) => (
          <div key={si} style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '0.5rem', paddingLeft: 4 }}>
              {section.title}
            </div>
            <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(15,23,42,0.05)' }}>
              {section.items.map((item, i) => (
                <Link key={i} href={item.href} style={{ textDecoration: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderBottom: i < section.items.length - 1 ? '1px solid #F1F5F9' : 'none', transition: 'background 0.15s', cursor: 'pointer' }}
                    onMouseOver={e => (e.currentTarget as HTMLElement).style.background = '#F8FAFF'}
                    onMouseOut={e  => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${item.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <item.icon size={17} color={item.color} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0F172A', lineHeight: 1.2 }}>{item.label}</div>
                      <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: 2 }}>{item.sub}</div>
                    </div>
                    <ChevronRight size={15} color="#CBD5E1" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* Open Shop */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(15,23,42,0.05)' }}>
            <Link href="/open-store" style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderBottom: '1px solid #F1F5F9', transition: 'background .15s' }}
                onMouseOver={e => (e.currentTarget as HTMLElement).style.background = '#FFFBEB'}
                onMouseOut={e  => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(201,168,76,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShoppingBag size={17} color="#C9A84C" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A' }}>Open Your Shop</div>
                  <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: 2 }}>Start selling on ShopNekt</div>
                </div>
                <ChevronRight size={15} color="#CBD5E1" />
              </div>
            </Link>
            <Link href="/dashboard/login.html" style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', transition: 'background .15s' }}
                onMouseOver={e => (e.currentTarget as HTMLElement).style.background = '#EFF6FF'}
                onMouseOut={e  => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(59,130,246,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Star size={17} color="#3B82F6" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A' }}>Seller Dashboard</div>
                  <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: 2 }}>Manage your shop</div>
                </div>
                <ChevronRight size={15} color="#CBD5E1" />
              </div>
            </Link>
          </div>
        </div>

        {/* Log Out */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #FEE2E2', overflow: 'hidden' }}>
          <button onClick={handleLogout}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Inter',sans-serif", transition: 'background .15s', textAlign: 'left' }}
            onMouseOver={e => (e.currentTarget as HTMLElement).style.background = '#FFF1F2'}
            onMouseOut={e  => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(239,68,68,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LogOut size={17} color="#EF4444" />
            </div>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#EF4444' }}>Log Out</span>
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.65rem', color: '#CBD5E1', marginTop: '2rem', letterSpacing: '0.05em' }}>
          ShopNekt · from QNEX360 · v1.0.0
        </p>
      </div>

      <SiteFooter />
    </main>
  )
}
