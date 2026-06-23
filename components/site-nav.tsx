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
  { href: '/flash-deals', label: '⚡ Flash Deals' },
  { href: '/group-buy', label: '👥 Group Buy' },
  { href: '/campus-apply', label: 'Open Shop' },
]

export function SiteNav({ variant = 'dark' }: { variant?: 'dark' | 'light' }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const dark = variant === 'dark'

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 border-b transition-all duration-300',
        dark
          ? 'border-white/8 text-white'
          : 'border-border text-navy',
      )}
      style={dark
        ? { background: 'rgba(6,12,26,0.82)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' as any }
        : { background: 'rgba(255,255,255,0.90)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' as any }
      }
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <Logo onDark={dark} />

        <div className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-gold',
                pathname === link.href ? 'text-gold' : dark ? 'text-white/80' : 'text-navy/80',
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/login"
            className={cn(
              'rounded-full px-4 py-2 text-sm font-semibold transition-all',
              dark
                ? 'text-white/80 hover:bg-white/10 hover:text-white'
                : 'text-navy/80 hover:bg-navy/8 hover:text-navy',
            )}
          >
            Login
          </Link>
          <Link
            href="/open-store"
            className="rounded-full bg-gold px-5 py-2 text-sm font-bold text-navy shadow-[0_6px_18px_rgba(201,168,76,0.30)] transition-all hover:-translate-y-0.5 hover:bg-gold-light hover:shadow-[0_10px_24px_rgba(201,168,76,0.40)]"
          >
            Sign Up
          </Link>
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          className={cn('md:hidden rounded-lg p-1.5', dark ? 'text-white' : 'text-navy')}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {open && (
        <div
          className={cn('border-t md:hidden', dark ? 'border-white/8' : 'border-border')}
          style={dark
            ? { background: 'rgba(6,12,26,0.96)' }
            : { background: 'rgba(255,255,255,0.98)' }
          }
        >
          <div className="flex flex-col gap-1 px-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-gold/10 hover:text-gold"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 flex gap-2">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-full border border-current px-4 py-2.5 text-center text-sm font-semibold"
              >
                Login
              </Link>
              <Link
                href="/open-store"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-full bg-gold px-4 py-2.5 text-center text-sm font-bold text-navy"
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
