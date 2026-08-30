'use client'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import { ArrowLeft, Mail, Phone, Globe } from 'lucide-react'

export default function AboutPage() {
  const router = useRouter()
  const { t } = useTranslation()

  const CONTACTS = [
    { icon: Mail,  label: t('about.emailSupport'), val: 'support@shopnekt.com',  href: 'mailto:support@shopnekt.com' },
    { icon: Phone, label: t('about.phone'),        val: '+255 651 919 915',       href: 'https://wa.me/255651919915'  },
    { icon: Globe, label: t('about.website'),      val: 'shopnekt.vercel.app',    href: 'https://shopnekt.vercel.app' },
  ]

  return (
    <main style={{ minHeight:'100vh', background:'var(--sn-page)', paddingTop: '118px', fontFamily:"'Inter',sans-serif" }}>
      <div style={{ maxWidth:480, margin:'0 auto', padding:'1.5rem 5% 4rem' }}>

        <button onClick={() => router.back()} style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', cursor:'pointer', color:'var(--sn-muted)', fontSize:'0.82rem', fontWeight:600, fontFamily:"'Inter',sans-serif", marginBottom:'1.5rem', padding:0 }}>
          <ArrowLeft size={15} /> {t('about.back')}
        </button>

        {/* Identity */}
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <img src="/icon-192.png" alt="ShopNekt" style={{ width:72, height:72, borderRadius:18, objectFit:'cover', marginBottom:12 }} loading="lazy" />
          <div>
            <span style={{ fontSize:'1.25rem', fontWeight:900, color:'#0D1B3E' }}>shop</span>
            <span style={{ fontSize:'1.25rem', fontWeight:900, color:'var(--sn-primary)' }}>nekt</span>
          </div>
          <p style={{ fontSize:'0.7rem', color:'var(--sn-subtle)', marginTop:4 }}>{t('about.version')} 1.0.0 &middot; {t('about.builtBy')}</p>
        </div>

        {/* Contact */}
        <div style={{ marginBottom:'1.25rem' }}>
          <p style={{ fontSize:'0.65rem', fontWeight:700, color:'var(--sn-subtle)', textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:8 }}>
            {t('about.contactSupport')}
          </p>
          <div style={{ background:'var(--sn-bg)', borderRadius:16, border:'1.5px solid #E2E8F0', overflow:'hidden' }}>
            {CONTACTS.map((item, i) => (
              <a key={i} href={item.href} target="_blank" rel="noopener noreferrer"
                style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 16px', textDecoration:'none', borderBottom: i < 2 ? '1px solid #F1F5F9' : 'none', transition:'background .15s' }}
                onMouseOver={e => (e.currentTarget as HTMLElement).style.background='#F8FAFF'}
                onMouseOut={e  => (e.currentTarget as HTMLElement).style.background='transparent'}>
                <div style={{ width:36, height:36, borderRadius:10, background:'var(--sn-page)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <item.icon size={16} color="#0D1B3E" />
                </div>
                <div>
                  <div style={{ fontSize:'0.82rem', fontWeight:600, color:'var(--sn-text)' }}>{item.label}</div>
                  <div style={{ fontSize:'0.7rem', color:'var(--sn-subtle)', marginTop:2 }}>{item.val}</div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Rate */}
        <button style={{ width:'100%', padding:'0.875rem', background:'var(--sn-bg)', border:'1.5px solid #E2E8F0', borderRadius:14, fontFamily:"'Inter',sans-serif", fontWeight:700, fontSize:'0.9rem', color:'#0D1B3E', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
          ⭐ {t('about.rateApp')} ⭐⭐⭐⭐⭐
        </button>

        <p style={{ textAlign:'center', fontSize:'0.65rem', color:'#CBD5E1', marginTop:'2rem' }}>
          {t('about.copyright')}
        </p>
      </div>
    </main>
  )
}
