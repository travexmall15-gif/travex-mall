'use client'
import { useState, useEffect } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import Link from 'next/link'
import { ArrowRight, Store, Sparkles, BadgeCheck, ExternalLink } from 'lucide-react'
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
        if (!error && data && data.length > 0) {setSponsored(data)}
      } catch { /* column may not exist yet — section stays hidden */ }
    })()
  }, [])

  return (
    <main style={{ fontFamily: 'var(--sn-font)', background: 'var(--sn-page)', overflowX: 'hidden', paddingTop: '118px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }

        .sell-chip-wrap { background:#fff; padding:1.2rem 5%; border-bottom:1px solid #F3F4F6; }
        .sell-chip-inner { max-width:1100px; margin:0 auto; }
        .sell-chip-card { display:flex; align-items:center; justify-content:space-between; gap:16px; background:#fff; border:1.5px solid #E5E7EB; border-radius:16px; padding:14px 20px; flex-wrap:wrap; transition:border-color 0.2s,box-shadow 0.2s; }
        .sell-chip-card:hover { border-color:#D1D5DB; box-shadow:0 4px 16px rgba(0,0,0,0.06); }
        .sell-cta { display:inline-flex; align-items:center; gap:0.45rem; background:#111827; color:#fff; padding:0.55rem 1.35rem; border-radius:999px; font-weight:800; font-size:0.82rem; text-decoration:none; white-space:nowrap; transition:all 0.2s; flex-shrink:0; }
        .sell-cta:hover { background:#374151; transform:translateY(-1px); box-shadow:0 6px 18px rgba(29,78,216,0.30); }

        .ai-chip-wrap { background:#fff; padding:1.2rem 5%; border-bottom:1px solid #F3F4F6; }
        .ai-chip-inner { max-width:1100px; margin:0 auto; }
        .ai-chip-link { display:flex; align-items:center; justify-content:space-between; gap:12px; background:#fff; border:1.5px solid #E5E7EB; border-radius:16px; padding:14px 20px; text-decoration:none; transition:all 0.2s; }
        .ai-chip-link:hover { background:#F9FAFB; border-color:#D1D5DB; box-shadow:0 4px 12px rgba(0,0,0,0.05); }

        .market-cards { display:flex; gap:1.5rem; align-items:stretch; min-height:420px; }
        .market-card { transition:all 0.28s ease; display:flex; flex-direction:column; }
        .market-card:hover { transform:translateY(-6px); }
        .market-card.business:hover { box-shadow:0 20px 50px rgba(29,78,216,0.18)!important; border-color:rgba(29,78,216,0.45)!important; }
        .market-card.vybe:hover     { box-shadow:0 20px 50px rgba(120,0,255,0.20)!important; border-color:rgba(200,123,255,0.45)!important; }

        .spons-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(210px,1fr)); gap:1.25rem; }
        .spons-card { background:#fff; border:1.5px solid #E2E8F0; border-radius:20px; padding:1.5rem 1.25rem; transition:all 0.25s; text-decoration:none; display:flex; flex-direction:column; }
        .spons-card:hover { transform:translateY(-4px); box-shadow:0 16px 40px rgba(15,23,42,0.10); border-color:rgba(29,78,216,0.30); }

        @media (max-width: 768px) {
          .sell-chip-card { gap:10px; }
          .sell-cta { width:100%; justify-content:center; }
          .market-cards { flex-direction:column!important; }
          .market-card  { min-height:300px!important; }
          .spons-grid { display:flex; overflow-x:auto; gap:1rem; padding-bottom:0.75rem; scroll-snap-type:x mandatory; -webkit-overflow-scrolling:touch; }
          .spons-card { min-width:195px; scroll-snap-align:start; flex-shrink:0; }
        }
      `}</style>
      {/* START SELLING CHIP */}
      <div className="sell-chip-wrap">
        <div className="sell-chip-inner">
          <div className="sell-chip-card">
            <div style={{ display:'flex',alignItems:'center',gap:12 }}>
              <div style={{ width:38,height:38,borderRadius:10,background:'#1E3A8A',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                <Store size={20} color="#fff" />
              </div>
              <div>
                <div style={{ fontWeight:700,color:'#374151',fontSize:'0.9rem' }}>{t('home.heroHeadline')}</div>
                <div style={{ fontSize:'0.72rem',color:'#6B7280',marginTop:1 }}>ShopNekt · The Global Marketplace</div>
              </div>
            </div>
            <Link href="/open-store" className="sell-cta">
              {t('home.heroCta')} <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* AI CHIP */}
      <div className="ai-chip-wrap">
        <div className="ai-chip-inner">
          <a href="/aiv" className="ai-chip-link">
            <div style={{ display:'flex',alignItems:'center',gap:12 }}>
              <div style={{ width:38,height:38,borderRadius:10,background:'linear-gradient(135deg,#7C3AED,#A855F7)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                <Sparkles size={20} color="#fff" />
              </div>
              <div>
                <div style={{ fontWeight:700,color:'#374151',fontSize:'0.9rem' }}>Chat with 360 AI</div>
                <div style={{ fontSize:'0.72rem',color:'#6B7280',marginTop:1 }}>{t('home.aiChipSub')}</div>
              </div>
            </div>
            <ArrowRight size={18} color="#fff" />
          </a>
        </div>
      </div>

      {/* TWO MARKETS */}
      <section style={{ background:'var(--sn-bg)',padding:'5rem 5%',borderBottom:'1px solid #E2E8F0' }}>
        <div style={{ maxWidth:'900px',margin:'0 auto' }}>
          <div style={{ textAlign:'center',marginBottom:'2.5rem' }}>
            <div style={{ fontSize:'0.68rem',fontWeight:700,color:'#3B82F6',textTransform:'uppercase',letterSpacing:'0.18em',marginBottom:'0.5rem' }}>
              // {t('home.marketsLabel')}
            </div>
            <h2 style={{ fontFamily:"'Inter',sans-serif",fontSize:'clamp(1.5rem,3vw,2.2rem)',fontWeight:800,color:'#111827',margin:0 }}>
              {t('home.marketsThree')} <span style={{ color:'#111827' }}>{t('home.platform')}</span>
            </h2>
          </div>

          <div className="market-cards">

            {/* Business Market */}
            <div className="market-card business" style={{ flex:1,background:'var(--sn-bg)',border:'2px solid rgba(29,78,216,0.20)',borderRadius:24,padding:'2.5rem 2rem',position:'relative',overflow:'hidden',boxShadow:'0 4px 20px rgba(15,23,42,0.06)' }}>
              <div style={{ position:'absolute',top:0,left:0,right:0,height:3,background:'linear-gradient(90deg,#1D4ED8,#F0C96B)' }} />
              <div style={{ width:56,height:56,borderRadius:16,background:'linear-gradient(135deg,#040C32,#071545)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'1.4rem',boxShadow:'0 8px 20px rgba(5,11,46,0.20)' }}>
                <Store style={{ width:26,height:26,color:'#111827' }} />
              </div>
              <div style={{ display:'flex',gap:'0.4rem',marginBottom:'1rem',flexWrap:'wrap' }}>
                <span style={{ fontSize:'0.62rem',fontWeight:800,background:'rgba(29,78,216,0.10)',color:'#A07830',padding:'0.2rem 0.65rem',borderRadius:999 }}>{t('home.premium')}</span>
                <span style={{ fontSize:'0.62rem',fontWeight:800,background:'rgba(15,23,42,0.06)',color:'#6B7280',padding:'0.2rem 0.65rem',borderRadius:999 }}>{t('home.basic')}</span>
              </div>
              <h3 style={{ fontFamily:"'Inter',sans-serif",fontSize:'1.5rem',fontWeight:900,color:'#111827',marginBottom:'0.6rem',lineHeight:1.15 }}>Business Marketplaces</h3>
              <p style={{ fontSize:'0.85rem',color:'#6B7280',lineHeight:1.72,marginBottom:'1.5rem' }}>{t('home.businessCardDesc')}</p>
              <div style={{ display:'flex',gap:'1.5rem',marginBottom:'1.75rem',paddingBottom:'1.5rem',borderBottom:'1px solid #F1F5F9' }}>
                {([['5',t('home.regions')],['TZS 25K',t('home.basicMo')]] as [string,string][]).map(([v,l]) => (
                  <div key={l}>
                    <div style={{ fontFamily:"'Inter',sans-serif",fontSize:'1.2rem',fontWeight:900,color:'#111827',lineHeight:1 }}>{v}</div>
                    <div style={{ fontSize:'0.65rem',color:'rgba(255,255,255,0.55)',marginTop:2 }}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{ display:'flex',gap:'0.75rem',flexWrap:'wrap',marginTop:'auto' }}>
                <Link href="/market" style={{ display:'inline-flex',alignItems:'center',gap:'0.4rem',background:'#0F172A',color:'#fff',padding:'0.75rem 1.5rem',borderRadius:999,fontWeight:700,fontSize:'0.82rem',textDecoration:'none',boxShadow:'0 6px 16px rgba(15,23,42,0.22)' }}>
                  <Store size={14} /> {t('home.browseMarket')}
                </Link>
                <Link href="/login" style={{ display:'inline-flex',alignItems:'center',gap:'0.4rem',background:'linear-gradient(135deg,#FF0080,#7800FF)',color:'#fff',padding:'0.75rem 1.5rem',borderRadius:999,fontWeight:700,fontSize:'0.82rem',textDecoration:'none',boxShadow:'0 6px 16px rgba(120,0,255,0.28)' }}>
                  {t('nav.login')} <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            {/* Social Vybe */}
            <div className="market-card vybe" style={{ flex:1,background:'linear-gradient(160deg,#0D0015 0%,#1A0030 50%,#12001F 100%)',border:'2px solid rgba(200,123,255,0.20)',borderRadius:24,padding:'2.5rem 2rem',position:'relative',overflow:'hidden',boxShadow:'0 4px 20px rgba(120,0,255,0.15)' }}>
              <div style={{ position:'absolute',top:0,left:0,right:0,height:3,background:'linear-gradient(90deg,#FF0080,#7800FF,#00C8FF)' }} />
              <div style={{ position:'absolute',top:'-30%',right:'-20%',width:'70%',height:'100%',background:'radial-gradient(ellipse at center,rgba(120,0,255,0.18) 0%,transparent 65%)',filter:'blur(20px)',pointerEvents:'none' }} />
              <div style={{ position:'relative',zIndex:1,width:56,height:56,borderRadius:16,background:'rgba(200,123,255,0.25)',border:'1px solid rgba(200,123,255,0.45)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'0.85rem' }}>
                <Sparkles style={{ width:26,height:26,color:'#fff' }} />
              </div>
              <div style={{ position:'relative',zIndex:1,display:'flex',gap:'0.4rem',marginBottom:'1rem',flexWrap:'wrap' }}>
                <span style={{ fontSize:'0.62rem',fontWeight:800,background:'rgba(255,0,128,0.30)',color:'#fff',padding:'0.2rem 0.65rem',borderRadius:999 }}>Social</span>
                <span style={{ fontSize:'0.62rem',fontWeight:800,background:'rgba(120,0,255,0.30)',color:'#fff',padding:'0.2rem 0.65rem',borderRadius:999 }}>Live</span>
              </div>
              <h3 style={{ position:'relative',zIndex:1,fontFamily:"'Inter',sans-serif",fontSize:'1.5rem',fontWeight:900,color:'#fff',marginBottom:'0.6rem',lineHeight:1.15 }}>Social Vybe</h3>
              <p style={{ position:'relative',zIndex:1,fontSize:'0.85rem',color:'rgba(255,255,255,0.72)',lineHeight:1.72,marginBottom:'1.5rem' }}>{t('home.vybeCardDesc')}</p>
              <div style={{ position:'relative',zIndex:1,display:'flex',gap:'1.5rem',marginBottom:'1.75rem',paddingBottom:'1.5rem',borderBottom:'1px solid rgba(255,255,255,0.12)' }}>
                {([['POST',t('home.dailyContent')],['LIKE',t('home.realEngagement')],['SELL',t('home.directToBuyers')]] as [string,string][]).map(([v,l]) => (
                  <div key={l}>
                    <div style={{ fontFamily:"'Inter',sans-serif",fontSize:'1.1rem',fontWeight:900,color:'#fff',lineHeight:1 }}>{v}</div>
                    <div style={{ fontSize:'0.65rem',color:'rgba(255,255,255,0.55)',marginTop:2 }}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{ position:'relative',zIndex:1,display:'flex',gap:'0.75rem',flexWrap:'wrap',marginTop:'auto' }}>
                <Link href="/vybe" style={{ display:'inline-flex',alignItems:'center',gap:'0.4rem',background:'linear-gradient(135deg,#FF0080,#7800FF)',color:'#fff',padding:'0.75rem 1.5rem',borderRadius:999,fontWeight:700,fontSize:'0.82rem',textDecoration:'none' }}>
                  {t('home.exploreVybe')}
                </Link>
                <Link href="/vybe" style={{ display:'inline-flex',alignItems:'center',gap:'0.4rem',background:'rgba(255,255,255,0.12)',color:'#fff',border:'1px solid rgba(255,255,255,0.2)',padding:'0.75rem 1.5rem',borderRadius:999,fontWeight:600,fontSize:'0.82rem',textDecoration:'none' }}>
                  {t('home.postVybe')} <ArrowRight size={13} />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FEATURED SPONSORED SHOPS */}
      {sponsored.length > 0 && (
        <section style={{ background:'#F8FAFF',padding:'3.5rem 5%',borderBottom:'1px solid #E2E8F0' }}>
          <div style={{ maxWidth:'1100px',margin:'0 auto' }}>
            <div style={{ textAlign:'center',marginBottom:'2rem' }}>
              <div style={{ fontSize:'0.68rem',fontWeight:700,color:'#111827',textTransform:'uppercase',letterSpacing:'0.18em',marginBottom:'0.5rem' }}>
                // {t('home.sponsoredLabel')}
              </div>
              <h2 style={{ fontFamily:"'Inter',sans-serif",fontSize:'clamp(1.4rem,3vw,2rem)',fontWeight:800,color:'#111827',margin:0 }}>
                {t('home.sponsoredTitle')}
              </h2>
            </div>
            <div className="spons-grid">
              {sponsored.map(shop => (
                <a key={shop.id} href={shop.shop_slug ? `/store/${shop.shop_slug}` : '#'} className="spons-card">
                  <div style={{ width:52,height:52,borderRadius:14,background:'linear-gradient(135deg,#040C32,#071545)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'1rem',overflow:'hidden',flexShrink:0 }}>
                    {shop.logo_url
                      ? <img src={shop.logo_url} alt={shop.shop_name} style={{ width:'100%',height:'100%',objectFit:'cover' }} loading="lazy" />
                      : <span style={{ fontSize:'1.2rem',fontWeight:900,color:'#111827' }}>{shop.shop_name.charAt(0)}</span>
                    }
                  </div>
                  <div style={{ display:'inline-flex',alignItems:'center',gap:4,background:'rgba(29,78,216,0.10)',border:'1px solid rgba(29,78,216,0.22)',borderRadius:999,padding:'0.15rem 0.55rem',marginBottom:'0.65rem' }}>
                    <BadgeCheck size={11} style={{ color:'#111827' }} />
                    <span style={{ fontSize:'0.6rem',fontWeight:700,color:'#A07830' }}>{t('home.sponsoredBadge')}</span>
                  </div>
                  <div style={{ fontWeight:700,fontSize:'0.92rem',color:'#111827',marginBottom:'0.2rem',lineHeight:1.3 }}>{shop.shop_name}</div>
                  {shop.shop_category && (
                    <div style={{ fontSize:'0.7rem',color:'#9CA3AF',marginBottom:'1rem' }}>{shop.shop_category}</div>
                  )}
                  <div style={{ display:'inline-flex',alignItems:'center',gap:'0.3rem',background:'#0F172A',color:'#fff',padding:'0.5rem 1rem',borderRadius:999,fontWeight:600,fontSize:'0.76rem',marginTop:'auto' }}>
                    {t('home.visitShop')} <ExternalLink size={11} />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
