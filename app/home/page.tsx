'use client'
import Link from 'next/link'
import { SiteNav } from '@/components/site-nav'
import { InstallButtons } from '@/components/install-buttons'
import { ArrowRight, GraduationCap, Store, Sparkles } from 'lucide-react'

export default function HomePage() {
  return (
    <main style={{ fontFamily: "'Inter', sans-serif", background: '#F8FAFF', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Inter:wght@300;400;500;600;700;800&family=Bebas+Neue&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        @media (max-width: 768px) {
          .hero-section { min-height: 75vh !important; padding: 5rem 5% 3.5rem !important; }
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
      `}</style>

      <SiteNav />

      {/* ══ HERO ══ */}
      <section className="hero-section" style={{ position: 'relative', overflow: 'hidden', color: '#fff', minHeight: '92vh', display: 'flex', alignItems: 'center', paddingTop: '64px', background: 'linear-gradient(160deg, #010510 0%, #030920 30%, #050E2E 60%, #071540 100%)' }}>
        <div style={{ position: 'absolute', top: '-25%', right: '-8%', width: '65%', height: '115%', pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(ellipse 55% 55% at 62% 28%, rgba(56,120,255,0.65) 0%, rgba(35,80,220,0.35) 30%, rgba(20,55,180,0.12) 55%, transparent 75%)', filter: 'blur(22px)' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '4rem 5% 3.5rem', width: '100%' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(56,120,255,0.12)', border: '1px solid rgba(96,165,250,0.25)', color: '#93C5FD', padding: '0.35rem 1rem', borderRadius: '999px', fontSize: '0.70rem', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '1.4rem' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#60A5FA', boxShadow: '0 0 8px rgba(96,165,250,0.9)', flexShrink: 0 }} />
            Africa&apos;s #1 AI-Powered Marketplace — Tanzania 2026
          </div>
          <h1 className="hero-h1" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(2.4rem, 5.5vw, 4.2rem)', fontWeight: 900, lineHeight: 1.06, color: '#fff', marginBottom: '1.1rem', letterSpacing: '-0.02em', maxWidth: '680px' }}>
            Africa&apos;s <span style={{ color: '#C9A84C', textShadow: '0 2px 20px rgba(201,168,76,0.30)' }}>Intelligent</span><br />Digital Marketplace
          </h1>
          <p className="hero-sub" style={{ fontSize: 'clamp(0.88rem, 1.6vw, 1rem)', lineHeight: 1.78, color: 'rgba(255,255,255,0.50)', marginBottom: '1.8rem', maxWidth: '500px' }}>
            Create your online store in minutes. Sell across Tanzania. Grow with AI-powered intelligence — built for every African entrepreneur.
          </p>
          <div className="hero-btns" style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', marginBottom: '2.2rem' }}>
            <Link href="/open-store" style={{ background: '#C9A84C', color: '#0F172A', padding: '0.9rem 2.2rem', borderRadius: '999px', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 8px 24px rgba(201,168,76,0.38)' }}>
              🎁 Open Free →
            </Link>
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

      {/* ══ TWO MARKET CARDS ══ */}
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
                <span style={{ fontSize: '0.62rem', fontWeight: 800, background: 'rgba(201,168,76,0.10)', color: '#A07830', padding: '0.2rem 0.65rem', borderRadius: '999px' }}>🥇 Premium</span>
                <span style={{ fontSize: '0.62rem', fontWeight: 800, background: 'rgba(15,23,42,0.06)', color: '#64748B', padding: '0.2rem 0.65rem', borderRadius: '999px' }}>🥈 Basic</span>
                <span style={{ fontSize: '0.62rem', fontWeight: 800, background: 'rgba(5,150,105,0.10)', color: '#065F46', padding: '0.2rem 0.65rem', borderRadius: '999px' }}>🎁 Free Now</span>
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
              <div style={{ position: 'relative', zIndex: 1, width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(96,165,250,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.4rem' }}>
                <GraduationCap style={{ width: '26px', height: '26px', color: '#93C5FD' }} />
              </div>
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '0.4rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.62rem', fontWeight: 800, background: 'rgba(59,130,246,0.15)', color: '#93C5FD', padding: '0.2rem 0.65rem', borderRadius: '999px' }}>🎓 Students Only</span>
                <span style={{ fontSize: '0.62rem', fontWeight: 800, background: 'rgba(5,150,105,0.15)', color: '#86EFAC', padding: '0.2rem 0.65rem', borderRadius: '999px' }}>✅ Verified</span>
              </div>
              <h3 style={{ position: 'relative', zIndex: 1, fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 900, color: '#fff', marginBottom: '0.6rem', lineHeight: 1.15 }}>Campus Market</h3>
              <p style={{ position: 'relative', zIndex: 1, fontSize: '0.85rem', color: 'rgba(255,255,255,0.50)', lineHeight: 1.72, marginBottom: '1.5rem' }}>
                Tanzania&apos;s dedicated campus marketplace. Sell directly to fellow students — verified sellers, 5 campuses, 60 slots each.
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
              <div style={{ position: 'relative', zIndex: 1, width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(200,123,255,0.12)', border: '1px solid rgba(200,123,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.4rem' }}>
                <Sparkles style={{ width: '26px', height: '26px', color: '#C87BFF' }} />
              </div>
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '0.4rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.62rem', fontWeight: 800, background: 'rgba(255,0,128,0.12)', color: '#FF80B5', padding: '0.2rem 0.65rem', borderRadius: '999px' }}>✦ Social</span>
                <span style={{ fontSize: '0.62rem', fontWeight: 800, background: 'rgba(120,0,255,0.12)', color: '#C87BFF', padding: '0.2rem 0.65rem', borderRadius: '999px' }}>🔥 Live</span>
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
                  ✦ Explore Vybe
                </Link>
                <Link href="/vybe" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.07)', color: '#fff', border: '1px solid rgba(255,255,255,0.12)', padding: '0.75rem 1.5rem', borderRadius: '999px', fontWeight: 600, fontSize: '0.82rem', textDecoration: 'none' }}>
                  Post in Social Vybe <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* ══ TOP RATED SHOPS ══ */}
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
            100% { transform: translateX(-50%); }
          }
          .shop-track { display: flex; gap: 1rem; animation: shopScroll 28s linear infinite; width: max-content; }
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
                <div style={{ fontSize: '0.68rem', color: '#94A3B8', marginBottom: '0.6rem' }}>📍 {shop.region}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.65rem', background: 'rgba(201,168,76,0.10)', color: '#A07830', padding: '0.12rem 0.5rem', borderRadius: '999px', fontWeight: 700 }}>{shop.cat}</span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#C9A84C' }}>⭐ {shop.rating}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '1.75rem' }}>
          <a href="/market" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#0F172A', color: '#fff', padding: '0.75rem 1.75rem', borderRadius: '999px', fontWeight: 700, fontSize: '0.83rem', textDecoration: 'none' }}>
            View All Shops →
          </a>
        </div>
      </section>

      {/* ── APP DOWNLOAD ── */}
      <section style={{ background: '#F8F9FC', padding: '3.5rem 5%', borderTop: '1px solid #E8ECF4', borderBottom: '1px solid #E8ECF4' }}>
        <div style={{ maxWidth: '520px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(201,168,76,0.10)', border: '1px solid rgba(201,168,76,0.35)', color: '#8a6a00', padding: '4px 14px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, marginBottom: '1rem' }}>
            📱 Available on Android & iOS
          </div>
          <h2 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 900, color: '#0D1B3E', marginBottom: '0.65rem', lineHeight: 1.2 }}>
            Shop Smarter on the <span style={{ color: '#C9A84C' }}>Travex Mall App</span>
          </h2>
          <p style={{ color: '#64748B', fontSize: '14px', lineHeight: 1.75, marginBottom: '2rem' }}>
            Install Travex Mall directly on your phone — no app store needed. Browse shops, place orders and sell from anywhere.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <InstallButtons />
          </div>
          <p style={{ fontSize: '11px', color: '#94A3B8', marginTop: '1rem' }}>Free • No app store required • Works on all devices</p>
        </div>
      </section>

      {/* ══ FOOTER (original) ══ */}
      <footer style={{ background: '#060B18', color: 'rgba(255,255,255,0.55)', fontFamily: "'Inter',sans-serif" }}>
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '1.5rem 5%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: '0.3rem' }}>Parent Company</div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>TRAVEX <span style={{ color: '#C9A84C' }}>DIGITAL GROUP</span></div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.15rem' }}>Innovate · Connect · Grow</div>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            {[['🏪 Travex Mall', '/'], ['🎓 Travex Campus', '/campus'], ['🏨 Travex Stay', '#'], ['🚚 Travex Move', '#']].map(([label, href]) => (
              <Link key={label} href={href} style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', padding: '0.35rem 0.85rem', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', textDecoration: 'none' }}>
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div className="footer-grid" style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 5%', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '2.5rem' }}>
          <div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: '1rem', color: '#fff', marginBottom: '0.75rem' }}>TRAVEX <span style={{ color: '#C9A84C' }}>MALL</span></div>
            <p style={{ fontSize: '0.8rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.4)', marginBottom: '1.25rem', maxWidth: '300px' }}>Africa&apos;s intelligent digital marketplace — empowering businesses and students across Tanzania and beyond.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <a href="mailto:travexmall15@gmail.com" style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>📧 travexmall15@gmail.com</a>
              <a href="https://wa.me/255651919915" target="_blank" style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>💬 +255 651 919 915</a>
              <a href="https://wa.me/255657575950" target="_blank" style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>💬 +255 657 575 950</a>
            </div>
          </div>
          {[
            ['Products', [['Travex Mall', '/'], ['Travex Campus', '/campus'], ['Social Vybe', '/vybe'], ['Business Market', '/market']]],
            ['Company', [['Travex Digital Group', 'https://travex-digital-group.vercel.app'], ['Our Story', '#'], ['Our Team', '#'], ['Contact TDG', '#']]],
            ['Support', [['Email Support', 'mailto:travexmall15@gmail.com'], ['WhatsApp 1', 'https://wa.me/255651919915'], ['WhatsApp 2', 'https://wa.me/255657575950'], ['Open Shop', '/campus-apply']]],
          ].map(([title, links]) => (
            <div key={title as string}>
              <h4 style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: '1rem' }}>{title as string}</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {(links as [string, string][]).map(([l, h]) => (
                  <li key={l}><a href={h} style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '1.25rem 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)' }}>
            © 2026 <a href="https://travex-digital-group.vercel.app" target="_blank" style={{ color: '#C9A84C', textDecoration: 'none', fontWeight: 700 }}>Travex Digital Group</a>. All rights reserved.
          </p>
          <p style={{ fontSize: '0.68rem', color: 'rgba(201,168,76,0.3)', fontStyle: 'italic' }}>Africa&apos;s Intelligent Business Ecosystem</p>
        </div>
      </footer>
    </main>
  )
}
