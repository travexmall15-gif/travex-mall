import Link from 'next/link'
import { Globe, Share2, Send, AtSign } from 'lucide-react'
import { Logo } from '@/components/logo'

const footerCols = [
  {
    title: 'Marketplace',
    links: [
      { href: '/campus', label: 'Campus Market' },
      { href: '/market', label: 'Business Market' },
      { href: '/vybe', label: 'Social Vybe' },
    ],
  },
  {
    title: 'Sellers',
    links: [
      { href: '/campus-apply', label: 'Open a Campus Shop' },
      { href: '/open-store-b2c', label: 'Open a B2C Store' },
      { href: '/open-store-b2b', label: 'Open a B2B Store' },
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
