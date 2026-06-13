import React from 'react'
import Link from 'next/link'
import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { ArrowRight, GraduationCap, MapPin, Store, Zap } from 'lucide-react'

// Mikoa 5 ya Business Market
const REGIONS = [
  { name: 'Dar es Salaam', shops: 187, emoji: '🏙️', slug: 'dar-es-salaam' },
  { name: 'Arusha',        shops: 94,  emoji: '🏔️', slug: 'arusha' },
  { name: 'Mwanza',        shops: 76,  emoji: '🌊', slug: 'mwanza' },
  { name: 'Dodoma',        shops: 68,  emoji: '🏛️', slug: 'dodoma' },
  { name: 'Zanzibar',      shops: 75,  emoji: '🌴', slug: 'zanzibar' },
]

export default function HomePage() {
  return (
    <main style={{ fontFamily: "'Inter', sans-serif", background: '#F8FAFF', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }

        /* ── Hero compact on mobile ── */
        @media (max-width: 768px) {
          .hero-section { min-height: 75vh !important; padding: 5rem 5% 3.5rem !important; }
          .hero-h1 { font-size: clamp(1.9rem, 9vw, 2.8rem) !important; }
          .hero-sub { font-size: 0.86rem !important; max-width: 100% !important; }
          .hero-stats { gap: 1.5rem !important; }
          .hero-btns { gap: 0.6rem !important; }
          .hero-btns a { padding: 0.75rem 1.4rem !important; font-size: 0.82rem !important; }
        }

        /* ── Cards horizontal scroll ── */
        .cards-scroll { display: flex; gap: 1rem; overflow-x: auto; padding-bottom: 0.75rem; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
        .cards-scroll::-webkit-scrollbar { display: none; }
        .cards-scroll > * { scroll-snap-align: start; flex-shrink: 0; }

        /* ── Region card ── */
        .region-card { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 18px; padding: 1.4rem 1.2rem; width: 200px; transition: all 0.25s; cursor: pointer; text-decoration: none; display: flex; flex-direction: column; gap: 0.5rem; }
        .region-card:hover { transform: translateY(-4px); box-shadow: 0 14px 36px rgba(15,23,42,0.10); border-color: #BFDBFE; }
        @media (max-width: 768px) { .region-card { width: 165px; } }

        /* ── Vybe post mock ── */
        .vybe-card { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; overflow: hidden; width: 220px; transition: all 0.25s; }
        .vybe-card:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(15,23,42,0.09); }
        @media (max-width: 768px) { .vybe-card { width: 185px; } }

        /* ── Fade edge on scroll containers ── */
        .scroll-wrap { position: relative; }
        .scroll-wrap::after { content: ''; position: absolute; right: 0; top: 0; bottom: 0.75rem; width: 60px; background: linear-gradient(to left, #F8FAFF, transparent); pointer-events: none; z-index: 1; }
      `}</style>

      <SiteNav />

      {/* ══════ HERO ══════ */}
      <section
        className="hero-section"
        style={{
          position: 'relative', overflow: 'hidden', color: '#fff',
          minHeight: '92vh', display: 'flex', alignItems: 'center',
          paddingTop: '64px',
          background: `
            radial-gradient(ellipse 70% 90% at 92% 20%,
              rgba(56,120,255,0.70) 0%,
              rgba(30,80,220,0.45) 25%,
              rgba(15,45,150,0.18) 50%,
              transparent 70%
            ),
            radial-gradient(ellipse 45% 55% at 88% 55%,
              rgba(80,140,255,0.28) 0%,
              transparent 60%
            ),
            linear-gradient(160deg, #010510 0%, #030920 30%, #050E2E 60%, #071540 100%)
          `,
        }}
      >
        {/* Ambient glow layer */}
        <div style={{
          position: 'absolute', top: '-25%', right: '-8%',
          width: '60%', height: '110%', pointerEvents: 'none', zIndex: 0,
          background: `
            radial-gradient(ellipse 55% 55% at 62% 28%,
              rgba(80,145,255,0.72) 0%,
              rgba(55,110,245,0.45) 18%,
              rgba(35,80,220,0.22) 38%,
              rgba(20,55,180,0.08) 58%,
              transparent 75%
            ),
            radial-gradient(ellipse 32% 38% at 72% 16%,
              rgba(150,200,255,0.50) 0%,
              rgba(100,165,255,0.22) 35%,
              transparent 65%
            )
          `,
          filter: 'blur(20px)',
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '4rem 5% 3.5rem', width: '100%' }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(96,165,250,0.25)', color: '#93C5FD', padding: '0.35rem 1rem', borderRadius: '999px', fontSize: '0.70rem', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '1.4rem' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#60A5FA', boxShadow: '0 0 8px rgba(96,165,250,0.9)', flexShrink: 0 }} />
            Africa's #1 AI-Powered Marketplace — Tanzania 2026
          </div>

          {/* H1 */}
          <h1
            className="hero-h1"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(2.4rem, 5.5vw, 4.2rem)', fontWeight: 900, lineHeight: 1.06, color: '#fff', marginBottom: '1.1rem', letterSpacing: '-0.02em', maxWidth: '680px' }}
          >
            Africa's <span style={{ color: '#C9A84C', textShadow: '0 2px 20px rgba(201,168,76,0.30)' }}>Intelligent</span><br />Digital Marketplace
          </h1>

          {/* Sub */}
          <p
            className="hero-sub"
            style={{ fontSize: 'clamp(0.88rem, 1.6vw, 1rem)', lineHeight: 1.78, color: 'rgba(255,255,255,0.50)', marginBottom: '1.8rem', maxWidth: '500px' }}
          >
            Create your online store in minutes. Sell across Tanzania. Grow with AI-powered intelligence — built for every African entrepreneur.
          </p>

          {/* CTAs */}
          <div className="hero-btns" style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', marginBottom: '2.2rem' }}>
            <Link href="/campus-dashboard" style={{ background: '#C9A84C', color: '#0F172A', padding: '0.9rem 2rem', borderRadius: '999px', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 8px 24px rgba(201,168,76,0.38)' }}>
              Login to Your Shop →
            </Link>
            <Link href="/market" style={{ background: 'rgba(255,255,255,0.07)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', padding: '0.9rem 2rem', borderRadius: '999px', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              Open New Store
            </Link>
          </div>

          {/* Stats */}
          <div className="hero-stats" style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap' }}>
            {[['500+', 'Active Shops'], ['5', 'Regions'], ['3M+', 'Tanzania SMEs']].map(([v, l]) => (
              <div key={l}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.4rem,3vw,1.9rem)', fontWeight: 900, color: '#C9A84C', lineHeight: 1 }}>{v}</div>
                <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.32)', marginTop: '3px', letterSpacing: '0.04em' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ TRAVEX BUSINESS MARKET ══════ */}
      <section style={{ background: '#FFFFFF', padding: '4.5rem 5%', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#3B82F6', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '0.4rem' }}>// Business Market</div>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 800, color: '#0F172A', marginBottom: '0.3rem' }}>
                Travex <span style={{ color: '#C9A84C' }}>Business Market</span>
              </h2>
              <p style={{ fontSize: '0.82rem', color: '#64748B' }}>500 verified shops · Mikoa 5 · Basic & Premium plans</p>
            </div>
            <Link href="/market" style={{ fontSize: '0.82rem', color: '#3B82F6', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}>
              Browse All <ArrowRight size={14} />
            </Link>
          </div>

          {/* Region cards horizontal scroll */}
          <div className="scroll-wrap">
            <div className="cards-scroll">
              {REGIONS.map(r => (
                <Link key={r.slug} href={`/market?region=${r.slug}`} className="region-card">
                  <div style={{ fontSize: '2rem', lineHeight: 1, marginBottom: '0.25rem' }}>{r.emoji}</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>{r.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: 'auto' }}>
                    <Store size={12} color="#64748B" />
                    <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>{r.shops} shops</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.4rem' }}>
                    <span style={{ fontSize: '0.58rem', background: 'rgba(201,168,76,0.10)', color: '#A07830', padding: '0.12rem 0.5rem', borderRadius: '999px', fontWeight: 700 }}>🥇 Premium</span>
                    <span style={{ fontSize: '0.58rem', background: 'rgba(15,23,42,0.06)', color: '#64748B', padding: '0.12rem 0.5rem', borderRadius: '999px', fontWeight: 600 }}>🥈 Basic</span>
                  </div>
                </Link>
              ))}
              {/* Open shop CTA card */}
              <div style={{ background: 'linear-gradient(160deg, #040C32, #071545)', border: '1px solid rgba(59,130,246,0.20)', borderRadius: '18px', padding: '1.4rem 1.2rem', width: '200px', display: 'flex', flexDirection: 'column', gap: '0.75rem', justifyContent: 'center', alignItems: 'center', textAlign: 'center', flexShrink: 0 }}>
                <div style={{ fontSize: '1.8rem' }}>🏪</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '0.88rem', fontWeight: 800, color: '#fff', lineHeight: 1.3 }}>Open Your Shop</div>
                <Link href="/open-store.html" style={{ background: '#C9A84C', color: '#0F172A', padding: '0.55rem 1.1rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
                  Apply Now →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ UNITRAVEX — single card ══════ */}
      <section style={{ background: '#F8FAFF', padding: '4.5rem 5%', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#3B82F6', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '0.4rem' }}>// Campus Market</div>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>

            {/* Left — text */}
            <div style={{ flex: 1, minWidth: '260px' }}>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 800, color: '#0F172A', marginBottom: '0.75rem' }}>
                Travex <span style={{ color: '#C9A84C' }}>Uni-Student</span> Market
              </h2>
              <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.75, marginBottom: '1.25rem', maxWidth: '420px' }}>
                Tanzania's first verified student marketplace. Shop from trusted student entrepreneurs at your own university — 5 campuses, 60 slots each.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Link href="/campus" style={{ background: '#0F172A', color: '#fff', padding: '0.8rem 1.8rem', borderRadius: '999px', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 6px 18px rgba(15,23,42,0.22)' }}>
                  <GraduationCap size={15} /> Explore Campus Market
                </Link>
                <Link href="/campus-apply" style={{ background: 'transparent', color: '#0F172A', border: '1.5px solid #E2E8F0', padding: '0.8rem 1.8rem', borderRadius: '999px', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none' }}>
                  Open Shop →
                </Link>
              </div>
            </div>

            {/* Right — stats card */}
            <div style={{ background: 'linear-gradient(160deg, #040C32, #071545)', border: '1px solid rgba(59,130,246,0.18)', borderRadius: '20px', padding: '2rem', minWidth: '240px', maxWidth: '300px', flex: '0 0 auto' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.25)', color: '#C9A84C', padding: '0.3rem 0.9rem', borderRadius: '999px', fontSize: '0.65rem', fontWeight: 700, marginBottom: '1.25rem' }}>
                🎓 Students Only
              </div>
              {[['5', 'Universities'], ['300', 'Founding Slots'], ['TZS 15K', 'Per Month']].map(([v, l]) => (
                <div key={l} style={{ marginBottom: '0.85rem', paddingBottom: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', fontWeight: 900, color: '#C9A84C', lineHeight: 1 }}>{v}</div>
                  <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.38)', marginTop: '2px' }}>{l}</div>
                </div>
              ))}
              <Link href="/campus" style={{ display: 'block', textAlign: 'center', background: '#C9A84C', color: '#0F172A', padding: '0.65rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none', marginTop: '0.5rem' }}>
                Browse Universities →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ SOCIAL VYBE — compact ══════ */}
      <section style={{ position: 'relative', overflow: 'hidden', background: '#07010E', padding: '4rem 5%' }}>
        {/* Vybe glow */}
        <div style={{ position: 'absolute', top: '-30%', left: '-10%', width: '50%', height: '120%', background: 'radial-gradient(circle, rgba(255,0,128,0.18), transparent 65%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-5%', width: '45%', height: '100%', background: 'radial-gradient(circle, rgba(120,0,255,0.15), transparent 65%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1.5px', background: 'linear-gradient(90deg, transparent, #FF0080, #7800FF, #00C8FF, transparent)' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem', padding: '0.3rem 0.85rem', border: '1px solid rgba(255,0,128,0.30)', background: 'rgba(255,0,128,0.07)', borderRadius: '999px' }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#FF0080', flexShrink: 0 }} />
                <span style={{ fontSize: '0.60rem', fontWeight: 700, color: 'rgba(255,0,128,0.85)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>New Feature</span>
              </div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 800, color: '#fff', marginBottom: '0.4rem' }}>
                Travex <span style={{ background: 'linear-gradient(135deg,#FF0080,#7800FF,#00C8FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Social Vybe</span>
              </h2>
              <p style={{ fontSize: '0.84rem', color: 'rgba(255,255,255,0.40)', maxWidth: '380px', lineHeight: 1.65 }}>
                Tanzania's business social network. Post products, grow your brand, connect directly with buyers.
              </p>
            </div>
            <Link href="/vybe" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'linear-gradient(135deg,#FF0080,#7800FF)', color: '#fff', padding: '0.75rem 1.6rem', borderRadius: '999px', fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none', flexShrink: 0 }}>
              <Zap size={14} /> Explore Vybe
            </Link>
          </div>

          {/* Mock vybe posts horizontal */}
          <div className="scroll-wrap" style={{ '--fade-color': '#07010E' }>
            <div className="cards-scroll">
              {[
                { shop: 'Amani Electronics', tag: 'Electronics', color: '#1E3A8A', post: '📱 iPhone 15 Pro Max — TZS 2.8M. New sealed box, warranty included. DM for deals!' },
                { shop: 'Mama Pima Fashion', tag: 'Fashion', color: '#7C1D6F', post: '👗 New ankara collection just arrived! Custom sizes available. Order now →' },
                { shop: 'TechHub Arusha', tag: 'Tech', color: '#065F46', post: '💻 Laptops from TZS 850K. Refurbished + warranty. Visit our shop today.' },
                { shop: 'Zara Cosmetics', tag: 'Beauty', color: '#831843', post: '💄 Original MAC products. Wholesale prices for salons. WhatsApp us!' },
                { shop: 'Karibu Foods', tag: 'Food', color: '#78350F', post: '🍲 Fresh organic spices from Zanzibar. Delivery across Tanzania.' },
              ].map((p, i) => (
                <div key={i} className="vybe-card">
                  <div style={{ height: '48px', background: `linear-gradient(135deg, ${p.color}, #0F172A)`, display: 'flex', alignItems: 'center', padding: '0 0.85rem', gap: '0.5rem' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                      {p.shop.split(' ').map(w => w[0]).join('').slice(0, 2)}
                    </div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.shop}</div>
                  </div>
                  <div style={{ padding: '0.85rem' }}>
                    <div style={{ display: 'inline-block', fontSize: '0.58rem', fontWeight: 700, background: 'rgba(59,130,246,0.10)', color: '#3B82F6', padding: '0.1rem 0.5rem', borderRadius: '999px', marginBottom: '0.5rem' }}>{p.tag}</div>
                    <p style={{ fontSize: '0.74rem', color: '#334155', lineHeight: 1.55, margin: 0, display: '-webkit-box', WebkitLineClamp: 3 as any, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden' }}>{p.post}</p>
                    <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.75rem' }}>
                      <span style={{ fontSize: '0.65rem', color: '#94A3B8' }}>❤️ {12 + i * 7}</span>
                      <span style={{ fontSize: '0.65rem', color: '#94A3B8' }}>💬 {3 + i * 2}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════ FOOTER ══════ */}
      <footer style={{ background: 'linear-gradient(180deg, #010510 0%, #020816 100%)', borderTop: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.55)' }}>
        {/* TDG strip */}
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '1.25rem 5%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase', letterSpacing: '0.10em', marginBottom: '0.25rem' }}>Parent Company</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: '1rem', color: '#fff' }}>TRAVEX <span style={{ color: '#C9A84C' }}>DIGITAL GROUP</span></div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[['🏪 Travex Mall', '/'], ['🎓 Travex Campus', '/campus'], ['✦ Social Vybe', '/vybe'], ['🏢 Business Market', '/market']].map(([label, href]) => (
              <Link key={label} href={href} style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.38)', padding: '0.3rem 0.75rem', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '999px', textDecoration: 'none' }}>
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Main footer grid */}
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 5%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '2rem' }}>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: '0.95rem', color: '#fff', marginBottom: '0.75rem' }}>TRAVEX <span style={{ color: '#C9A84C' }}>MALL</span></div>
            <p style={{ fontSize: '0.78rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.35)', marginBottom: '1rem' }}>Africa's intelligent digital marketplace — empowering businesses and students across Tanzania.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <a href="mailto:travexmall15@gmail.com" style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>📧 travexmall15@gmail.com</a>
              <a href="https://wa.me/255651919915" style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>💬 +255 651 919 915</a>
            </div>
          </div>
          {[
            ['Products', [['Travex Mall', '/'], ['Campus Market', '/campus'], ['Business Market', '/market'], ['Social Vybe', '/vybe']]],
            ['Company', [['Travex Digital Group', 'https://travex-digital-group.vercel.app'], ['Our Story', '#'], ['Our Team', '#'], ['Contact', '#']]],
            ['Support', [['Email Support', 'mailto:travexmall15@gmail.com'], ['WhatsApp', 'https://wa.me/255651919915'], ['Open Shop', '/campus-apply'], ['Subscription', '/subscription']]],
          ].map(([title, links]) => (
            <div key={title as string}>
              <h4 style={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.60)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.85rem' }}>{title as string}</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {(links as [string, string][]).map(([l, h]) => (
                  <li key={l}><a href={h} style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.32)', textDecoration: 'none' }}>{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '1.1rem 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <p style={{ fontSize: '0.70rem', color: 'rgba(255,255,255,0.22)' }}>© 2026 <a href="https://travex-digital-group.vercel.app" style={{ color: '#C9A84C', textDecoration: 'none', fontWeight: 700 }}>Travex Digital Group</a>. All rights reserved.</p>
          <p style={{ fontSize: '0.65rem', color: 'rgba(201,168,76,0.28)', fontStyle: 'italic' }}>Africa's Intelligent Business Ecosystem</p>
        </div>
      </footer>
    </main>
  )
}
