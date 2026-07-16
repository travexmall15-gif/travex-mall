'use client'
import Script from 'next/script'
import { SiteFooter } from '@/components/site-footer'
import Link from 'next/link'
import { SiteNav } from '@/components/site-nav'
import { ArrowRight, GraduationCap, Store, Sparkles } from 'lucide-react'

export default function HomePage() {
  return (
    <main style={{ fontFamily: "'Inter', sans-serif", background: '#F8FAFF', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Inter:wght@300;400;500;600;700;800&family=Bebas+Neue&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        @media (max-width: 768px) {
          .hero-section { min-height: auto !important; padding: 3.5rem 5% 2.5rem !important; }
          .hero-h1 { font-size: clamp(1.9rem, 9vw, 2.8rem) !important; }
          .hero-sub { font-size: 0.86rem !important; }
          .hero-stats { gap: 1.5rem !important; }
          .hero-btns a { padding: 0.75rem 1.4rem !important; font-size: 0.82rem !important; }
          .market-cards { flex-direction: column !important; }
          .market-card  { min-height: 320px !important; }
          .bebas-big { font-size: clamp(2.8rem, 12vw, 6rem) !important; }
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        .market-card { transition: all 0.28s ease; display: flex; flex-direction: column; }
        .market-card:hover { transform: translateY(-6px); }
        .market-card.business:hover { box-shadow: 0 20px 50px rgba(201,168,76,0.18) !important; border-color: rgba(201,168,76,0.45) !important; }
        .market-card.campus:hover  { box-shadow: 0 20px 50px rgba(56,120,255,0.15) !important; border-color: rgba(96,165,250,0.40) !important; }
        .market-card.vybe:hover    { box-shadow: 0 20px 50px rgba(120,0,255,0.20) !important; border-color: rgba(200,123,255,0.45) !important; }
        @keyframes chipScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .chips-track { animation: chipScroll 30s linear infinite; will-change: transform; }
        .chips-track:hover { animation-play-state: paused; }
      `}</style>

      <SiteNav />

      {/*  HERO  */}
      <section className="hero-section" style={{ position: 'relative', overflow: 'hidden', color: '#fff', minHeight: 'auto', display: 'flex', alignItems: 'center', paddingTop: '80px', paddingBottom: '2.5rem', background: 'linear-gradient(160deg, #010510 0%, #030920 30%, #050E2E 60%, #071540 100%)' }}>
        <div style={{ position: 'absolute', top: '-25%', right: '-8%', width: '65%', height: '115%', pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(ellipse 55% 55% at 62% 28%, rgba(56,120,255,0.65) 0%, rgba(35,80,220,0.35) 30%, rgba(20,55,180,0.12) 55%, transparent 75%)', filter: 'blur(22px)' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 5% 2rem', width: '100%' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(56,120,255,0.12)', border: '1px solid rgba(96,165,250,0.25)', color: '#93C5FD', padding: '0.35rem 1rem', borderRadius: '999px', fontSize: '0.70rem', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '0.85rem' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#60A5FA', boxShadow: '0 0 8px rgba(96,165,250,0.9)', flexShrink: 0 }} />
            Africa&apos;s #1 AI-Powered Marketplace, Tanzania 2026
          </div>
          <h1 className="hero-h1" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(2.4rem, 5.5vw, 4.2rem)', fontWeight: 900, lineHeight: 1.06, color: '#fff', marginBottom: '0.75rem', letterSpacing: '-0.02em', maxWidth: '680px' }}>
            Africa&apos;s <span style={{ color: '#C9A84C', textShadow: '0 2px 20px rgba(201,168,76,0.30)' }}>Intelligent</span><br />Digital Marketplace
          </h1>
          <p className="hero-sub" style={{ fontSize: 'clamp(0.88rem, 1.6vw, 1rem)', lineHeight: 1.78, color: 'rgba(255,255,255,0.50)', marginBottom: '1.2rem', maxWidth: '500px' }}>
            Create your online store in minutes. Sell across Tanzania. Grow with AI-powered intelligence, built for every African entrepreneur.
          </p>
          <div className="hero-btns" style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            <Link href="/open-store" style={{ background: '#C9A84C', color: '#0F172A', padding: '0.9rem 2.2rem', borderRadius: '999px', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 8px 24px rgba(201,168,76,0.38)' }}>
              Enter Travex Mall
            </Link>
            <button
              className="travex-lang-btn"
              onClick={() => { if (typeof window !== 'undefined') { (window as any).TravexLang?.toggle() } }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.10)', border: '1.5px solid rgba(255,255,255,0.20)', color: '#fff', padding: '0.85rem 1.6rem', borderRadius: '999px', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', fontFamily: "'Inter', sans-serif", transition: 'all 0.2s', letterSpacing: '0.02em' }}
            >
              🇹🇿 Kiswahili
            </button>
          </div>
          <div className="hero-stats" style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap' }}>
            {[['500+', 'Active Shops'], ['5', 'Regions'], ['3M+', 'Tanzania SMEs']].map(([v, l]) => (
              <div key={l}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', fontWeight: 900, color: '#C9A84C', lineHeight: 1 }}>{v}</div>
                <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.32)', marginTop: '3px', letterSpacing: '0.04em' }}>{l}</div>
              </div>
            ))}
          </div>

        </div>

      </section>

      {/* ── CHIPS TICKER — full screen width, sibling to hero ── */}
      <div style={{ background: 'linear-gradient(180deg,#071540,#0A0C20)', overflow: 'hidden', width: '100%', padding: '14px 0' }}>
        <div className="chips-track" style={{ display: 'flex', gap: '10px', width: 'max-content' }}>
          {[
            { href: '/group-buy',   label: 'Group Buy',   sub: 'Save together'  },
            { href: '/market',      label: 'Business',    sub: '500+ shops'     },
            { href: '/campus',      label: 'Campus',      sub: '5 universities' },
            { href: '/vybe',        label: 'Social Vybe', sub: 'Community'      },
            { href: '/flash-deals', label: 'Flash Deals', sub: 'Limited offers' },
            { href: '/move',        label: 'Travex Move', sub: 'Logistics'      },
            { href: '/group-buy',   label: 'Group Buy',   sub: 'Save together'  },
            { href: '/market',      label: 'Business',    sub: '500+ shops'     },
            { href: '/campus',      label: 'Campus',      sub: '5 universities' },
            { href: '/vybe',        label: 'Social Vybe', sub: 'Community'      },
            { href: '/flash-deals', label: 'Flash Deals', sub: 'Limited offers' },
            { href: '/move',        label: 'Travex Move', sub: 'Logistics'      },
          ].map((chip, i) => (
            <a key={i} href={chip.href} style={{ display: 'inline-flex', flexDirection: 'column', gap: '2px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '8px 18px', textDecoration: 'none', flexShrink: 0, transition: 'background 0.2s', whiteSpace: 'nowrap' as const }}
              onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.16)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,76,0.4)' }}
              onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)' }}>
              <span style={{ fontSize: '0.77rem', fontWeight: 700, color: '#fff' }}>{chip.label}</span>
              <span style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.42)' }}>{chip.sub}</span>
            </a>
          ))}
        </div>
      </div>

      {/*  TWO MARKET CARDS  */}
      <section style={{ background: '#FFFFFF', padding: '5rem 5%', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#3B82F6', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '0.5rem' }}>// Our Markets</div>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800, color: '#0F172A' }}>
              Three Markets, <span style={{ color: '#C9A84C' }}>One Platform</span>
            </h2>
          </div>
          <div className="market-cards" style={{ display: 'flex', gap: '1.5rem', alignItems: 'stretch', minHeight: '420px' }}>

            {/* Business Market */}
            <div className="market-card business" style={{ flex: 1, background: '#FFFFFF', border: '2px solid rgba(201,168,76,0.20)', borderRadius: '24px', padding: '2.5rem 2rem', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 20px rgba(15,23,42,0.06)' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #C9A84C, #F0C96B)' }} />
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #040C32, #071545)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.4rem', boxShadow: '0 8px 20px rgba(5,11,46,0.20)' }}>
                <Store style={{ width: '26px', height: '26px', color: '#C9A84C' }} />
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.62rem', fontWeight: 800, background: 'rgba(201,168,76,0.10)', color: '#A07830', padding: '0.2rem 0.65rem', borderRadius: '999px' }}> Premium</span>
                <span style={{ fontSize: '0.62rem', fontWeight: 800, background: 'rgba(15,23,42,0.06)', color: '#64748B', padding: '0.2rem 0.65rem', borderRadius: '999px' }}> Basic</span>
                
              </div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 900, color: '#0F172A', marginBottom: '0.6rem', lineHeight: 1.15 }}>Business Market</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.72, marginBottom: '1.5rem' }}>
                Tanzania&apos;s unified marketplace for entrepreneurs, retailers and SMEs. 500 verified shops across 5 major regions.
              </p>
              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.75rem', paddingBottom: '1.5rem', borderBottom: '1px solid #F1F5F9' }}>
                {[['500', 'Slots'], ['5', 'Regions'], ['TZS 25K', 'Basic/mo']].map(([v, l]) => (
                  <div key={l}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>{v}</div>
                    <div style={{ fontSize: '0.65rem', color: '#94A3B8', marginTop: '2px' }}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Link href="/market" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#0F172A', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '999px', fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none', boxShadow: '0 6px 16px rgba(15,23,42,0.22)' }}>
                  <Store size={14} /> Browse Market
                </Link>
                <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#C9A84C', color: '#0F172A', padding: '0.75rem 1.5rem', borderRadius: '999px', fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none', boxShadow: '0 6px 16px rgba(201,168,76,0.28)' }}>
                  Login <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            {/* Campus Market */}
            <div className="market-card campus" style={{ flex: 1, background: 'linear-gradient(160deg, #040C32 0%, #071545 50%, #0A1858 100%)', border: '2px solid rgba(56,120,255,0.18)', borderRadius: '24px', padding: '2.5rem 2rem', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 20px rgba(5,11,46,0.18)' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #3B82F6, #93C5FD)' }} />
              <div style={{ position: 'absolute', top: '-30%', right: '-20%', width: '70%', height: '100%', background: 'radial-gradient(ellipse at center, rgba(56,120,255,0.22) 0%, transparent 65%)', filter: 'blur(20px)', pointerEvents: 'none' }} />
              <div style={{ position: 'relative', zIndex: 1, width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(96,165,250,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.85rem' }}>
                <GraduationCap style={{ width: '26px', height: '26px', color: '#93C5FD' }} />
              </div>
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '0.4rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.62rem', fontWeight: 800, background: 'rgba(59,130,246,0.15)', color: '#93C5FD', padding: '0.2rem 0.65rem', borderRadius: '999px' }}> Students Only</span>
                <span style={{ fontSize: '0.62rem', fontWeight: 800, background: 'rgba(5,150,105,0.15)', color: '#86EFAC', padding: '0.2rem 0.65rem', borderRadius: '999px' }}> Verified</span>
              </div>
              <h3 style={{ position: 'relative', zIndex: 1, fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 900, color: '#fff', marginBottom: '0.6rem', lineHeight: 1.15 }}>Campus Market</h3>
              <p style={{ position: 'relative', zIndex: 1, fontSize: '0.85rem', color: 'rgba(255,255,255,0.50)', lineHeight: 1.72, marginBottom: '1.5rem' }}>
                Tanzania&apos;s dedicated campus marketplace. Sell directly to fellow students, verified sellers, 5 campuses, 60 slots each.
              </p>
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '1.5rem', marginBottom: '1.75rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {[['5', 'Universities'], ['300', 'Total Slots'], ['TZS 10K', 'Per Month']].map(([v, l]) => (
                  <div key={l}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', fontWeight: 900, color: '#C9A84C', lineHeight: 1 }}>{v}</div>
                    <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Link href="/campus" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.10)', color: '#fff', border: '1px solid rgba(255,255,255,0.18)', padding: '0.75rem 1.5rem', borderRadius: '999px', fontWeight: 600, fontSize: '0.82rem', textDecoration: 'none' }}>
                  <GraduationCap size={14} /> Browse Campus
                </Link>
                <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#C9A84C', color: '#0F172A', padding: '0.75rem 1.5rem', borderRadius: '999px', fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none', boxShadow: '0 6px 16px rgba(201,168,76,0.28)' }}>
                  Login <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            {/* Social Vybe */}
            <div className="market-card vybe" style={{ flex: 1, background: 'linear-gradient(160deg, #0D0015 0%, #1A0030 50%, #12001F 100%)', border: '2px solid rgba(200,123,255,0.20)', borderRadius: '24px', padding: '2.5rem 2rem', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 20px rgba(120,0,255,0.15)' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #FF0080, #7800FF, #00C8FF)' }} />
              <div style={{ position: 'absolute', top: '-30%', right: '-20%', width: '70%', height: '100%', background: 'radial-gradient(ellipse at center, rgba(120,0,255,0.18) 0%, transparent 65%)', filter: 'blur(20px)', pointerEvents: 'none' }} />
              <div style={{ position: 'relative', zIndex: 1, width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(200,123,255,0.12)', border: '1px solid rgba(200,123,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.85rem' }}>
                <Sparkles style={{ width: '26px', height: '26px', color: '#C87BFF' }} />
              </div>
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '0.4rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.62rem', fontWeight: 800, background: 'rgba(255,0,128,0.12)', color: '#FF80B5', padding: '0.2rem 0.65rem', borderRadius: '999px' }}> Social</span>
                <span style={{ fontSize: '0.62rem', fontWeight: 800, background: 'rgba(120,0,255,0.12)', color: '#C87BFF', padding: '0.2rem 0.65rem', borderRadius: '999px' }}> Live</span>
              </div>
              <h3 style={{ position: 'relative', zIndex: 1, fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 900, color: '#fff', marginBottom: '0.6rem', lineHeight: 1.15 }}>Social Vybe</h3>
              <p style={{ position: 'relative', zIndex: 1, fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.72, marginBottom: '1.5rem' }}>
                Tanzania&apos;s first business social network. Post products, grow your brand and connect with buyers across Tanzania.
              </p>
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '1.5rem', marginBottom: '1.75rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {[['POST', 'Daily Content'], ['LIKE', 'Real Engagement'], ['SELL', 'Direct to Buyers']].map(([v, l]) => (
                  <div key={l}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 900, color: '#C87BFF', lineHeight: 1 }}>{v}</div>
                    <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.30)', marginTop: '2px' }}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Link href="/vybe" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'linear-gradient(135deg,#FF0080,#7800FF)', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '999px', fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none' }}>
                  Explore Vybe
                </Link>
                <Link href="/vybe" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.07)', color: '#fff', border: '1px solid rgba(255,255,255,0.12)', padding: '0.75rem 1.5rem', borderRadius: '999px', fontWeight: 600, fontSize: '0.82rem', textDecoration: 'none' }}>
                  Post in Social Vybe <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/*  TOP RATED SHOPS  */}
      <section style={{ background: '#F8FAFF', padding: '3.5rem 0', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', paddingLeft: '5%', paddingRight: '5%' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#C9A84C', textTransform: 'uppercase' as const, letterSpacing: '0.18em', marginBottom: '0.5rem' }}>// Featured</div>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, color: '#0F172A' }}>
              Top Rated <span style={{ color: '#C9A84C' }}>Shops</span>
            </h2>
          </div>
        </div>
        <style>{`
          @keyframes shopScroll {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-33.33%); }
          }
          .shop-track { display: flex; gap: 1rem; animation: shopScroll 56s linear infinite; width: max-content; }
          .shop-track:hover { animation-play-state: paused; }
          .shop-item { width: 200px; flex-shrink: 0; background: #fff; border-radius: 16px; padding: 1.25rem; cursor: pointer; box-shadow: 0 2px 8px rgba(15,23,42,0.05); transition: transform 0.2s, box-shadow 0.2s; text-decoration: none; display: block; }
          .shop-item:hover { transform: translateY(-4px); box-shadow: 0 12px 28px rgba(15,23,42,0.12); }
          .shop-premium { border: 1.5px solid rgba(201,168,76,0.30); }
          .shop-basic   { border: 1.5px solid #E2E8F0; }
        `}</style>
        <div style={{ overflow: 'hidden', padding: '0.5rem 0' }}>
          <div className="shop-track">
            {[
              { name: 'Fashion Hub DSM',   cat: 'Fashion',      region: 'Dar es Salaam', rating: '4.9', plan: 'premium' },
              { name: 'Tech World TZ',     cat: 'Electronics',  region: 'Mwanza',        rating: '4.8', plan: 'premium' },
              { name: 'Fresh Groceries',   cat: 'Food & Drink', region: 'Arusha',        rating: '4.8', plan: 'basic'   },
              { name: 'Beauty Palace',     cat: 'Beauty',       region: 'Dar es Salaam', rating: '4.7', plan: 'premium' },
              { name: 'HomeStyle TZ',      cat: 'Home & Living',region: 'Dodoma',        rating: '4.7', plan: 'basic'   },
              { name: 'Sports Zone',       cat: 'Sports',       region: 'Dar es Salaam', rating: '4.6', plan: 'premium' },
              { name: 'Book Corner',       cat: 'Education',    region: 'Morogoro',      rating: '4.6', plan: 'basic'   },
              { name: 'Mama Lishe Pro',    cat: 'Food & Drink', region: 'Dar es Salaam', rating: '4.5', plan: 'premium' },
              { name: 'Auto Parts DSM',    cat: 'Automotive',   region: 'Dar es Salaam', rating: '4.5', plan: 'basic'   },
              { name: 'Kids Zone TZ',      cat: 'Kids & Toys',  region: 'Arusha',        rating: '4.5', plan: 'premium' },
              // Duplicate for seamless loop
              { name: 'Fashion Hub DSM',   cat: 'Fashion',      region: 'Dar es Salaam', rating: '4.9', plan: 'premium' },
              { name: 'Tech World TZ',     cat: 'Electronics',  region: 'Mwanza',        rating: '4.8', plan: 'premium' },
              { name: 'Fresh Groceries',   cat: 'Food & Drink', region: 'Arusha',        rating: '4.8', plan: 'basic'   },
              { name: 'Beauty Palace',     cat: 'Beauty',       region: 'Dar es Salaam', rating: '4.7', plan: 'premium' },
              { name: 'HomeStyle TZ',      cat: 'Home & Living',region: 'Dodoma',        rating: '4.7', plan: 'basic'   },
              { name: 'Sports Zone',       cat: 'Sports',       region: 'Dar es Salaam', rating: '4.6', plan: 'premium' },
              { name: 'Book Corner',       cat: 'Education',    region: 'Morogoro',      rating: '4.6', plan: 'basic'   },
              { name: 'Mama Lishe Pro',    cat: 'Food & Drink', region: 'Dar es Salaam', rating: '4.5', plan: 'premium' },
              { name: 'Auto Parts DSM',    cat: 'Automotive',   region: 'Dar es Salaam', rating: '4.5', plan: 'basic'   },
              { name: 'Kids Zone TZ',      cat: 'Kids & Toys',  region: 'Arusha',        rating: '4.5', plan: 'premium' },
            ].map((shop, i) => (
              <a key={i} href="/market" className={`shop-item ${shop.plan === 'premium' ? 'shop-premium' : 'shop-basic'}`}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg,#040C32,#071545)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.85rem' }}>
                  <span style={{ fontFamily: "'Playfair Display',serif", fontSize: '1rem', fontWeight: 900, color: '#C9A84C' }}>{shop.name.charAt(0)}</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0F172A', marginBottom: '0.25rem', lineHeight: 1.3 }}>{shop.name}</div>
                <div style={{ fontSize: '0.68rem', color: '#94A3B8', marginBottom: '0.6rem' }}>{shop.region}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.65rem', background: 'rgba(201,168,76,0.10)', color: '#A07830', padding: '0.12rem 0.5rem', borderRadius: '999px', fontWeight: 700 }}>{shop.cat}</span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#C9A84C' }}> {shop.rating}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '1.75rem' }}>
          <a href="/market" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#0F172A', color: '#fff', padding: '0.75rem 1.75rem', borderRadius: '999px', fontWeight: 700, fontSize: '0.83rem', textDecoration: 'none' }}>
            View All Shops 
          </a>
        </div>
      </section>
      <SiteFooter />
    </main>
  )
}
