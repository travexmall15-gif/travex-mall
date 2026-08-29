'use client'

import { useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getNavigationManager } from '@/lib/navigation/navigation-manager'
import { getPrefetchManager } from '@/lib/navigation/prefetch-manager'
import type { PrefetchPriority } from '@/lib/navigation/prefetch-manager'

interface NavigationLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  prefetch?: boolean
  prefetchPriority?: PrefetchPriority
  children: React.ReactNode
}

export function NavigationLink({
  href,
  prefetch = true,
  prefetchPriority = 'normal',
  children,
  onClick,
  ...props
}: NavigationLinkProps) {
  const pathname = usePathname()
  
  // Prefetch on mount for likely destinations
  useEffect(() => {
    if (prefetch && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
      const manager = getPrefetchManager()
      manager.prefetchRoute(href, { priority: prefetchPriority, kind: 'route' })
    }
  }, [href, prefetch, prefetchPriority])

  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    // Don't handle external links or special links
    if (
      href.startsWith('http') ||
      href.startsWith('#') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      e.ctrlKey ||
      e.metaKey ||
      e.shiftKey ||
      e.altKey
    ) {
      return
    }

    // Start navigation progress
    const navManager = getNavigationManager()
    navManager.startNavigation()

    // Call user's onClick if provided
    if (onClick) {
      onClick(e)
    }
  }, [href, onClick])

  const isActive = pathname === href || (href !== '/' && pathname?.startsWith(href))

  return (
    <Link
      href={href}
      prefetch={false} // We handle prefetching manually
      onClick={handleClick}
      data-active={isActive ? 'true' : undefined}
      {...props}
    >
      {children}
    </Link>
  )
}
