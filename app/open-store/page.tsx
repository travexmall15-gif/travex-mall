import Link from 'next/link'
import { SiteNav } from '@/components/site-nav'
import { ArrowRight, GraduationCap, Store, CheckCircle } from 'lucide-react'

export default function OpenStorePage() {
  return (
    <main style={{ fontFamily: "'Inter', sans-serif", background: '#F8FAFF', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        .choice-card {
          display: flex; flex-direction: column;
          background: #FFFFFF;
          border: 2px solid #E2E8F0;
          border-radius: 24px;
          padding: 2.5rem 2rem;
          text-decoration: none;
          transition: all 0.28s;
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }
        .choice-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 50px rgba(15,23,42,0.12);
        }
        .choice-card.business:hover { border-color: rgba(201,168,76,0.50); }
        .choice-card.campus:hover  { border-color: rgba(56,120,255,0.40); }
        .choice-card.business { border-color: rgba(201,168,76,0.22); }
        .choice-card.campus   { border-color: rgba(56,120,255,0.18); }

        @media (max-width: 640px) {
          .cards-wrap { flex-direction: column !important; }
          .choice-card { padding: 2rem 1.5rem; }
        }
      `}</style>

      <SiteNav variant="light" />

      {/* ── Hero ── */}
      <section style={{
        position: 'relative', overflow: 'hidden', paddingTop: '64px',
        background: `
          radial-gradient(ellipse 70% 90% at 92% 20%,
            rgba(56,120,255,0.68) 0%, rgba(30,80,220,0.42) 25%,
            rgba(15,45,150,0.18) 50%, transparent 70%
          ),
          linear-gradient(160deg, #010510 0%, #030920 30%, #050E2E 60%, #071540 100%)
        `,
        color: '#fff', padding: '4rem 5% 3.5rem', textAlign: 'center',
      }}>
        {/* Ambient glow */}
        <div style={{ position: 'absolute', top: '-25%', right: '-8%', width: '60%', height: '110%', pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(ellipse 55% 55% at 62% 28%, rgba(56,120,255,0.65) 0%, rgba(35,80,220,0.38) 28%, transparent 70%)', filter: 'blur(22px)' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.30)', color: '#C9A84C', padding: '0.35rem 1rem', borderRadius: '999px', fontSize: '0.70rem', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '1.4rem' }}>
            🎁 Free Registration — This Month
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(2rem,5vw,3.2rem)', fontWeight: 900, color: '#fff', lineHeight: 1.08, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
            Open Your <span style={{ color: '#C9A84C' }}>Store</span>
          </h1>
          <p style={{ fontSize: 'clamp(0.88rem,1.6vw,1rem)', color: 'rgba(255,255,255,0.50)', lineHeight: 1.78, maxWidth: '420px', margin: '0 auto' }}>
            Choose the market that fits you best. Both are free this month — no payment required.
          </p>
        </div>
      </section>

      {/* ── Choice Cards ── */}
      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '4rem 5% 5rem' }}>

        <div className="cards-wrap" style={{ display: 'flex', gap: '1.5rem', alignItems: 'stretch' }}>

          {/* ── BUSINESS MARKET ── */}
          <Link href="/open-store" className="choice-card business" style={{ flex: 1, color: 'inherit' }}>
            {/* Top glow accent */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #C9A84C, #F0C96B)', borderRadius: '24px 24px 0 0' }} />

            {/* Icon */}
            <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'linear-gradient(135deg, #040C32, #071545)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', boxShadow: '0 8px 24px rgba(5,11,46,0.18)' }}>
              <Store style={{ width: '28px', height: '28px', color: '#C9A84C' }} />
            </div>

            {/* Badge */}
            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.62rem', fontWeight: 800, background: 'rgba(201,168,76,0.10)', color: '#A07830', padding: '0.2rem 0.65rem', borderRadius: '999px' }}>🥇 Premium Available</span>
              <span style={{ fontSize: '0.62rem', fontWeight: 800, background: 'rgba(15,23,42,0.06)', color: '#64748B', padding: '0.2rem 0.65rem', borderRadius: '999px' }}>🥈 Basic Available</span>
            </div>

            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.55rem', fontWeight: 900, color: '#0F172A', marginBottom: '0.6rem', lineHeight: 1.15 }}>
              Business Market
            </h2>
            <p style={{ fontSize: '0.86rem', color: '#64748B', lineHeight: 1.70, marginBottom: '1.5rem', flexGrow: 1 }}>
              For entrepreneurs, SMEs, retailers and wholesalers. Reach customers across Tanzania's 5 major regions. 500 slots total.
            </p>

            {/* Features */}
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.75rem', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {[
                'Nationwide reach — 5 regions',
                'Basic TZS 25K/mo · Premium TZS 45K/mo',
                'AI seller tools (Premium)',
                'WhatsApp order system',
                'Top listing for Premium shops',
              ].map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.80rem', color: '#334155' }}>
                  <CheckCircle style={{ width: '15px', height: '15px', color: '#C9A84C', flexShrink: 0, marginTop: '1px' }} />
                  {f}
                </li>
              ))}
            </ul>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, #040C32, #071545)', borderRadius: '14px', padding: '1rem 1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.42)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>This month</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', fontWeight: 900, color: '#C9A84C', lineHeight: 1 }}>FREE</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#C9A84C', color: '#0F172A', padding: '0.6rem 1.2rem', borderRadius: '999px', fontSize: '0.80rem', fontWeight: 700 }}>
                Apply Now <ArrowRight style={{ width: '14px', height: '14px' }} />
              </div>
            </div>
          </Link>

          {/* ── CAMPUS MARKET ── */}
          <Link href="/campus-apply" className="choice-card campus" style={{ flex: 1, color: 'inherit' }}>
            {/* Top glow accent */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #3B82F6, #93C5FD)', borderRadius: '24px 24px 0 0' }} />

            {/* Icon */}
            <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'linear-gradient(135deg, #040C32, #0A1858)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', boxShadow: '0 8px 24px rgba(5,11,46,0.18)' }}>
              <GraduationCap style={{ width: '28px', height: '28px', color: '#93C5FD' }} />
            </div>

            {/* Badge */}
            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.62rem', fontWeight: 800, background: 'rgba(59,130,246,0.10)', color: '#1E40AF', padding: '0.2rem 0.65rem', borderRadius: '999px' }}>🎓 Students Only</span>
              <span style={{ fontSize: '0.62rem', fontWeight: 800, background: 'rgba(5,150,105,0.10)', color: '#065F46', padding: '0.2rem 0.65rem', borderRadius: '999px' }}>✅ 5 Universities</span>
            </div>

            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.55rem', fontWeight: 900, color: '#0F172A', marginBottom: '0.6rem', lineHeight: 1.15 }}>
              Campus Market
            </h2>
            <p style={{ fontSize: '0.86rem', color: '#64748B', lineHeight: 1.70, marginBottom: '1.5rem', flexGrow: 1 }}>
              Exclusively for university students. Sell directly to your fellow students on campus. 60 slots per university — limited availability.
            </p>

            {/* Features */}
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.75rem', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {[
                'UDSM, UDOM, ARU, TIA, NIT',
                'TZS 15,000/month only',
                'Student-verified badge',
                'Campus-targeted audience',
                '60 slots per university',
              ].map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.80rem', color: '#334155' }}>
                  <CheckCircle style={{ width: '15px', height: '15px', color: '#3B82F6', flexShrink: 0, marginTop: '1px' }} />
                  {f}
                </li>
              ))}
            </ul>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, #040C32, #0A1858)', borderRadius: '14px', padding: '1rem 1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.42)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Per month</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', fontWeight: 900, color: '#93C5FD', lineHeight: 1 }}>TZS 15K</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#3B82F6', color: '#fff', padding: '0.6rem 1.2rem', borderRadius: '999px', fontSize: '0.80rem', fontWeight: 700 }}>
                Apply Now <ArrowRight style={{ width: '14px', height: '14px' }} />
              </div>
            </div>
          </Link>
        </div>

        {/* Bottom note */}
        <p style={{ textAlign: 'center', fontSize: '0.78rem', color: '#94A3B8', marginTop: '2rem', lineHeight: 1.65 }}>
          Not sure which to choose? <Link href="/market" style={{ color: '#3B82F6', fontWeight: 600, textDecoration: 'none' }}>Browse Business Market</Link> or <Link href="/campus" style={{ color: '#3B82F6', fontWeight: 600, textDecoration: 'none' }}>Browse Campus Market</Link> first.
        </p>
      </section>
    </main>
  )
}
