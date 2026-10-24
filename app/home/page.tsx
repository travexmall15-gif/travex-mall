'use client'
import { useState, useEffect } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import Link from 'next/link'
import { ArrowRight, Store, Sparkles, BriefcaseBusiness, Search, ShoppingBag } from 'lucide-react'
import { listMarketplaceProducts, type ProductSearchResult } from '@/lib/search'

type SponsoredShop = {
  id: string
  shop_name: string
  shop_category: string | null
  shop_city: string | null
  shop_logo_url: string | null
  selected_template: string | null
  webstore_status: string | null
}

export default function HomePage() {
  const { t } = useTranslation()
  const [sponsored, setSponsored] = useState<SponsoredShop[]>([])
  const [products, setProducts] = useState<ProductSearchResult[]>([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [productsError, setProductsError] = useState(false)

  useEffect(() => {
    ;(async () => {
      const [sponsoredResult, productResult] = await Promise.allSettled([
        fetch('/api/public/market?type=sponsored&limit=12', { cache: 'no-store' }).then(async response => {
          if (!response.ok) {throw new Error('Featured brands are unavailable.')}
          const result = await response.json().catch(() => null)
          return Array.isArray(result?.shops) ? result.shops as SponsoredShop[] : []
        }),
        listMarketplaceProducts(8),
      ])
      if (sponsoredResult.status === 'fulfilled') {setSponsored(sponsoredResult.value)}
      if (productResult.status === 'fulfilled') {setProducts(productResult.value)}
      else {setProductsError(true)}
      setProductsLoading(false)
    })()
  }, [])

  return (
    <main style={{ fontFamily: 'var(--sn-font)', background: 'var(--sn-page)', overflowX: 'hidden', paddingTop: '118px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }

        .featured-brand-wrap { background:var(--sn-bg); padding:1.1rem 5%; border-bottom:1px solid var(--sn-border); }
        .featured-brand-inner { max-width:1100px; margin:0 auto; }
        .featured-brand-heading { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:0.75rem; }
        .featured-brand-track { display:flex; gap:12px; overflow-x:auto; padding:2px 2px 10px; scroll-snap-type:x mandatory; -webkit-overflow-scrolling:touch; }
        .featured-brand-card { width:184px; min-width:184px; min-height:122px; display:flex; flex-direction:column; align-items:flex-start; justify-content:center; gap:8px; padding:14px; border:1px solid var(--sn-border); border-radius:16px; background:var(--sn-bg); text-decoration:none; color:var(--sn-text); scroll-snap-align:start; }
        .featured-brand-card:hover { border-color:var(--sn-border-strong); box-shadow:0 4px 16px rgba(0,0,0,.06); }
        .featured-brand-avatar { width:42px; height:42px; border-radius:12px; overflow:hidden; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:800; background:var(--sn-btn-bg); }
        .featured-brand-avatar img { width:100%; height:100%; object-fit:cover; }
        .sell-chip-wrap { background:#fff; padding:1.2rem 5%; border-bottom:1px solid #F3F4F6; }
        .sell-chip-inner { max-width:1100px; margin:0 auto; }
        .sell-chip-card { display:flex; align-items:center; justify-content:space-between; gap:16px; background:#fff; border:1.5px solid #E5E7EB; border-radius:16px; padding:14px 20px; flex-wrap:wrap; transition:border-color 0.2s,box-shadow 0.2s; }
        .sell-chip-card:hover { border-color:#D1D5DB; box-shadow:0 4px 16px rgba(0,0,0,0.06); }
        .sell-cta { display:inline-flex; align-items:center; gap:0.45rem; background:linear-gradient(135deg,#FF0080,#7800FF); color:#fff; padding:0.55rem 1.35rem; border-radius:999px; font-weight:800; font-size:0.82rem; text-decoration:none; white-space:nowrap; transition:all 0.2s; flex-shrink:0; }
        .sell-cta:hover { filter:brightness(1.08); transform:translateY(-1px); box-shadow:0 6px 18px rgba(120,0,255,0.30); }

        .ai-chip-wrap { background:#fff; padding:1.2rem 5%; border-bottom:1px solid #F3F4F6; }
        .ai-chip-inner { max-width:1100px; margin:0 auto; }
        .ai-chip-link { display:flex; align-items:center; justify-content:space-between; gap:12px; background:#fff; border:1.5px solid #E5E7EB; border-radius:16px; padding:14px 20px; text-decoration:none; transition:all 0.2s; }
        .ai-chip-link:hover { background:#F9FAFB; border-color:#D1D5DB; box-shadow:0 4px 12px rgba(0,0,0,0.05); }

        .home-service-actions { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; max-width:1100px; margin:0 auto; }
        .home-service-card { min-height:92px; display:flex; align-items:center; gap:12px; padding:14px 18px; border:1px solid var(--sn-border); border-radius:16px; background:var(--sn-bg); color:var(--sn-text); text-decoration:none; }
        .home-service-card:hover { border-color:var(--sn-border-strong); box-shadow:0 4px 16px rgba(0,0,0,.06); }
        .home-products { padding:2.5rem 5%; background:var(--sn-page); }
        .home-products-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; }
        .home-product-card { overflow:hidden; border:1px solid var(--sn-border); border-radius:14px; background:var(--sn-bg); text-decoration:none; color:var(--sn-text); }
        .home-product-image { position:relative; height:145px; background:var(--sn-page); }
        @media(min-width:768px){ .home-products-grid { grid-template-columns:repeat(4,minmax(0,1fr)); } }

        .market-cards { display:flex; gap:1.5rem; align-items:stretch; min-height:420px; }
        .market-card { transition:all 0.28s ease; display:flex; flex-direction:column; }
        .market-card:hover { transform:translateY(-6px); }
        .market-card.business:hover { box-shadow:0 20px 50px rgba(120,0,255,0.18)!important; border-color:rgba(120,0,255,0.45)!important; }
        .market-card.vybe:hover     { box-shadow:0 20px 50px rgba(120,0,255,0.20)!important; border-color:rgba(200,123,255,0.45)!important; }

        .spons-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(210px,1fr)); gap:1.25rem; }
        .spons-card { background:#fff; border:1.5px solid #E2E8F0; border-radius:20px; padding:1.5rem 1.25rem; transition:all 0.25s; text-decoration:none; display:flex; flex-direction:column; }
        .spons-card:hover { transform:translateY(-4px); box-shadow:0 16px 40px rgba(15,23,42,0.10); border-color:rgba(120,0,255,0.30); }

        @media (max-width: 768px) {
          .sell-chip-card { gap:10px; }
          .sell-cta { width:100%; justify-content:center; }
          .home-service-actions { grid-template-columns:1fr; }
          .market-cards { flex-direction:column!important; }
          .market-card  { min-height:300px!important; }
          .spons-grid { display:flex; overflow-x:auto; gap:1rem; padding-bottom:0.75rem; scroll-snap-type:x mandatory; -webkit-overflow-scrolling:touch; }
          .spons-card { min-width:195px; scroll-snap-align:start; flex-shrink:0; }
        }
      `}</style>
      {/* Featured Brands sit immediately below the global navigation. */}
      <section className="featured-brand-wrap" aria-label="Featured brands">
        <div className="featured-brand-inner">
          <div className="featured-brand-heading">
            <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--sn-text)' }}>Featured Brands</h2>
            <Link href="/market" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--sn-primary)', fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none' }}>
              {t('home.browseMarket')} <ArrowRight size={13} />
            </Link>
          </div>
          <div className="featured-brand-track">
            {sponsored.map(shop => (
              <Link key={shop.id} href={`/store/${encodeURIComponent(shop.id)}`} className="featured-brand-card">
                <span className="featured-brand-avatar">
                  {shop.shop_logo_url ? <img src={shop.shop_logo_url} alt="" loading="lazy" /> : shop.shop_name.slice(0, 1).toUpperCase()}
                </span>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, lineHeight: 1.3 }}>{shop.shop_name}</span>
                <span style={{ fontSize: '0.68rem', color: 'var(--sn-muted)' }}>{shop.shop_category || shop.shop_city || t('home.sponsoredBadge')}</span>
              </Link>
            ))}
            <Link href="/open-store" className="featured-brand-card" aria-label="Add Your Brand">
              <span className="featured-brand-avatar" aria-hidden="true"><Store size={20} /></span>
              <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>Add Your Brand</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.68rem', color: 'var(--sn-primary)', fontWeight: 700 }}>
                Start WebStore setup <ArrowRight size={12} />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* START SELLING CHIP */}
      <div className="sell-chip-wrap">
        <div className="sell-chip-inner">
          <div className="sell-chip-card">
            <div style={{ display:'flex',alignItems:'center',gap:12 }}>
              <div style={{ width:38,height:38,borderRadius:10,background:'linear-gradient(135deg,#FF0080,#7800FF)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                <Store size={20} color="#fff" />
              </div>
              <div>
                <div style={{ fontWeight:700,color:'#374151',fontSize:'0.9rem' }}>{t('home.heroHeadline')}</div>
                <div style={{ fontSize:'0.72rem',color:'#6B7280',marginTop:1 }}>shopnekt · The Global Marketplace</div>
              </div>
            </div>
            <Link href="/open-store" className="sell-cta">
              {t('home.heroCta')} <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Service entry points reuse the existing seller and public search routes. */}
      <section style={{ background: 'var(--sn-bg)', padding: '1rem 5%', borderBottom: '1px solid var(--sn-border)' }}>
        <div className="home-service-actions">
          <Link href="/open-store" className="home-service-card">
            <span style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(120,0,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sn-primary)', flexShrink: 0 }}><BriefcaseBusiness size={20} /></span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <strong style={{ display: 'block', fontSize: '0.88rem' }}>Register Your Service</strong>
              <small style={{ display: 'block', color: 'var(--sn-muted)', marginTop: 3 }}>Open the existing seller setup</small>
            </span>
            <ArrowRight size={16} />
          </Link>
          <Link href="/search?q=services" className="home-service-card">
            <span style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(120,0,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sn-primary)', flexShrink: 0 }}><Search size={20} /></span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <strong style={{ display: 'block', fontSize: '0.88rem' }}>Find Services</strong>
              <small style={{ display: 'block', color: 'var(--sn-muted)', marginTop: 3 }}>Browse service businesses in the marketplace</small>
            </span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* AI CHIP */}
      <div className="ai-chip-wrap">
        <div className="ai-chip-inner">
          <a href="/aiv" className="ai-chip-link">
            <div style={{ display:'flex',alignItems:'center',gap:12 }}>
              <div style={{ width:38,height:38,borderRadius:10,background:'linear-gradient(135deg,#FF0080,#7800FF)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
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
            <div style={{ fontSize:'0.68rem',fontWeight:700,color:'#7800FF',textTransform:'uppercase',letterSpacing:'0.18em',marginBottom:'0.5rem' }}>
              // {t('home.marketsLabel')}
            </div>
            <h2 style={{ fontFamily:"'Inter',sans-serif",fontSize:'clamp(1.5rem,3vw,2.2rem)',fontWeight:800,color:'#111827',margin:0 }}>
              {t('home.marketsThree')} <span style={{ color:'#111827' }}>{t('home.platform')}</span>
            </h2>
          </div>

          <div className="market-cards">

            {/* Business Market */}
            <div className="market-card business" style={{ flex:1,background:'var(--sn-bg)',border:'2px solid rgba(120,0,255,0.20)',borderRadius:24,padding:'2.5rem 2rem',position:'relative',overflow:'hidden',boxShadow:'0 4px 20px rgba(15,23,42,0.06)' }}>
              <div style={{ position:'absolute',top:0,left:0,right:0,height:3,background:'linear-gradient(135deg,#FF0080,#7800FF)' }} />
              <div style={{ width:56,height:56,borderRadius:16,background:'linear-gradient(135deg,#FF0080,#7800FF)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'1.4rem',boxShadow:'0 8px 20px rgba(120,0,255,0.25)' }}>
                <Store style={{ width:26,height:26,color:'#fff' }} />
              </div>
              <h3 style={{ fontFamily:"'Inter',sans-serif",fontSize:'1.5rem',fontWeight:900,color:'#111827',marginBottom:'0.6rem',lineHeight:1.15 }}>Business Marketplaces</h3>
              <p style={{ fontSize:'0.85rem',color:'#6B7280',lineHeight:1.72,marginBottom:'1.5rem' }}>{t('home.businessCardDesc')}</p>
              <div style={{ display:'flex',gap:'0.75rem',flexWrap:'wrap',marginTop:'auto' }}>
                <Link href="/market" style={{ display:'inline-flex',alignItems:'center',gap:'0.4rem',background:'linear-gradient(135deg,#FF0080,#7800FF)',color:'#fff',padding:'0.75rem 1.5rem',borderRadius:999,fontWeight:700,fontSize:'0.82rem',textDecoration:'none',boxShadow:'0 6px 16px rgba(120,0,255,0.22)' }}>
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

      {(productsLoading || productsError || products.length > 0) && (
        <section className="home-products" aria-label="Marketplace products">
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--sn-text)' }}>Discover products</h2>
              <Link href="/market" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--sn-primary)', fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none' }}>
                Browse market <ArrowRight size={13} />
              </Link>
            </div>
            {productsLoading ? <p role="status" style={{ color: 'var(--sn-muted)', fontSize: '0.85rem' }}>Loading available products…</p>
              : productsError ? <p role="alert" style={{ color: 'var(--sn-muted)', fontSize: '0.85rem' }}>Products are temporarily unavailable.</p>
                : products.length === 0 ? <p style={{ color: 'var(--sn-muted)', fontSize: '0.85rem' }}>No available products to show yet.</p>
                  : <div className="home-products-grid">
                    {products.map(product => (
                      <Link key={product.id} href={`/store/${encodeURIComponent(product.store_id)}?product=${encodeURIComponent(product.id)}`} className="home-product-card">
                        <div className="home-product-image">
                          {product.image_url ? <img src={product.image_url} alt={product.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--sn-subtle)' }}><ShoppingBag size={24} /></div>}
                        </div>
                        <div style={{ padding: 10 }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--sn-muted)', marginTop: 3 }}>{product.shop_name}</div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--sn-primary)', fontWeight: 800, marginTop: 5 }}>TZS {product.price.toLocaleString('en-US')}</div>
                        </div>
                      </Link>
                    ))}
                  </div>}
          </div>
        </section>
      )}
    </main>
  )
}
