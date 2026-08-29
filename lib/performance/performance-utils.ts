// ═══════════════════════════════════════════════════════════
// SHOPNEKT — Performance Utilities
// Common performance optimization utilities
// ═══════════════════════════════════════════════════════════

'use client'

import { useEffect, useRef, useCallback, useState } from 'react'

// Check if user prefers reduced motion
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mediaQuery.matches)
    
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])
  
  return reduced
}

// Debounce hook for search inputs and similar
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

// Throttle function
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): T {
  let inThrottle: boolean = false
  let lastResult: ReturnType<T> | undefined

  return function (this: any, ...args: any[]): ReturnType<T> {
    if (!inThrottle) {
      inThrottle = true
      lastResult = fn.apply(this, args)
      setTimeout(() => { inThrottle = false }, limit)
      return lastResult!
    }
    return lastResult!
  } as T
}

// Check connection type and speed
export function getConnectionInfo(): { effectiveType?: string; saveData?: boolean } {
  if (typeof navigator === 'undefined' || !navigator.connection) {
    return {}
  }
  const conn = navigator.connection as any
  return {
    effectiveType: conn.effectiveType,
    saveData: conn.saveData,
  }
}

// Image lazy loading observer
export function useLazyImageObserver() {
  const imageRefs = useRef<(HTMLImageElement | null)[]>([])

  const registerImage = useCallback((index: number) => (el: HTMLImageElement | null) => {
    imageRefs.current[index] = el
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target instanceof HTMLImageElement) {
            const img = entry.target
            const src = img.dataset.src
            if (src) {
              img.src = src
              img.removeAttribute('data-src')
              observer.unobserve(img)
            }
          }
        })
      },
      { rootMargin: '100px' }
    )

    imageRefs.current.forEach((img) => {
      if (img) observer.observe(img)
    })

    return () => observer.disconnect()
  }, [])

  return registerImage
}

// Track visibility for pausing/resuming operations
export function useVisibilityChange(onVisible: () => void, onHidden: () => void) {
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) onHidden()
      else onVisible()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [onVisible, onHidden])
}

// Get critical path routes for prefetching
export function getCriticalRoutes(currentPath: string): string[] {
  const toPrefetch = ['/home', '/market', '/vybe']
  
  if (currentPath.startsWith('/market')) {
    toPrefetch.push('/flash-deals', '/group-buy')
  } else if (currentPath.startsWith('/flash-deals')) {
    toPrefetch.push('/market', '/group-buy')
  } else if (currentPath.startsWith('/group-buy')) {
    toPrefetch.push('/market', '/flash-deals')
  } else if (currentPath.startsWith('/store/')) {
    toPrefetch.push('/messages', '/orders')
  }
  
  return toPrefetch.filter(route => route !== currentPath)
}

// Performance timing helper
export function measurePerformance(markName: string): { duration: number; mark: string } {
  if (typeof performance === 'undefined') {
    return { duration: 0, mark: markName }
  }
  
  const marks = performance.getEntriesByName(markName, 'mark')
  const measureName = `${markName}-duration`
  
  if (marks.length > 0) {
    performance.mark(`${markName}-end`)
    performance.measure(measureName, markName, `${markName}-end`)
    const measures = performance.getEntriesByName(measureName, 'measure')
    
    if (measures.length > 0) {
      const duration = measures[0].duration
      performance.clearMarks(markName)
      performance.clearMarks(`${markName}-end`)
      performance.clearMeasures(measureName)
      
      return { duration, mark: markName }
    }
  }
  
  performance.mark(markName)
  return { duration: 0, mark: markName }
}
