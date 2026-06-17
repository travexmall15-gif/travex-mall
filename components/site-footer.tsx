import Link from 'next/link'
import { Globe, Share2, Send, AtSign } from 'lucide-react'
import { Logo } from '@/components/logo'

const footerCols = [
  {
    title: 'Marketplace',
    links: [
      { href: '/campus', label: 'Campus Market' },
      { href: '/market', label: 'Business Market' },
      { href: '/vybe',   label: 'Social Vybe' },
    ],
  },
  {
    title: 'Sellers',
    links: [
      { href: '/campus-apply',     label: 'Open a Campus Shop' },
      { href: '/open-store-b2c',   label: 'Open a B2C Store' },
      { href: '/open-store-b2b',   label: 'Open a B2B Store' },
      { href: '/campus-dashboard', label: 'Seller Dashboard' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/', label: 'About Us' },
      { href: '/', label: 'Contact' },
      { href: '/admin-panel', label: 'Admin' },
    ],
  },
]

function GooglePlayIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
      <path d="M3.18 23.82a2 2 0 0 1-.95-1.74V1.92A2 2 0 0 1 3.18.18l11.9 11.82L3.18 23.82zm14.45-8.05L5.01 22.15l10.3-10.22 2.32 3.84zM20.5 11.3l-2.72-1.57-2.6 2.27 2.6 2.28 2.74-1.58a1.05 1.05 0 0 0 0-1.4zM5.01 1.85l12.62 6.38-2.32 3.84L5.01 1.85z"/>
    </svg>
  )
}

function AppStoreIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  )
}

export function SiteFooter() {
  return (
    <footer
      className="text-white"
      style={{
        background: 'linear-gradient(180deg, #0A1628 0%, #0D1B3E 60%, #112350 100%)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle beam */}
      <div style={{
        position: 'absolute', inset: '-20%', pointerEvents: 'none', zIndex: 0,
        background: 'linear-gradient(112deg, transparent 35%, rgba(201,168,76,0.06) 50%, transparent 65%)',
        filter: 'blur(40px)',
      }} />

      <div className="relative mx-auto max-w-7xl px-4 py-14 md:px-6" style={{ zIndex: 1 }}>

        {/* ── APP DOWNLOAD BANNER ── */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px',
          padding: '2rem',
          marginBottom: '3rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}>
          {/* Left text */}
          <div>
            <div style={{
              fontSize: '11px', fontWeight: 700, color: '#C9A84C',
              textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px',
            }}>
              📱 Mobile App — Coming Soon
            </div>
            <h3 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
              fontWeight: 900, color: '#fff', marginBottom: '6px', lineHeight: 1.2,
            }}>
              Shop Smarter on the Travex App
            </h3>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', maxWidth: '360px', lineHeight: 1.6 }}>
              Browse, order, and sell from anywhere. Download the Travex Mall app when it launches on Android and iOS.
            </p>
          </div>

          {/* Right buttons */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {/* Google Play */}
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              title="Coming soon on Google Play"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '10px',
                background: '#000', color: '#fff',
                border: '1.5px solid rgba(255,255,255,0.20)',
                borderRadius: '12px', padding: '10px 18px',
                textDecoration: 'none', minWidth: '160px',
                transition: 'all 0.2s', cursor: 'pointer',
                position: 'relative',
              }}
            >
              <GooglePlayIcon />
              <div>
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.55)', lineHeight: 1, marginBottom: '2px' }}>
                  GET IT ON
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, lineHeight: 1 }}>
                  Google Play
                </div>
              </div>
              {/* Coming soon badge */}
              <span style={{
                position: 'absolute', top: '-8px', right: '-8px',
                background: '#C9A84C', color: '#0D1B3E',
                fontSize: '8px', fontWeight: 800, padding: '2px 6px',
                borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                Soon
              </span>
            </a>

            {/* App Store */}
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              title="Coming soon on App Store"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '10px',
                background: '#000', color: '#fff',
                border: '1.5px solid rgba(255,255,255,0.20)',
                borderRadius: '12px', padding: '10px 18px',
                textDecoration: 'none', minWidth: '160px',
                transition: 'all 0.2s', cursor: 'pointer',
                position: 'relative',
              }}
            >
              <AppStoreIcon />
              <div>
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.55)', lineHeight: 1, marginBottom: '2px' }}>
                  DOWNLOAD ON THE
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, lineHeight: 1 }}>
                  App Store
                </div>
              </div>
              {/* Coming soon badge */}
              <span style={{
                position: 'absolute', top: '-8px', right: '-8px',
                background: '#C9A84C', color: '#0D1B3E',
                fontSize: '8px', fontWeight: 800, padding: '2px 6px',
                borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                Soon
              </span>
            </a>
          </div>
        </div>

        {/* ── MAIN FOOTER COLUMNS ── */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Logo />
            <p className="max-w-xs text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.50)' }}>
              Tanzania&apos;s premier digital marketplace connecting campuses and
              businesses with customers nationwide.
            </p>
            <div className="flex gap-2">
              {[Globe, Share2, AtSign, Send].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social media"
                  className="flex h-9 w-9 items-center justify-center text-white transition-all hover:-translate-y-0.5 hover:bg-gold hover:text-navy"
                  style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '10px' }}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {footerCols.map((col) => (
            <div key={col.title}>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gold">
                {col.title}
              </h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors hover:text-gold"
                      style={{ color: 'rgba(255,255,255,0.50)' }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── BOTTOM BAR ── */}
        <div
          className="mt-12 flex flex-col items-center justify-between gap-4 pt-6 text-xs md:flex-row"
          style={{ borderTop: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.30)' }}
        >
          <p>© 2026 Travex Mall · Travex Digital Group (TDG) · Tanzania</p>
          <div className="flex gap-5">
            <Link href="/" className="transition-colors hover:text-gold" style={{ color: 'inherit' }}>Privacy</Link>
            <Link href="/" className="transition-colors hover:text-gold" style={{ color: 'inherit' }}>Terms</Link>
            <Link href="/" className="transition-colors hover:text-gold" style={{ color: 'inherit' }}>Support</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
