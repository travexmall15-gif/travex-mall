'use client'
import { useState, useEffect } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { SiteFooter } from '@/components/site-footer'
import Link from 'next/link'
import { SiteNav } from '@/components/site-nav'
import { ArrowRight, GraduationCap, Store, Sparkles, BadgeCheck, ExternalLink } from 'lucide-react'
import { sb } from '@/lib/supabase'

type SponsoredShop = {
  id: string
  shop_name: string
  shop_slug: string | null
  shop_category: string | null
  shop_city: string | null
  logo_url: string | null
}

export default function HomePage() {
  const { t } = useTranslation()
  const [sponsored, setSponsored] = useState<SponsoredShop[]>([])

  useEffect(() => {
    ;(async () => {
      try {
        const { data, error } = await sb
          .from('pending_payments')
          .select('id,shop_name,shop_slug,shop_category,shop_city,logo_url')
          .eq('status', 'approved')
          .eq('is_sponsored', true)
          .limit(12)
        if (!error && data && data.length > 0) setSponsored(data)
      } catch { /* column may not exist yet — section stays hidden */ }
    })()
  }, [])

  return (
    <main style={{ fontFamily: "'Inter', sans-serif", background: '#FFFFFF', overflowX: 'hidden', paddingTop: '108px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }

        /* ── Sell chip ────────────────────────────────────── */
        .sell-chip-wrap { background:linear-gradient(135deg,#0D1B3E,#1E3A8A); padding:1.2rem 5%; border-bottom:1px solid rgba(255,255,255,0.06); }
        .sell-chip-inner { max-width:1100px; margin:0 auto; }
        .sell-chip-card { display:flex; align-items:center; justify-content:space-between; gap:16px; background:rgba(255,255,255,0.07); border:1.5px solid rgba(255,255,255,0.15); border-radius:16px; padding:14px 20px; flex-wrap:wrap; transition:border-color 0.2s; }
        .sell-chip-card:hover { border-color:rgba(255,255,255,0.30); background:rgba(255,255,255,0.10); }
        .sell-cta { display:inline-flex; align-items:center; gap:0.45rem; background:#2563EB; color:#fff; padding:0.55rem 1.35rem; border-radius:999px; font-weight:800; font-size:0.82rem; text-decoration:none; white-space:nowrap; transition:all 0.2s; flex-shrink:0; }
        .sell-cta:hover { background:#1D4ED8; transform:translateY(-1px); box-shadow:0 6px 18px rgba(37,99,235,0.45); }

        /* ── AI chip ──────────────────────────────────────── */
        .ai-chip-wrap { background:linear-gradient(135deg,#0D1B3E,#1E3A8A); padding:1.2rem 5%; border-bottom:1px solid rgba(255,255,255,0.06); }
        .ai-chip-inner { max-width:1100px; margin:0 auto; }
        .ai-chip-link { display:flex; align-items:center; justify-content:space-between; gap:12px; background:rgba(255,255,255,0.07); border:1.5px solid rgba(255,255,255,0.15); border-radius:16px; padding:14px 20px; text-decoration:none; transition:all 0.2s; }
        .ai-chip-link:hover { background:rgba(255,255,255,0.12); border-color:rgba(255,255,255,0.30); }

        /* ── Three Markets ────────────────────────────────── */
        .market-cards { display:flex; gap:1.5rem; align-items:stretch; min-height:420px; }
        .market-card { transition:all 0.28s ease; display:flex; flex-direction:column; }
        .market-card:hover { transform:translateY(-6px); }
        .market-card.business:hover { box-shadow:0 20px 50px rgba(201,168,76,0.18)!important; border-color:rgba(201,168,76,0.45)!important; }
        .market-card.campus:hover   { box-shadow:0 20px 50px rgba(56,120,255,0.15)!important; border-color:rgba(96,165,250,0.40)!important; }
        .market-card.vybe:hover     { box-shadow:0 20px 50px rgba(120,0,255,0.20)!important; border-color:rgba(200,123,255,0.45)!important; }

        /* ── Sponsored shops ──────────────────────────────── */
        .spons-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(210px,1fr)); gap:1.25rem; }
        .spons-card { background:#fff; border:1.5px solid #E2E8F0; border-radius:20px; padding:1.5rem 1.25rem; transition:all 0.25s; text-decoration:none; display:flex; flex-direction:column; }
        .spons-card:hover { transform:translateY(-4px); box-shadow:0 16px 40px rgba(15,23,42,0.10); border-color:rgba(201,168,76,0.30); }

        /* ── Responsive ───────────────────────────────────── */
        @media (max-width: 768px) {
          .sell-chip-card { gap:10px; }
          .sell-cta { width:100%; justify-content:center; }
          .market-cards { flex-direction:column!important; }
          .market-card  { min-height:300px!important; }
          .spons-grid { display:flex; overflow-x:auto; gap:1rem; padding-bottom:0.75rem; scroll-snap-type:x mandatory; -webkit-overflow-scrolling:touch; }
          .spons-card { min-width:195px; scroll-snap-align:start; flex-shrink:0; }
        }
      `}</style>

      <SiteNav />

      {/* ──────────────────────────────── START SELLING CHIP ─── */}
      <div className="sell-chip-wrap">
        <div className="sell-chip-inner">
          <div className="sell-chip-card">
            <div style={{ display:'flex',alignItems:'center',gap:12 }}>
              <div style={{ width:38,height:38,borderRadius:10,background:'linear-gradient(135deg,#2563EB,#3B82F6)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                <Store size={20} color="#fff" />
              </div>
              <div>
                <div style={{ fontWeight:700,color:'#fff',fontSize:'0.9rem' }}>{t('home.heroHeadline')}</div>
                <div style={{ fontSize:'0.72rem',color:'rgba(255,255,255,0.50)',marginTop:1 }}>ShopNekt · The Global Marketplace</div>
              </div>
            </div>
            <Link href="/open-store" className="sell-cta">
              {t('home.heroCta')} <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────── 360 AI CHIP ─── */}
      <div className="ai-chip-wrap">
        <div className="ai-chip-inner">
          <a href="/ai" className="ai-chip-link">
            <div style={{ display:'flex',alignItems:'center',gap:12 }}>
              <div style={{ width:38,height:38,borderRadius:10,background:'linear-gradient(135deg,#7C3AED,#A855F7)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                <Sparkles size={20} color="#fff" />
              </div>
              <div>
                <div style={{ fontWeight:700,color:'#fff',fontSize:'0.9rem' }}>Chat with 360 AI</div>
                <div style={{ fontSize:'0.72rem',color:'rgba(255,255,255,0.50)',marginTop:1 }}>{t('home.aiChipSub')}</div>
              </div>
            </div>
            <ArrowRight size={18} color="rgba(255,255,255,0.60)" />
          </a>
        </div>
      </div>

      {/* ──────────────────────────────── THREE MARKETS ─── */}
      <section style={{ background:'#FFFFFF',padding:'5rem 5%',borderBottom:'1px solid #E2E8F0' }}>
        <div style={{ maxWidth:'1100px',margin:'0 auto' }}>
          <div style={{ textAlign:'center',marginBottom:'2.5rem' }}>
            <div style={{ fontSize:'0.68rem',fontWeight:700,color:'#3B82F6',textTransform:'uppercase',letterSpacing:'0.18em',marginBottom:'0.5rem' }}>
              // {t('home.marketsLabel')}
            </div>
            <h2 style={{ fontFamily:"'Inter',sans-serif",fontSize:'clamp(1.5rem,3vw,2.2rem)',fontWeight:800,color:'#0F172A',margin:0 }}>
              {t('home.marketsThree')} <span style={{ color:'#C9A84C' }}>{t('home.platform')}</span>
            </h2>
          </div>

          <div className="market-cards">

            {/* Business Market */}
            <div className="market-card business" style={{ flex:1,background:'#FFFFFF',border:'2px solid rgba(201,168,76,0.20)',borderRadius:24,padding:'2.5rem 2rem',position:'relative',overflow:'hidden',boxShadow:'0 4px 20px rgba(15,23,42,0.06)' }}>
              <div style={{ position:'absolute',top:0,left:0,right:0,height:3,background:'linear-gradient(90deg,#C9A84C,#F0C96B)' }} />
              <div style={{ width:56,height:56,borderRadius:16,background:'linear-gradient(135deg,#040C32,#071545)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'1.4rem',boxShadow:'0 8px 20px rgba(5,11,46,0.20)' }}>
                <Store style={{ width:26,height:26,color:'#C9A84C' }} />
              </div>
              <div style={{ display:'flex',gap:'0.4rem',marginBottom:'1rem',flexWrap:'wrap' }}>
                <span style={{ fontSize:'0.62rem',fontWeight:800,background:'rgba(201,168,76,0.10)',color:'#A07830',padding:'0.2rem 0.65rem',borderRadius:999 }}>{t('home.premium')}</span>
                <span style={{ fontSize:'0.62rem',fontWeight:800,background:'rgba(15,23,42,0.06)',color:'#64748B',padding:'0.2rem 0.65rem',borderRadius:999 }}>{t('home.basic')}</span>
              </div>
              <h3 style={{ fontFamily:"'Inter',sans-serif",fontSize:'1.5rem',fontWeight:900,color:'#0F172A',marginBottom:'0.6rem',lineHeight:1.15 }}>{t('home.marketBadge')}</h3>
              <p style={{ fontSize:'0.85rem',color:'#64748B',lineHeight:1.72,marginBottom:'1.5rem' }}>{t('home.businessCardDesc')}</p>
              <div style={{ display:'flex',gap:'1.5rem',marginBottom:'1.75rem',paddingBottom:'1.5rem',borderBottom:'1px solid #F1F5F9' }}>
                {([['500',t('home.slots')],['5',t('home.regions')],['TZS 25K',t('home.basicMo')]] as [string,string][]).map(([v,l]) => (
                  <div key={l}>
                    <div style={{ fontFamily:"'Inter',sans-serif",fontSize:'1.2rem',fontWeight:900,color:'#0F172A',lineHeight:1 }}>{v}</div>
                    <div style={{ fontSize:'0.65rem',color:'#94A3B8',marginTop:2 }}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{ display:'flex',gap:'0.75rem',flexWrap:'wrap',marginTop:'auto' }}>
                <Link href="/market" style={{ display:'inline-flex',alignItems:'center',gap:'0.4rem',background:'#0F172A',color:'#fff',padding:'0.75rem 1.5rem',borderRadius:999,fontWeight:700,fontSize:'0.82rem',textDecoration:'none',boxShadow:'0 6px 16px rgba(15,23,42,0.22)' }}>
                  <Store size={14} /> {t('home.browseMarket')}
                </Link>
                <Link href="/login" style={{ display:'inline-flex',alignItems:'center',gap:'0.4rem',background:'#C9A84C',color:'#0F172A',padding:'0.75rem 1.5rem',borderRadius:999,fontWeight:700,fontSize:'0.82rem',textDecoration:'none',boxShadow:'0 6px 16px rgba(201,168,76,0.28)' }}>
                  {t('nav.login')} <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            {/* Campus Market */}
            <div className="market-card campus" style={{ flex:1,background:'linear-gradient(160deg,#040C32 0%,#071545 50%,#0A1858 100%)',border:'2px solid rgba(56,120,255,0.18)',borderRadius:24,padding:'2.5rem 2rem',position:'relative',overflow:'hidden',boxShadow:'0 4px 20px rgba(5,11,46,0.18)' }}>
              <div style={{ position:'absolute',top:0,left:0,right:0,height:3,background:'linear-gradient(90deg,#3B82F6,#93C5FD)' }} />
              <div style={{ position:'absolute',top:'-30%',right:'-20%',width:'70%',height:'100%',background:'radial-gradient(ellipse at center,rgba(56,120,255,0.22) 0%,transparent 65%)',filter:'blur(20px)',pointerEvents:'none' }} />
              <div style={{ position:'relative',zIndex:1,width:56,height:56,borderRadius:16,background:'rgba(59,130,246,0.15)',border:'1px solid rgba(96,165,250,0.25)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'0.85rem' }}>
                <GraduationCap style={{ width:26,height:26,color:'#93C5FD' }} />
              </div>
              <div style={{ position:'relative',zIndex:1,display:'flex',gap:'0.4rem',marginBottom:'1rem',flexWrap:'wrap' }}>
                <span style={{ fontSize:'0.62rem',fontWeight:800,background:'rgba(59,130,246,0.15)',color:'#93C5FD',padding:'0.2rem 0.65rem',borderRadius:999 }}>{t('home.studentsOnly')}</span>
                <span style={{ fontSize:'0.62rem',fontWeight:800,background:'rgba(5,150,105,0.15)',color:'#86EFAC',padding:'0.2rem 0.65rem',borderRadius:999 }}>{t('home.verified')}</span>
              </div>
              <h3 style={{ position:'relative',zIndex:1,fontFamily:"'Inter',sans-serif",fontSize:'1.5rem',fontWeight:900,color:'#fff',marginBottom:'0.6rem',lineHeight:1.15 }}>{t('home.campusBadge')}</h3>
              <p style={{ position:'relative',zIndex:1,fontSize:'0.85rem',color:'rgba(255,255,255,0.50)',lineHeight:1.72,marginBottom:'1.5rem' }}>{t('home.campusCardDesc')}</p>
              <div style={{ position:'relative',zIndex:1,display:'flex',gap:'1.5rem',marginBottom:'1.75rem',paddingBottom:'1.5rem',borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
                {([['5',t('home.uniCount')],['300',t('home.totalSlots')],['TZS 10K',t('home.perMonth')]] as [string,string][]).map(([v,l]) => (
                  <div key={l}>
                    <div style={{ fontFamily:"'Inter',sans-serif",fontSize:'1.2rem',fontWeight:900,color:'#C9A84C',lineHeight:1 }}>{v}</div>
                    <div style={{ fontSize:'0.65rem',color:'rgba(255,255,255,0.35)',marginTop:2 }}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{ position:'relative',zIndex:1,display:'flex',gap:'0.75rem',flexWrap:'wrap',marginTop:'auto' }}>
                <Link href="/campus" style={{ display:'inline-flex',alignItems:'center',gap:'0.4rem',background:'rgba(255,255,255,0.10)',color:'#fff',border:'1px solid rgba(255,255,255,0.18)',padding:'0.75rem 1.5rem',borderRadius:999,fontWeight:600,fontSize:'0.82rem',textDecoration:'none' }}>
                  <GraduationCap size={14} /> {t('home.browseCampus')}
                </Link>
                <Link href="/login" style={{ display:'inline-flex',alignItems:'center',gap:'0.4rem',background:'#C9A84C',color:'#0F172A',padding:'0.75rem 1.5rem',borderRadius:999,fontWeight:700,fontSize:'0.82rem',textDecoration:'none',boxShadow:'0 6px 16px rgba(201,168,76,0.28)' }}>
                  {t('nav.login')} <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            {/* Social Vybe */}
            <div className="market-card vybe" style={{ flex:1,background:'linear-gradient(160deg,#0D0015 0%,#1A0030 50%,#12001F 100%)',border:'2px solid rgba(200,123,255,0.20)',borderRadius:24,padding:'2.5rem 2rem',position:'relative',overflow:'hidden',boxShadow:'0 4px 20px rgba(120,0,255,0.15)' }}>
              <div style={{ position:'absolute',top:0,left:0,right:0,height:3,background:'linear-gradient(90deg,#FF0080,#7800FF,#00C8FF)' }} />
              <div style={{ position:'absolute',top:'-30%',right:'-20%',width:'70%',height:'100%',background:'radial-gradient(ellipse at center,rgba(120,0,255,0.18) 0%,transparent 65%)',filter:'blur(20px)',pointerEvents:'none' }} />
              <div style={{ position:'relative',zIndex:1,width:56,height:56,borderRadius:16,background:'rgba(200,123,255,0.12)',border:'1px solid rgba(200,123,255,0.25)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'0.85rem' }}>
                <Sparkles style={{ width:26,height:26,color:'#C87BFF' }} />
              </div>
              <div style={{ position:'relative',zIndex:1,display:'flex',gap:'0.4rem',marginBottom:'1rem',flexWrap:'wrap' }}>
                <span style={{ fontSize:'0.62rem',fontWeight:800,background:'rgba(255,0,128,0.12)',color:'#FF80B5',padding:'0.2rem 0.65rem',borderRadius:999 }}>Social</span>
                <span style={{ fontSize:'0.62rem',fontWeight:800,background:'rgba(120,0,255,0.12)',color:'#C87BFF',padding:'0.2rem 0.65rem',borderRadius:999 }}>Live</span>
              </div>
              <h3 style={{ position:'relative',zIndex:1,fontFamily:"'Inter',sans-serif",fontSize:'1.5rem',fontWeight:900,color:'#fff',marginBottom:'0.6rem',lineHeight:1.15 }}>Social Vybe</h3>
              <p style={{ position:'relative',zIndex:1,fontSize:'0.85rem',color:'rgba(255,255,255,0.45)',lineHeight:1.72,marginBottom:'1.5rem' }}>{t('home.vybeCardDesc')}</p>
              <div style={{ position:'relative',zIndex:1,display:'flex',gap:'1.5rem',marginBottom:'1.75rem',paddingBottom:'1.5rem',borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
                {([['POST',t('home.dailyContent')],['LIKE',t('home.realEngagement')],['SELL',t('home.directToBuyers')]] as [string,string][]).map(([v,l]) => (
                  <div key={l}>
                    <div style={{ fontFamily:"'Inter',sans-serif",fontSize:'1.1rem',fontWeight:900,color:'#C87BFF',lineHeight:1 }}>{v}</div>
                    <div style={{ fontSize:'0.65rem',color:'rgba(255,255,255,0.30)',marginTop:2 }}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{ position:'relative',zIndex:1,display:'flex',gap:'0.75rem',flexWrap:'wrap',marginTop:'auto' }}>
                <Link href="/vybe" style={{ display:'inline-flex',alignItems:'center',gap:'0.4rem',background:'linear-gradient(135deg,#FF0080,#7800FF)',color:'#fff',padding:'0.75rem 1.5rem',borderRadius:999,fontWeight:700,fontSize:'0.82rem',textDecoration:'none' }}>
                  {t('home.exploreVybe')}
                </Link>
                <Link href="/vybe" style={{ display:'inline-flex',alignItems:'center',gap:'0.4rem',background:'rgba(255,255,255,0.07)',color:'#fff',border:'1px solid rgba(255,255,255,0.12)',padding:'0.75rem 1.5rem',borderRadius:999,fontWeight:600,fontSize:'0.82rem',textDecoration:'none' }}>
                  {t('home.postVybe')} <ArrowRight size={13} />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ──────────────────────────────── FEATURED SPONSORED SHOPS ─── */}
      {sponsored.length > 0 && (
        <section style={{ background:'#F8FAFF',padding:'3.5rem 5%',borderBottom:'1px solid #E2E8F0' }}>
          <div style={{ maxWidth:'1100px',margin:'0 auto' }}>
            <div style={{ textAlign:'center',marginBottom:'2rem' }}>
              <div style={{ fontSize:'0.68rem',fontWeight:700,color:'#C9A84C',textTransform:'uppercase',letterSpacing:'0.18em',marginBottom:'0.5rem' }}>
                // {t('home.sponsoredLabel')}
              </div>
              <h2 style={{ fontFamily:"'Inter',sans-serif",fontSize:'clamp(1.4rem,3vw,2rem)',fontWeight:800,color:'#0F172A',margin:0 }}>
                {t('home.sponsoredTitle')}
              </h2>
            </div>

            <div className="spons-grid">
              {sponsored.map(shop => (
                <a
                  key={shop.id}
                  href={shop.shop_slug ? `/store/${shop.shop_slug}` : '#'}
                  className="spons-card"
                >
                  {/* Logo */}
                  <div style={{ width:52,height:52,borderRadius:14,background:'linear-gradient(135deg,#040C32,#071545)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'1rem',overflow:'hidden',flexShrink:0 }}>
                    {shop.logo_url
                      ? <img src={shop.logo_url} alt={shop.shop_name} style={{ width:'100%',height:'100%',objectFit:'cover' }} loading="lazy" />
                      : <span style={{ fontSize:'1.2rem',fontWeight:900,color:'#C9A84C' }}>{shop.shop_name.charAt(0)}</span>
                    }
                  </div>

                  {/* Sponsored badge */}
                  <div style={{ display:'inline-flex',alignItems:'center',gap:4,background:'rgba(201,168,76,0.10)',border:'1px solid rgba(201,168,76,0.22)',borderRadius:999,padding:'0.15rem 0.55rem',marginBottom:'0.65rem' }}>
                    <BadgeCheck size={11} style={{ color:'#C9A84C' }} />
                    <span style={{ fontSize:'0.6rem',fontWeight:700,color:'#A07830' }}>{t('home.sponsoredBadge')}</span>
                  </div>

                  <div style={{ fontWeight:700,fontSize:'0.92rem',color:'#0F172A',marginBottom:'0.2rem',lineHeight:1.3 }}>{shop.shop_name}</div>
                  {shop.shop_category && (
                    <div style={{ fontSize:'0.7rem',color:'#94A3B8',marginBottom:'1rem' }}>{shop.shop_category}</div>
                  )}

                  {/* CTA */}
                  <div style={{ display:'inline-flex',alignItems:'center',gap:'0.3rem',background:'#0F172A',color:'#fff',padding:'0.5rem 1rem',borderRadius:999,fontWeight:600,fontSize:'0.76rem',marginTop:'auto' }}>
                    {t('home.visitShop')} <ExternalLink size={11} />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      <SiteFooter />
    </main>
  )
}
// ── (illustration removed — hero replaced with compact chip) ─────────────────
function _unused() {
  return (
    <svg
      viewBox="0 0 520 430"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width:'100%',maxWidth:500,height:'auto' }}
      aria-hidden="true"
    >
      {/* Background blob */}
      <ellipse cx="264" cy="218" rx="218" ry="188" fill="#EBF0FF" />

      {/* ── Laptop body ── */}
      <rect x="92" y="68" width="312" height="212" rx="20" fill="#0D1B3E" />
      <rect x="108" y="84" width="280" height="180" rx="12" fill="#142040" />

      {/* Screen top-bar */}
      <rect x="108" y="84" width="280" height="36" rx="12" fill="#C9A84C" />
      {/* Traffic-light dots */}
      <circle cx="126" cy="102" r="6" fill="rgba(255,255,255,0.35)" />
      <circle cx="144" cy="102" r="6" fill="rgba(255,255,255,0.35)" />
      <circle cx="162" cy="102" r="6" fill="rgba(255,255,255,0.35)" />
      {/* URL bar */}
      <rect x="178" y="94" width="148" height="16" rx="8" fill="rgba(255,255,255,0.18)" />
      <rect x="186" y="99" width="80" height="6" rx="3" fill="rgba(255,255,255,0.40)" />

      {/* Product grid on screen */}
      <rect x="116" y="132" width="80" height="64" rx="10" fill="rgba(255,255,255,0.07)" />
      <rect x="204" y="132" width="80" height="64" rx="10" fill="rgba(255,255,255,0.07)" />
      <rect x="292" y="132" width="88" height="64" rx="10" fill="rgba(255,255,255,0.07)" />
      {/* Product thumbnails */}
      <rect x="124" y="140" width="36" height="32" rx="6" fill="rgba(201,168,76,0.35)" />
      <rect x="124" y="178" width="64" height="8" rx="4" fill="rgba(255,255,255,0.18)" />
      <rect x="124" y="190" width="44" height="6" rx="3" fill="rgba(201,168,76,0.55)" />
      <rect x="212" y="140" width="36" height="32" rx="6" fill="rgba(96,165,250,0.30)" />
      <rect x="212" y="178" width="64" height="8" rx="4" fill="rgba(255,255,255,0.18)" />
      <rect x="212" y="190" width="44" height="6" rx="3" fill="rgba(96,165,250,0.50)" />
      <rect x="300" y="140" width="36" height="32" rx="6" fill="rgba(200,123,255,0.30)" />
      <rect x="300" y="178" width="64" height="8" rx="4" fill="rgba(255,255,255,0.18)" />
      <rect x="300" y="190" width="44" height="6" rx="3" fill="rgba(200,123,255,0.50)" />

      {/* Revenue bar chart */}
      <rect x="116" y="206" width="264" height="50" rx="8" fill="rgba(255,255,255,0.04)" />
      <rect x="126" y="222" width="28" height="26" rx="4" fill="rgba(201,168,76,0.55)" />
      <rect x="162" y="228" width="28" height="20" rx="4" fill="rgba(201,168,76,0.38)" />
      <rect x="198" y="218" width="28" height="30" rx="4" fill="rgba(201,168,76,0.72)" />
      <rect x="234" y="224" width="28" height="24" rx="4" fill="rgba(201,168,76,0.48)" />
      <rect x="270" y="214" width="28" height="34" rx="4" fill="rgba(201,168,76,0.90)" />
      <rect x="306" y="220" width="28" height="28" rx="4" fill="rgba(201,168,76,0.62)" />
      <rect x="342" y="217" width="28" height="31" rx="4" fill="rgba(201,168,76,0.80)" />

      {/* Laptop stand + base */}
      <rect x="214" y="280" width="68" height="16" rx="7" fill="#0A1530" />
      <rect x="182" y="294" width="132" height="10" rx="5" fill="#08112A" />

      {/* ── Floating card — top-left ── */}
      <g filter="url(#sh)">
        <rect x="16" y="52" width="122" height="94" rx="16" fill="white" />
        <rect x="28" y="64" width="40" height="40" rx="10" fill="#EEF3FF" />
        {/* product icon */}
        <rect x="36" y="72" width="24" height="24" rx="5" fill="#C9A84C" opacity="0.70" />
        <rect x="76" y="68" width="52" height="10" rx="5" fill="#E2E8F0" />
        <rect x="76" y="84" width="36" height="8" rx="4" fill="#E2E8F0" />
        <rect x="76" y="98" width="28" height="8" rx="4" fill="#C9A84C" opacity="0.60" />
        {/* CTA button row */}
        <rect x="28" y="116" width="96" height="22" rx="11" fill="#C9A84C" />
        <text x="76" y="131" textAnchor="middle" fontFamily="Inter,sans-serif" fontWeight="800" fontSize="10" fill="#0F172A">Start Selling</text>
      </g>

      {/* ── Floating card — top-right ── */}
      <g filter="url(#sh)">
        <rect x="366" y="40" width="118" height="82" rx="16" fill="white" />
        <rect x="378" y="52" width="36" height="36" rx="10" fill="#F0F4FF" />
        <rect x="380" y="56" width="32" height="28" rx="6" fill="#3B82F6" opacity="0.25" />
        <rect x="422" y="56" width="52" height="9" rx="4" fill="#E2E8F0" />
        <rect x="422" y="71" width="38" height="8" rx="4" fill="#E2E8F0" />
        <rect x="378" y="98" width="98" height="16" rx="8" fill="rgba(13,27,62,0.06)" />
        <text x="427" y="109" textAnchor="middle" fontFamily="Inter,sans-serif" fontWeight="700" fontSize="8.5" fill="#0D1B3E">✓ Verified Store</text>
      </g>

      {/* ── Stats chip — bottom-left ── */}
      <g filter="url(#sh)">
        <rect x="14" y="290" width="128" height="58" rx="16" fill="white" />
        <text x="28" y="318" fontFamily="Inter,sans-serif" fontWeight="900" fontSize="22" fill="#0D1B3E">500+</text>
        <text x="28" y="338" fontFamily="Inter,sans-serif" fontWeight="500" fontSize="10.5" fill="#64748B">Active Shops</text>
      </g>

      {/* ── Gold badge — bottom-right ── */}
      <g filter="url(#sh)">
        <rect x="364" y="298" width="120" height="44" rx="22" fill="#C9A84C" />
        <text x="424" y="322" textAnchor="middle" fontFamily="Inter,sans-serif" fontWeight="800" fontSize="12" fill="#0F172A">✦ ShopNekt</text>
        <text x="424" y="336" textAnchor="middle" fontFamily="Inter,sans-serif" fontWeight="500" fontSize="9" fill="rgba(15,23,42,0.55)">Global Marketplace</text>
      </g>

      <defs>
        <filter id="sh" x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#0F172A" floodOpacity="0.10" />
        </filter>
      </defs>
    </svg>
  )
}
