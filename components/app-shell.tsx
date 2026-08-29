'use client'
import { usePathname } from 'next/navigation'
import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'

// Routes that render their own full-screen experience and must NOT get the
// standard header/footer chrome (auth flows, onboarding, standalone admin
// panel redirects, splash screen, pages with their own custom header, etc).
// Matched by exact path or prefix (see isExcluded).
const SHELL_EXCLUDED_EXACT = ['/']
const SHELL_EXCLUDED_PREFIXES = [
  '/auth',
  '/welcome',
  '/admin',
  '/login',
  '/ai',      // standalone AI assistant experience — own layout
  '/aiv',
  '/menu',    // has its own custom top bar (back button + title)
  '/subscription',
  '/open-store-b2b',
  '/open-store-b2c',
]

function isExcluded(pathname: string): boolean {
  if (SHELL_EXCLUDED_EXACT.includes(pathname)) return true
  // '/dashboard' itself is a bare redirect to the legacy seller dashboard
  // (static HTML) — but '/dashboard/open-store-v2' is a real React page
  // that DOES want the shell, so this must NOT be a prefix match.
  if (pathname === '/dashboard') return true
  return SHELL_EXCLUDED_PREFIXES.some(p => pathname === p || pathname.startsWith(p + '/'))
}

/**
 * Mounted once in the root layout so SiteNav and SiteFooter persist across
 * client-side navigations instead of unmounting/remounting on every route
 * change (which was the root cause of the footer 'jumping' during
 * navigation — each page previously rendered its own <SiteNav/>/<SiteFooter/>
 * inline instead of sharing one from a stable layout).
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || ''
  const excluded = isExcluded(pathname)

  if (excluded) return <>{children}</>

  return (
    <>
      <SiteNav />
      {children}
      <SiteFooter />
    </>
  )
}
