'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { Logo } from '@/components/logo'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/campus', label: 'Campus Market' },
  { href: '/market', label: 'Business Market' },
  { href: '/vybe', label: 'Social Vybe' },
  { href: '/campus-apply', label: 'Open Shop' },
]

export function SiteNav({ variant = 'dark' }: { variant?: 'dark' | 'light' }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const dark = variant === 'dark'

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 border-b backdrop-blur-md',
        dark
          ? 'border-white/10 bg-navy/85 text-white'
          : 'border-border bg-white/90 text-navy',
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <Logo onDark={dark} />

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-gold',
                pathname === link.href && 'text-gold',
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/campus-dashboard"
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-semibold transition-colors',
              dark ? 'text-white hover:bg-white/10' : 'text-navy hover:bg-navy/5',
            )}
          >
            Login
          </Link>
          <Link
            href="/campus-apply"
            className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-navy transition-colors hover:bg-gold-light"
          >
            Sign Up
          </Link>
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          className="md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {open && (
        <div
          className={cn(
            'border-t md:hidden',
            dark ? 'border-white/10 bg-navy' : 'border-border bg-white',
          )}
        >
          <div className="flex flex-col gap-1 px-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-gold/10 hover:text-gold"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-3">
              <Link
                href="/campus-dashboard"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-lg border border-current px-4 py-2 text-center text-sm font-semibold"
              >
                Login
              </Link>
              <Link
                href="/campus-apply"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-lg bg-gold px-4 py-2 text-center text-sm font-semibold text-navy"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
