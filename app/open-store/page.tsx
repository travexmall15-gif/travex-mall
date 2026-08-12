'use client'
import { useTranslation } from '@/hooks/useTranslation'
import { SiteFooter } from '@/components/site-footer'
import Link from 'next/link'
import { SiteNav } from '@/components/site-nav'
import { ArrowRight, Store, CheckCircle } from 'lucide-react'

export default function OpenStorePage() {
  const { t } = useTranslation()

  const BIZ_FEATURES = [
    t('openStore.bizF1'), t('openStore.bizF2'), t('openStore.bizF3'),
    t('openStore.bizF4'), t('openStore.bizF5'),
  ]

  return (
    <main style={{ fontFamily:"'Inter', sans-serif", background:'#F8FAFF', minHeight:'100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
      `}</style>

      <SiteNav />

      {/* Hero */}
      <section style={{ position:'relative', overflow:'hidden', paddingTop:'64px', background:`radial-gradient(ellipse 70% 90% at 92% 20%,rgba(56,120,255,0.68) 0%,rgba(30,80,220,0.42) 25%,rgba(15,45,150,0.18) 50%,transparent 70%),linear-gradient(160deg,#010510 0%,#030920 30%,#050E2E 60%,#071540 100%)`, color:'#111827', padding:'4rem 5% 3.5rem', textAlign:'center' }}>
        <div style={{ position:'absolute', top:'-25%', right:'-8%', width:'60%', height:'110%', pointerEvents:'none', zIndex:0, background:'radial-gradient(ellipse 55% 55% at 62% 28%,rgba(56,120,255,0.65) 0%,rgba(35,80,220,0.38) 28%,transparent 70%)', filter:'blur(22px)' }} />
        <div style={{ position:'relative', zIndex:1, maxWidth:'600px', margin:'0 auto' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', background:'rgba(29,78,216,0.12)', border:'1px solid rgba(29,78,216,0.30)', color:'#1D4ED8', padding:'0.35rem 1rem', borderRadius:'999px', fontSize:'0.70rem', fontWeight:700, letterSpacing:'0.05em', marginBottom:'1.4rem' }}>
            {t('openStore.heroChip')}
          </div>
          <h1 style={{ fontFamily:"'Inter',sans-serif", fontSize:'clamp(2rem,5vw,3.2rem)', fontWeight:900, color:'#111827', lineHeight:1.08, marginBottom:'1rem', letterSpacing:'-0.02em' }}>
            {t('openStore.heroH1')} <span style={{ color:'#1D4ED8' }}>{t('openStore.heroH1Store')}</span>
          </h1>
          <p style={{ fontSize:'clamp(0.88rem,1.6vw,1rem)', color:'#6B7280', lineHeight:1.65, maxWidth:'420px', margin:'0 auto' }}>
            {t('openStore.bizDescFull')}
          </p>
        </div>
      </section>

      {/* Business card — centered, max 540px */}
      <section style={{ maxWidth:'540px', margin:'0 auto', padding:'4rem 5% 5rem' }}>
        <Link href="/open-store-b2b" style={{ display:'flex', flexDirection:'column', background:'#FFFFFF', border:'2px solid rgba(29,78,216,0.22)', borderRadius:24, padding:'2.5rem 2rem', textDecoration:'none', color:'inherit', transition:'all 0.28s', position:'relative', overflow:'hidden' }}
          onMouseOver={e => { const el = e.currentTarget as HTMLElement; el.style.transform='translateY(-4px)'; el.style.boxShadow='0 20px 50px rgba(15,23,42,0.12)'; el.style.borderColor='rgba(29,78,216,0.50)' }}
          onMouseOut={e  => { const el = e.currentTarget as HTMLElement; el.style.transform=''; el.style.boxShadow=''; el.style.borderColor='rgba(29,78,216,0.22)' }}>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:'3px', background:'linear-gradient(90deg,#1D4ED8,#F0C96B)', borderRadius:'24px 24px 0 0' }} />
          <div style={{ width:'60px', height:'60px', borderRadius:'18px', background:'linear-gradient(135deg,#040C32,#071545)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'1.5rem', boxShadow:'0 8px 24px rgba(5,11,46,0.18)' }}>
            <Store style={{ width:'28px', height:'28px', color:'#1D4ED8' }} />
          </div>
          <div style={{ display:'flex', gap:'0.4rem', marginBottom:'1rem', flexWrap:'wrap' }}>
            <span style={{ fontSize:'0.62rem', fontWeight:800, background:'rgba(29,78,216,0.10)', color:'#A07830', padding:'0.2rem 0.65rem', borderRadius:'999px' }}>{t('openStore.premiumAvail')}</span>
            <span style={{ fontSize:'0.62rem', fontWeight:800, background:'rgba(15,23,42,0.06)', color:'#6B7280', padding:'0.2rem 0.65rem', borderRadius:'999px' }}>{t('openStore.basicAvail')}</span>
          </div>
          <h2 style={{ fontFamily:"'Inter',sans-serif", fontSize:'1.55rem', fontWeight:900, color:'#111827', marginBottom:'0.6rem', lineHeight:1.15 }}>
            {t('openStore.businessMarket')}
          </h2>
          <p style={{ fontSize:'0.86rem', color:'#6B7280', lineHeight:1.70, marginBottom:'1.5rem' }}>
            {t('openStore.bizDescFull')}
          </p>
          <ul style={{ listStyle:'none', padding:0, margin:'0 0 1.75rem', display:'flex', flexDirection:'column', gap:'0.55rem' }}>
            {BIZ_FEATURES.map(f => (
              <li key={f} style={{ display:'flex', alignItems:'flex-start', gap:'0.5rem', fontSize:'0.80rem', color:'#334155' }}>
                <CheckCircle style={{ width:'15px', height:'15px', color:'#1D4ED8', flexShrink:0, marginTop:'1px' }} />{f}
              </li>
            ))}
          </ul>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'linear-gradient(135deg,#040C32,#071545)', borderRadius:'14px', padding:'1rem 1.25rem' }}>
            <div>
              <div style={{ fontSize:'0.68rem', fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.08em' }}>{t('openStore.monthly')}</div>
              <div style={{ fontFamily:"'Inter',sans-serif", fontSize:'1.3rem', fontWeight:900, color:'#1D4ED8', lineHeight:1 }}>{t('openStore.joinLabel')}</div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'0.4rem', background:'#1D4ED8', color:'#fff', padding:'0.6rem 1.2rem', borderRadius:'999px', fontSize:'0.80rem', fontWeight:700 }}>
              {t('openStore.applyNow')} <ArrowRight style={{ width:'14px', height:'14px' }} />
            </div>
          </div>
        </Link>

        <p style={{ textAlign:'center', fontSize:'0.78rem', color:'#9CA3AF', marginTop:'2rem', lineHeight:1.65 }}>
          {t('openStore.notSure')}{' '}
          <Link href="/market" style={{ color:'#1D4ED8', fontWeight:600, textDecoration:'none' }}>{t('join.browseBusiness')}</Link>
          {' '}{t('openStore.browseFirst2')}
        </p>
      </section>

      <SiteFooter />
    </main>
  )
}
