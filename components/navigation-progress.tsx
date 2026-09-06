'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { getNavigationManager, type NavigationState } from '@/lib/navigation/navigation-manager'
import { usePrefersReducedMotion } from '@/lib/performance/performance-utils'

/**
 * Detects whether a click originated on an internal <a> link that would
 * trigger an App Router client-side navigation to a DIFFERENT route than
 * the current one, ignoring links that open in a new tab, modified clicks
 * (cmd/ctrl/shift/alt/middle-click), download links, external/absolute
 * cross-origin URLs, and hash-only same-page anchors.
 */
function resolveInternalNavTarget(e: MouseEvent): string | null {
  if (e.defaultPrevented || e.button !== 0) return null
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return null

  const target = e.target as HTMLElement | null
  const anchor = target?.closest?.('a[href]') as HTMLAnchorElement | null
  if (!anchor) return null
  if (anchor.target && anchor.target !== '_self') return null
  if (anchor.hasAttribute('download')) return null

  const href = anchor.getAttribute('href') || ''
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return null

  let url: URL
  try { url = new URL(href, window.location.href) } catch { return null }
  if (url.origin !== window.location.origin) return null

  const current = window.location.pathname + window.location.search
  const destination = url.pathname + url.search
  if (destination === current) return null // Part 9: same-route click shouldn't start a stuck loader

  return destination
}

function NavigationProgressInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const prefersReducedMotion = usePrefersReducedMotion()
  const [visible, setVisible] = useState(false)
  const [width, setWidth] = useState(0)
  const isFirstRender = useRef(true)
  const safetyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Subscribe to the manager's state machine and mirror it into local
  // render state (idle -> starting/loading -> completing -> idle).
  useEffect(() => {
    const manager = getNavigationManager()

    const unsubscribe = manager.subscribe((state: NavigationState, progress: number) => {
      if (state === 'starting' || state === 'loading') {
        setVisible(true)
        setWidth(progress)
      } else if (state === 'completing') {
        setWidth(100)
        setTimeout(() => {
          setVisible(false)
          setWidth(0)
        }, prefersReducedMotion ? 50 : 200)
      } else if (state === 'idle') {
        setVisible(false)
        setWidth(0)
      }
    })

    return () => unsubscribe()
  }, [prefersReducedMotion])

  // START: fires the instant an internal link is clicked (Part 49 —
  // 'immediate feedback' — happens BEFORE the route actually transitions,
  // not after). Delegated at document level so it works for every <Link>
  // in the app without wrapping each one individually.
  useEffect(() => {
    const manager = getNavigationManager()

    const handleClick = (e: MouseEvent) => {
      const destination = resolveInternalNavTarget(e)
      if (!destination) return
      manager.startNavigation()

      // Safety net (NOT the primary completion mechanism — see Part 5/7):
      // if the destination route never becomes active (navigation error,
      // aborted transition, offline, etc), force-complete after 8s so the
      // bar can never stay stuck indefinitely.
      if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current)
      safetyTimerRef.current = setTimeout(() => {
        if (manager.getState() !== 'idle') manager.completeNavigation()
      }, 8000)
    }

    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [])

  // COMPLETE: fires once the destination route has actually become active
  // — the real signal, not a click event and not a fixed delay. Covers
  // Link clicks, router.push/replace, redirects, and browser Back/Forward
  // (all of these update pathname/searchParams).
  useEffect(() => {
    const manager = getNavigationManager()

    if (isFirstRender.current) {
      // Don't run a pointless start->complete flash for the very first
      // paint of the app shell.
      isFirstRender.current = false
      return
    }

    if (safetyTimerRef.current) { clearTimeout(safetyTimerRef.current); safetyTimerRef.current = null }
    if (manager.getState() !== 'idle') manager.completeNavigation()
  }, [pathname, searchParams])

  // Cleanup any pending safety timer on unmount.
  useEffect(() => () => {
    if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current)
  }, [])

  if (!visible) return null

  const transitionDuration = prefersReducedMotion ? '0.1s' : '0.3s'

  return (
    <div
      aria-hidden="true"
      role="progressbar"
      aria-valuenow={width}
      aria-valuemin={0}
      aria-valuemax={100}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '4px',
        width: `${width}%`,
        background: 'var(--sn-btn-bg, linear-gradient(135deg, #FF0080, #7800FF))',
        zIndex: 10000,
        transition: `width ${transitionDuration} ease-out`,
        opacity: visible ? 1 : 0,
        pointerEvents: 'none',
        borderRadius: '0 2px 2px 0',
        boxShadow: '0 0 10px rgba(120, 0, 255, 0.5)',
      }}
    />
  )
}

export function NavigationProgress() {
  // useSearchParams requires a Suspense boundary in the App Router.
  return (
    <Suspense fallback={null}>
      <NavigationProgressInner />
    </Suspense>
  )
}
