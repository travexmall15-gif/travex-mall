'use client'
import { useTranslation } from '@/hooks/useTranslation'
import { SiteFooter } from '@/components/site-footer'

import Link from 'next/link'

export default function JoinPage() {
  const { t } = useTranslation()
  return (
    <main style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#f8f9fc', minHeight: '100vh', color: '#0D1B3E' }}>

      {/*  HEADER  */}
      <header style={{ background: '#fff', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/icon-192.png" alt="ShopNekt" width={36} height={36} style={{ borderRadius: 8 }}  loading="lazy" />
          <span style={{ color: '#1D4ED8', fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>SHOPNEKT</span>
        </div>
        <Link href="/" style={{ color: '#6B7280', fontSize: '0.8rem', textDecoration: 'none', border: '1px solid #E5E7EB', padding: '6px 14px', borderRadius: 999 }}>
         {t('join.browseMarket')} 
        </Link>
      </header>

      {/*  HERO  */}
      <section style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #1B3A8A 100%)', padding: 'clamp(3rem,8vw,5rem) 1.5rem', textAlign: 'center', color: '#111827' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(29,78,216,0.15)', border: '1px solid rgba(29,78,216,0.4)', borderRadius: 999, padding: '6px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#1D4ED8', marginBottom: '1.5rem', letterSpacing: '0.05em' }}>
           {t('join.digitalBadge')} 
        </div>
        <h1 style={{ fontFamily: "'Inter',sans-serif", fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '1rem', maxWidth: 700, margin: '0 auto 1rem' }}>
          {t('join.heroTitle1')}<br />
          <span style={{ color: '#1D4ED8' }}>ShopNekt</span>
        </h1>
        <p style={{ fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', color: '#6B7280', maxWidth: 520, margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
          {t('join.heroSubtitle')}
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/open-store" style={{ background: '#1D4ED8', color: '#fff', fontWeight: 800, padding: '1rem 2rem', borderRadius: 14, textDecoration: 'none', fontSize: '1rem', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
             {t('join.openStoreNow')}
          </Link>
          <Link href="/" style={{ background: 'rgba(255,255,255,0.1)', color: '#111827', fontWeight: 700, padding: '1rem 2rem', borderRadius: 14, textDecoration: 'none', fontSize: '1rem', border: '1px solid #E5E7EB', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
             {t('join.browseMarket')}
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '3rem', flexWrap: 'wrap' }}>
          {[['500+', t('join.shops')], ['5', t('join.regions')], ['5', t('join.universities')], ['3', t('join.aiProducts')]].map(([v, l]) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '1.8rem', fontWeight: 900, color: '#1D4ED8' }}>{v}</div>
              <div style={{ fontSize: '0.7rem', color: '#9CA3AF', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/*  JINSI INAVYOFANYA KAZI  */}
      <section style={{ padding: 'clamp(3rem,6vw,4rem) 1.5rem', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.12em', color: '#1D4ED8', marginBottom: 8 }}>{t('join.processLabel')}</div>
          <h2 style={{ fontFamily: "'Inter',sans-serif", fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 700, color: '#0D1B3E' }}>{t('join.howItWorks')}</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
          {[
            { n: '1', icon: '', t: t('join.requestShop'), d: t('join.step1Desc') },
            { n: '2', icon: '', t: t('join.adminReview'), d: t('join.step2Desc') },
            { n: '3', icon: '', t: t('join.getLogin'), d: t('join.step3Desc') },
            { n: '4', icon: '', t: t('join.addProducts'), d: t('join.step4Desc') },
            { n: '5', icon: '', t: t('join.receiveOrders'), d: t('join.step5Desc') },
            { n: '6', icon: '', t: t('join.step6Title'), d: t('join.step6Desc') },
          ].map(s => (
            <div key={s.n} style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', border: '1px solid #E8ECF4', boxShadow: '0 2px 12px rgba(13,27,62,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.75rem' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#fff', color: '#1D4ED8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.8rem', flexShrink: 0 }}>{s.n}</div>
                <span style={{ fontSize: '1.3rem' }}>{s.icon}</span>
                <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0D1B3E' }}>{s.t}</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#6B7280', lineHeight: 1.65, margin: 0 }}>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/*  {t('join.marketsLabel')} MAWILI  */}
      <section style={{ padding: 'clamp(3rem,6vw,4rem) 1.5rem', background: '#fff' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.12em', color: '#1D4ED8', marginBottom: 8 }}>{t('join.marketsLabel')}</div>
            <h2 style={{ fontFamily: "'Inter',sans-serif", fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 700, color: '#111827' }}>{t('join.chooseMarket')}</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>

            {/* Business Market */}
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: '2rem', border: '1px solid rgba(29,78,216,0.3)' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em', color: '#1D4ED8', marginBottom: 12 }}> BIASHARA MARKET</div>
              <h3 style={{ fontFamily: "'Inter',sans-serif", fontSize: '1.4rem', fontWeight: 900, color: '#111827', marginBottom: '0.5rem' }}>{t('join.businessTitle2')}</h3>
              <p style={{ fontSize: '0.82rem', color: '#6B7280', lineHeight: 1.7, marginBottom: '1.5rem' }}>Kwa wafanyabiashara na wajasiriamali duniani kote. Uza bidhaa na huduma zako kwa wateja popote.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ background: '#fff', borderRadius: 12, padding: '1rem 1.25rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ fontWeight: 800, color: '#111827', marginBottom: 4 }}>{t('join.basicPlanLabel')}</div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '1.6rem', fontWeight: 900, color: '#1D4ED8', marginBottom: 4 }}>TZS 25,000<span style={{ fontSize: '0.8rem', fontWeight: 400, color: '#9CA3AF' }}>/mwezi</span></div>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {['Duka lako mtandaoni', 'Bidhaa bila kikomo', 'Ushauri wa AI', 'WhatsApp integration'].map(f => (
                      <li key={f} style={{ fontSize: '0.78rem', color: '#6B7280', display: 'flex', gap: 6 }}>
                        <span style={{ color: '#86EFAC' }}></span> {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div style={{ background: 'linear-gradient(135deg, rgba(29,78,216,0.15), rgba(29,78,216,0.08))', borderRadius: 12, padding: '1rem 1.25rem', border: '1px solid rgba(29,78,216,0.4)', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: -10, right: 16, background: '#1D4ED8', color: '#fff', fontSize: '0.6rem', fontWeight: 900, padding: '3px 10px', borderRadius: 999 }}>{t('join.mostPopular')}</div>
                  <div style={{ fontWeight: 800, color: '#1D4ED8', marginBottom: 4 }}>{t('join.premiumPlanLabel')}</div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '1.6rem', fontWeight: 900, color: '#1D4ED8', marginBottom: 4 }}>TZS 45,000<span style={{ fontSize: '0.8rem', fontWeight: 400, color: '#9CA3AF' }}>/mwezi</span></div>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {['Kila kitu cha Basic', 'Duka linaonekana kwanza', 'Flash Deals &Group Buy', 'AI Marketing Manager', 'Ripoti za biashara'].map(f => (
                      <li key={f} style={{ fontSize: '0.78rem', color: '#6B7280', display: 'flex', gap: 6 }}>
                        <span style={{ color: '#1D4ED8' }}></span> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <Link href="/open-store-b2b" style={{ display: 'block', textAlign: 'center', background: '#1D4ED8', color: '#fff', fontWeight: 800, padding: '0.875rem', borderRadius: 12, textDecoration: 'none', fontSize: '0.9rem' }}>
                Open a Business Shop
              </Link>
            </div>


          </div>
        </div>
      </section>

      {/*  AI FEATURES  */}
      <section style={{ padding: 'clamp(3rem,6vw,4rem) 1.5rem', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.12em', color: '#1D4ED8', marginBottom: 8 }}>TEKNOLOJIA YA AI</div>
          <h2 style={{ fontFamily: "'Inter',sans-serif", fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 700, color: '#0D1B3E' }}>Vifaa vya AI, Bila Malipo</h2>
          <p style={{ fontSize: '0.9rem', color: '#6B7280', maxWidth: 500, margin: '0.75rem auto 0' }}>Kila duka linapatia vifaa vya AI bila gharama ya ziada</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {[
            { icon: '', t: 'AI Business Assistant', d: 'Andika maelezo ya bidhaa kwa Kiswahili na Kiingereza. Pata ushauri wa bei kwa soko la kimataifa.' },
            { icon: '', t: 'AI Accountant', d: 'Taarifa ya biashara yako otomatiki. Gawanya matumizi, angalia faida, pata ushauri wa fedha.' },
            { icon: '', t: 'Marketing Manager', d: 'Tengeneza machapisho ya Instagram, WhatsApp na Facebook papo hapo. Share kwa wateja wako.' },
            { icon: '', t: 'Business Coach', d: 'Zungumza na AI Coach wako binafsi. Uliza swali lolote la biashara, upate jibu mara moja.' },
          ].map(f => (
            <div key={f.t} style={{ background: '#fff', borderRadius: 14, padding: '1.25rem', border: '1px solid #E8ECF4', boxShadow: '0 2px 8px rgba(13,27,62,0.04)' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '0.75rem' }}>{f.icon}</div>
              <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0D1B3E', marginBottom: 6 }}>{f.t}</div>
              <p style={{ fontSize: '0.78rem', color: '#6B7280', lineHeight: 1.65, margin: 0 }}>{f.d}</p>
            </div>
          ))}
        </div>
      </section>
      {/*  LOGIN  */}
      <section style={{ padding: 'clamp(2rem,5vw,3rem) 1.5rem', textAlign: 'center', background: '#F0F4FF' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Inter',sans-serif", fontSize: '1.6rem', fontWeight: 900, color: '#0D1B3E', marginBottom: '0.5rem' }}>Una Duka Tayari?</h2>
          <p style={{ fontSize: '0.88rem', color: '#6B7280', marginBottom: '1.5rem' }}>Ingia kwenye dashboard yako na namba ya simu na password uliyopewa.</p>
          <Link href="/login" style={{ display: 'inline-block', background: '#fff', color: '#111827', fontWeight: 800, padding: '0.875rem 2.5rem', borderRadius: 14, textDecoration: 'none', fontSize: '0.95rem' }}>
             Ingia Dashboard 
          </Link>
        </div>
      </section>
      <SiteFooter />

    </main>
  )
}
