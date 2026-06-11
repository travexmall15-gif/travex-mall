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
    <footer className="bg-navy text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Logo />
            <p className="max-w-xs text-sm leading-relaxed text-white/60">
              Tanzania&apos;s premier digital marketplace connecting campuses and
              businesses with customers nationwide.
            </p>
            <div className="flex gap-3">
              {[Globe, Share2, AtSign, Send].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social media"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white transition-colors hover:bg-gold hover:text-navy"
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
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm text-white/50 md:flex-row">
          <p>© {new Date().getFullYear()} Travex Mall. All rights reserved.</p>
          <p>Made in Tanzania 🇹🇿</p>
        </div>
      </div>
    </footer>
  )
}
