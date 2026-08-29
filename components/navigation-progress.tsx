'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { getNavigationManager, type NavigationState } from '@/lib/navigation/navigation-manager'
import { usePrefersReducedMotion } from '@/lib/performance/performance-utils'

export function NavigationProgress() {
  const pathname = usePathname()
  const prefersReducedMotion = usePrefersReducedMotion()
  const [visible, setVisible] = useState(false)
  const [width, setWidth] = useState(0)

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

  // Reset on route change
  useEffect(() => {
    const manager = getNavigationManager()
    manager.startNavigation()
  }, [pathname])

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
        background: 'linear-gradient(90deg, var(--sn-primary, #1D4ED8) 0%, var(--sn-primary-light, #3B82F6) 100%)',
        zIndex: 10000,
        transition: `width ${transitionDuration} ease-out`,
        opacity: visible ? 1 : 0,
        pointerEvents: 'none',
        borderRadius: '0 2px 2px 0',
        boxShadow: '0 0 10px rgba(29, 78, 216, 0.5)',
      }}
    />
  )
}
