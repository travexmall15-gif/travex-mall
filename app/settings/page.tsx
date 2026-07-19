'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { sb } from '@/lib/supabase'
import { useState, useEffect } from 'react'
import {
  Bell, Palette, Lock, Info, LogOut,
  ChevronRight, Shield, FileText, HelpCircle, Trash2, User
} from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<{name:string, email:string} | null>(null)
  const [showDelete, setShowDelete] = useState(false)

  useEffect(() => {
    sb.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) { router.replace('/auth'); return }
      const m = session.user.user_metadata
      setUser({ name: m?.display_name || m?.username || 'User', email: session.user.email || '' })
    })
  }, [router])

  const handleLogout = async () => {
    await sb.auth.signOut()
    router.replace('/auth')
  }

  const SECTIONS = [
    {
      title: 'Account',
      items: [
        { icon: User,       label: 'Edit Profile',    sub: 'Name, username, photo',   href: '/settings/profile',       color: '#3B82F6' },
        { icon: Lock,       label: 'Security',         sub: 'Password, sessions',      href: '/settings/security',      color: '#8B5CF6' },
      ]
    },
    {
      title: 'App Preferences',
      items: [
        { icon: Bell,       label: 'Notifications',    sub: 'Deals, orders, updates',  href: '/settings/notifications', color: '#F59E0B' },
        { icon: Palette,    label: 'Appearance',       sub: 'Theme, font size',        href: '/settings/appearance',    color: '#EC4899' },
      ]
    },
    {
      title: 'Legal & Support',
      items: [
        { icon: HelpCircle, label: 'Help & Support',   sub: 'Contact us, FAQs',        href: '/settings/about',         color: '#10B981' },
        { icon: Shield,     label: 'Privacy Policy',   sub: 'How we use your data',    href: '/privacy',                color: '#64748B' },
        { icon: FileText,   label: 'Terms of Service', sub: 'Usage terms & conditions',href: '/privacy',                color: '#64748B' },
      ]
    },
  ]

  return (
    <main style={{ minHeight:'100vh', background:'#F8FAFF', paddingTop:108, fontFamily:"'Inter',sans-serif" }}>
      <SiteNav />
      <div style={{ maxWidth:520, margin:'0 auto', padding:'1.5rem 5% 4rem' }}>

        <h1 style={{ fontSize:'1.25rem', fontWeight:800, color:'#0D1B3E', marginBottom:'1.5rem', letterSpacing:'-0.025em' }}>Settings</h1>

        {/* Profile card */}
        <Link href="/settings/profile" style={{ textDecoration:'none', display:'block', marginBottom:'1.25rem' }}>
          <div style={{ background:'linear-gradient(135deg,#0D1B3E,#1B3A8A)', borderRadius:18, padding:'1.1rem 1.25rem', display:'flex', alignItems:'center', gap:14, cursor:'pointer', transition:'opacity .2s' }}
            onMouseOver={e => (e.currentTarget as HTMLElement).style.opacity='0.9'}
            onMouseOut={e  => (e.currentTarget as HTMLElement).style.opacity='1'}>
            <div style={{ width:50, height:50, borderRadius:'50%', background:'#F97316', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, border:'2px solid rgba(255,255,255,0.2)', fontSize:'1.05rem', fontWeight:900, color:'#fff' }}>
              {user ? user.name.slice(0,2).toUpperCase() : '?'}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:'1rem', fontWeight:700, color:'#fff', marginBottom:3 }}>{user?.name || 'Loading...'}</div>
              <div style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.5)' }}>{user?.email || ''}</div>
            </div>
            <ChevronRight size={18} color="rgba(255,255,255,0.4)" />
          </div>
        </Link>

        {/* Sections */}
        {SECTIONS.map((section, si) => (
          <div key={si} style={{ marginBottom:'1.1rem' }}>
            <div style={{ fontSize:'0.62rem', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:'0.5rem', paddingLeft:4 }}>
              {section.title}
            </div>
            <div style={{ background:'#fff', borderRadius:16, border:'1.5px solid #E2E8F0', overflow:'hidden', boxShadow:'0 1px 4px rgba(15,23,42,0.04)' }}>
              {section.items.map((item, i) => (
                <Link key={i} href={item.href} style={{ textDecoration:'none' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 16px', borderBottom: i < section.items.length-1 ? '1px solid #F1F5F9' : 'none', transition:'background .15s', cursor:'pointer' }}
                    onMouseOver={e => (e.currentTarget as HTMLElement).style.background='#F8FAFF'}
                    onMouseOut={e  => (e.currentTarget as HTMLElement).style.background='transparent'}>
                    <div style={{ width:36, height:36, borderRadius:10, background:`${item.color}18`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <item.icon size={17} color={item.color} />
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:'0.875rem', fontWeight:600, color:'#0F172A', lineHeight:1.2 }}>{item.label}</div>
                      <div style={{ fontSize:'0.7rem', color:'#94A3B8', marginTop:2 }}>{item.sub}</div>
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
          <div style={{ fontSize:'0.62rem', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:'0.5rem', paddingLeft:4 }}>Danger Zone</div>
          <div style={{ background:'#fff', borderRadius:16, border:'1.5px solid #FEE2E2', overflow:'hidden' }}>
            <button onClick={() => setShowDelete(true)}
              style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:'13px 16px', background:'none', border:'none', cursor:'pointer', fontFamily:"'Inter',sans-serif", transition:'background .15s', textAlign:'left' }}
              onMouseOver={e => (e.currentTarget as HTMLElement).style.background='#FFF1F2'}
              onMouseOut={e  => (e.currentTarget as HTMLElement).style.background='transparent'}>
              <div style={{ width:36, height:36, borderRadius:10, background:'rgba(239,68,68,0.10)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Trash2 size={16} color="#EF4444" />
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:'0.875rem', fontWeight:600, color:'#EF4444' }}>Delete Account</div>
                <div style={{ fontSize:'0.7rem', color:'#94A3B8', marginTop:2 }}>Permanently delete your account and data</div>
              </div>
            </button>
          </div>
        </div>

        {/* Log Out */}
        <div style={{ background:'#fff', borderRadius:16, border:'1.5px solid #FEE2E2', overflow:'hidden', marginBottom:'1.5rem' }}>
          <button onClick={handleLogout}
            style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:'13px 16px', background:'none', border:'none', cursor:'pointer', fontFamily:"'Inter',sans-serif", transition:'background .15s', textAlign:'left' }}
            onMouseOver={e => (e.currentTarget as HTMLElement).style.background='#FFF1F2'}
            onMouseOut={e  => (e.currentTarget as HTMLElement).style.background='transparent'}>
            <div style={{ width:36, height:36, borderRadius:10, background:'rgba(239,68,68,0.10)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <LogOut size={16} color="#EF4444" />
            </div>
            <span style={{ fontSize:'0.875rem', fontWeight:700, color:'#EF4444' }}>Log Out</span>
          </button>
        </div>

        <p style={{ textAlign:'center', fontSize:'0.65rem', color:'#CBD5E1', letterSpacing:'0.05em' }}>
          ShopNekt v1.0.0 · from QNEX360
        </p>
      </div>

      {/* Delete confirmation modal */}
      {showDelete && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
          <div style={{ background:'#fff', borderRadius:20, padding:'1.5rem', maxWidth:340, width:'100%', boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ fontSize:'1.5rem', textAlign:'center', marginBottom:12 }}>⚠️</div>
            <h3 style={{ fontSize:'1rem', fontWeight:800, color:'#0D1B3E', textAlign:'center', marginBottom:8 }}>Delete Account?</h3>
            <p style={{ fontSize:'0.82rem', color:'#64748B', textAlign:'center', lineHeight:1.6, marginBottom:'1.25rem' }}>
              This will permanently delete your account and all your data. This cannot be undone.
            </p>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={() => setShowDelete(false)}
                style={{ flex:1, padding:'11px', background:'#F1F5F9', border:'none', borderRadius:12, fontWeight:600, cursor:'pointer', fontFamily:"'Inter',sans-serif", fontSize:'0.875rem' }}>
                Cancel
              </button>
              <button onClick={async () => { await sb.auth.signOut(); router.replace('/auth') }}
                style={{ flex:1, padding:'11px', background:'#EF4444', border:'none', borderRadius:12, fontWeight:700, cursor:'pointer', fontFamily:"'Inter',sans-serif", fontSize:'0.875rem', color:'#fff' }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <SiteFooter />
    </main>
  )
}
