'use client'
import { useTranslation } from "@/hooks/useTranslation"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLang } from '@/lib/lang-context'
import { useTheme } from '@/lib/theme-context'
import {
  ArrowLeft, Sun, Moon, Monitor, Check, Globe,
  Type, ChevronRight
} from 'lucide-react'

export default function AppearancePage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { lang, setLang }             = useLang()
  const { theme, fontSize, setTheme, setFontSize } = useTheme()
  const [saved, setSaved]             = useState(false)

  const save = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  const row = (onClick: () => void, left: React.ReactNode, right: React.ReactNode, borderBottom = true) => (
    <button onClick={onClick}
      style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', background:'none', border:'none', borderBottom: borderBottom?'1px solid #F1F5F9':'none', cursor:'pointer', fontFamily:"'Inter',sans-serif", transition:'background .15s', textAlign:'left' }}
      onMouseOver={e => (e.currentTarget as HTMLElement).style.background='#F8FAFF'}
      onMouseOut={e  => (e.currentTarget as HTMLElement).style.background='transparent'}>
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>{left}</div>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>{right}</div>
    </button>
  )

  return (
    <main style={{ minHeight:'100vh', background:'var(--sn-page)', paddingTop: 118, fontFamily:"'Inter',sans-serif" }}>
      <div style={{ maxWidth:480, margin:'0 auto', padding:'1.5rem 5% 4rem' }}>

        <button onClick={() => router.back()}
          style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', cursor:'pointer', color:'var(--sn-muted)', fontSize:'0.82rem', fontWeight:600, fontFamily:"'Inter',sans-serif", marginBottom:'1.5rem', padding:0 }}>
          <ArrowLeft size={15}/> Back
        </button>

        <h1 style={{ fontSize:'1.25rem', fontWeight:800, color:'#0D1B3E', marginBottom:'1.5rem', letterSpacing:'-0.025em' }}>
          Appearance & Language
        </h1>

        {/* ── Language ─────────────────────────────────── */}
        <div style={{ marginBottom:'1.1rem' }}>
          <p style={{ fontSize:'0.62rem', fontWeight:700, color:'var(--sn-subtle)', textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:8, paddingLeft:4 }}>{t('appearance.language')}</p>
          <div style={{ background:'var(--sn-bg)', borderRadius:16, border:'1.5px solid #E2E8F0', overflow:'hidden' }}>
            {[
              { code:'en', flag:'🇬🇧', label:'English',   sub:'App displayed in English'  },
              { code:'sw', flag:'🇹🇿', label:'Kiswahili', sub:'Programu kwa Kiswahili'    },
            ].map((l, i) => (
              <button key={l.code}
                onClick={() => { setLang(l.code as 'en'|'sw'); save() }}
                style={{ width:'100%', display:'flex', alignItems:'center', gap:14, padding:'14px 16px', background:'none', border:'none', borderBottom: i===0?'1px solid #F1F5F9':'none', cursor:'pointer', fontFamily:"'Inter',sans-serif", transition:'background .15s' }}
                onMouseOver={e => (e.currentTarget as HTMLElement).style.background='#F8FAFF'}
                onMouseOut={e  => (e.currentTarget as HTMLElement).style.background='transparent'}>
                <div style={{ width:38, height:38, borderRadius:10, background:'var(--sn-bg)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem' }}>
                  {l.flag}
                </div>
                <div style={{ flex:1, textAlign:'left' }}>
                  <div style={{ fontSize:'0.9rem', fontWeight:600, color:'var(--sn-text)' }}>{l.label}</div>
                  <div style={{ fontSize:'0.7rem', color:'var(--sn-subtle)', marginTop:2 }}>{l.sub}</div>
                </div>
                {lang === l.code && (
                  <div style={{ width:22, height:22, borderRadius:'50%', background:'var(--sn-bg)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Check size={13} color="var(--sn-primary)" strokeWidth={3} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Theme ────────────────────────────────────── */}
        <div style={{ marginBottom:'1.1rem' }}>
          <p style={{ fontSize:'0.62rem', fontWeight:700, color:'var(--sn-subtle)', textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:8, paddingLeft:4 }}>{t('appearance.theme')}</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
            {[
              { v:'light',  icon:Sun,     label:'Light',  sub:'Clean white' },
              { v:'dark',   icon:Moon,    label:'Dark',   sub:'Easy on eyes' },
              { v:'system', icon:Monitor, label:'System', sub:'Auto' },
            ].map(t => (
              <button key={t.v}
                onClick={() => { setTheme(t.v as any); save() }}
                style={{ padding:'16px 8px', background: theme===t.v?'#1D4ED8':'#fff', border:`2px solid ${theme===t.v?'#1D4ED8':'var(--sn-border)'}`, borderRadius:16, cursor:'pointer', fontFamily:"'Inter',sans-serif", display:'flex', flexDirection:'column', alignItems:'center', gap:6, transition:'all .2s', position:'relative' }}>
                {theme===t.v && (
                  <div style={{ position:'absolute', top:8, right:8, width:16, height:16, borderRadius:'50%', background:'#1D4ED8', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Check size={10} color="#0D1B3E" strokeWidth={3} />
                  </div>
                )}
                <t.icon size={22} color={theme===t.v?'#1D4ED8':'#64748B'} />
                <span style={{ fontSize:'0.82rem', fontWeight:700, color: theme===t.v?'#fff':'#0F172A' }}>{t.label}</span>
                <span style={{ fontSize:'0.65rem', color: theme===t.v?'#6B7280':'#94A3B8' }}>{t.sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Font Size ────────────────────────────────── */}
        <div style={{ marginBottom:'1.1rem' }}>
          <p style={{ fontSize:'0.62rem', fontWeight:700, color:'var(--sn-subtle)', textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:8, paddingLeft:4 }}>{t('appearance.fontSize')}</p>
          <div style={{ background:'var(--sn-bg)', borderRadius:16, border:'1.5px solid #E2E8F0', overflow:'hidden' }}>
            {[
              { v:'small',  label:'Small',  size:'0.82rem', desc:'Compact, fits more content' },
              { v:'medium', label:'Medium', size:'0.9rem',  desc:'Default, balanced reading'  },
              { v:'large',  label:'Large',  size:'1rem',    desc:'Easier on the eyes'         },
            ].map((f, i) => (
              <button key={f.v}
                onClick={() => { setFontSize(f.v as any); save() }}
                style={{ width:'100%', display:'flex', alignItems:'center', gap:14, padding:'14px 16px', background:'none', border:'none', borderBottom: i<2?'1px solid #F1F5F9':'none', cursor:'pointer', fontFamily:"'Inter',sans-serif", transition:'background .15s', textAlign:'left' }}
                onMouseOver={e => (e.currentTarget as HTMLElement).style.background='#F8FAFF'}
                onMouseOut={e  => (e.currentTarget as HTMLElement).style.background='transparent'}>
                <div style={{ width:38, height:38, borderRadius:10, background: fontSize===f.v?'#1D4ED8':'var(--sn-page)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all .2s' }}>
                  <Type size={16} color={fontSize===f.v?'#1D4ED8':'#64748B'} />
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize: f.size, fontWeight:700, color:'var(--sn-text)' }}>{f.label}</div>
                  <div style={{ fontSize:'0.68rem', color:'var(--sn-subtle)', marginTop:2 }}>{f.desc}</div>
                </div>
                {fontSize===f.v && (
                  <div style={{ width:22, height:22, borderRadius:'50%', background:'var(--sn-bg)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Check size={13} color="var(--sn-primary)" strokeWidth={3} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Other Links ──────────────────────────────── */}
        <div style={{ marginBottom:'1.5rem' }}>
          <p style={{ fontSize:'0.62rem', fontWeight:700, color:'var(--sn-subtle)', textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:8, paddingLeft:4 }}>{t('appearance.moreSettings')}</p>
          <div style={{ background:'var(--sn-bg)', borderRadius:16, border:'1.5px solid #E2E8F0', overflow:'hidden' }}>
            {[
              { label:'Notifications',     sub:'Manage alerts',      href:'/settings/notifications', icon:'🔔' },
              { label:'Privacy Policy',    sub:'How we use data',    href:'/privacy',                icon:'🔒' },
              { label:'About ShopNekt',    sub:'Version & contact',  href:'/settings/about',         icon:'ℹ️' },
            ].map((item, i) => (
              <Link key={i} href={item.href} style={{ textDecoration:'none' }}>
                <div style={{ display:'flex', alignItems:'center', gap:14, padding:'13px 16px', borderBottom: i<2?'1px solid #F1F5F9':'none', transition:'background .15s', cursor:'pointer' }}
                  onMouseOver={e => (e.currentTarget as HTMLElement).style.background='#F8FAFF'}
                  onMouseOut={e  => (e.currentTarget as HTMLElement).style.background='transparent'}>
                  <span style={{ fontSize:'1.1rem', width:38, textAlign:'center' }}>{item.icon}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--sn-text)' }}>{item.label}</div>
                    <div style={{ fontSize:'0.7rem', color:'var(--sn-subtle)', marginTop:2 }}>{item.sub}</div>
                  </div>
                  <ChevronRight size={14} color="#CBD5E1" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Save feedback */}
        {saved && (
          <div style={{ position:'fixed', bottom:24, left:'50%', transform:'translateX(-50%)', background:'var(--sn-bg)', color:'var(--sn-text)', padding:'10px 24px', borderRadius:999, fontWeight:700, fontSize:'0.85rem', display:'flex', alignItems:'center', gap:8, boxShadow:'0 4px 20px rgba(0,0,0,0.2)', zIndex:999, animation:'toastIn 0.3s ease', }}>
            <Check size={14}/> Preference Saved
          </div>
        )}
      </div>
      <style>{`@keyframes toastIn{from{opacity:0;transform:translate(-50%,8px)}to{opacity:1;transform:translate(-50%,0)}}`}</style>
    </main>
  )
}
