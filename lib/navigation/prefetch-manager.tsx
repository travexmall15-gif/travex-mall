// ═══════════════════════════════════════════════════════════
// SHOPNEKT — Prefetch Manager
// Intelligent route and data prefetching
// ═══════════════════════════════════════════════════════════

'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Prefetch priority levels
export type PrefetchPriority = 'low' | 'normal' | 'high' | 'critical'

export interface PrefetchOptions {
  priority?: PrefetchPriority
  timeout?: number
  kind?: 'route' | 'data' | 'image'
}

interface PendingPrefetch {
  url: string
  priority: PrefetchPriority
  timestamp: number
  kind: 'route' | 'data' | 'image'
}

class PrefetchManagerImpl {
  private prefetchedRoutes: Set<string> = new Set()
  private prefetchedData: Map<string, { data: any; timestamp: number; ttl: number }> = new Map()
  private pendingQueue: PendingPrefetch[] = []
  private processing: boolean = false
  private router: ReturnType<typeof useRouter> | null = null

  setRouter(router: ReturnType<typeof useRouter>) {
    this.router = router
  }

  prefetchRoute(href: string, options: PrefetchOptions = {}): void {
    const { priority = 'normal', kind = 'route' } = options

    if (this.prefetchedRoutes.has(href)) return

    if (priority === 'critical' || priority === 'high') {
      this.executeRoutePrefetch(href)
      return
    }

    this.pendingQueue.push({ url: href, priority, timestamp: Date.now(), kind })

    if (!this.processing) this.processQueue()
  }

  private executeRoutePrefetch(href: string): void {
    if (this.prefetchedRoutes.has(href)) return
    this.prefetchedRoutes.add(href)

    if (typeof document !== 'undefined') {
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = href
      document.head.appendChild(link)
      setTimeout(() => { try { document.head.removeChild(link) } catch {} }, 2000)
    }

    if (this.router && 'prefetch' in this.router) {
      try { (this.router as any).prefetch(href) } catch {}
    }
  }

  private processQueue(): void {
    if (this.pendingQueue.length === 0) { this.processing = false; return }
    this.processing = true

    const priorityOrder: Record<PrefetchPriority, number> = { critical: 4, high: 3, normal: 2, low: 1 }
    this.pendingQueue.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])

    const item = this.pendingQueue.shift()
    if (item) {
      this.executeRoutePrefetch(item.url)
      setTimeout(() => this.processQueue(), 300)
    }
  }

  cacheData(key: string, data: any, ttlSeconds: number = 60): void {
    this.prefetchedData.set(key, { data, timestamp: Date.now(), ttl: ttlSeconds * 1000 })
  }

  getCachedData<T>(key: string): T | null {
    const cached = this.prefetchedData.get(key)
    if (!cached) return null
    const now = Date.now()
    if (now - cached.timestamp > cached.ttl) {
      this.prefetchedData.delete(key)
      return null
    }
    return cached.data as T
  }

  clearExpiredCache(): void {
    const now = Date.now()
    for (const [key, cached] of this.prefetchedData.entries()) {
      if (now - cached.timestamp > cached.ttl) this.prefetchedData.delete(key)
    }
  }

  clearCache(): void { this.prefetchedData.clear() }

  prefetchImage(src: string): void {
    if (typeof document === 'undefined') return
    const img = new Image()
    img.src = src
  }

  getRecommendedPrefetchRoutes(currentPath: string): string[] {
    const toPrefetch = ['/home', '/market', '/vybe']
    if (currentPath.startsWith('/market')) toPrefetch.push('/market/fashion', '/flash-deals')
    else if (currentPath.startsWith('/settings')) toPrefetch.push('/settings/profile', '/settings/security')
    else if (currentPath.startsWith('/store/')) toPrefetch.push('/messages', '/orders')
    return toPrefetch.filter(route => route !== currentPath && !this.prefetchedRoutes.has(route))
  }
}

let prefetchManagerInstance: PrefetchManagerImpl | null = null

export function getPrefetchManager(): PrefetchManagerImpl {
  if (!prefetchManagerInstance) prefetchManagerInstance = new PrefetchManagerImpl()
  return prefetchManagerInstance
}

export function cleanupPrefetchManager(): void {
  if (prefetchManagerInstance) {
    prefetchManagerInstance.clearCache()
    prefetchManagerInstance = null
  }
}

export function usePrefetch() {
  const router = useRouter()
  const managerRef = useRef<PrefetchManagerImpl | null>(null)

  if (!managerRef.current) {
    managerRef.current = getPrefetchManager()
    managerRef.current.setRouter(router)
  }

  const prefetch = useCallback((href: string, options: PrefetchOptions = {}) => {
    managerRef.current!.prefetchRoute(href, options)
  }, [])

  return prefetch
}

export function PrefetchLink({ href, priority = 'normal', children }: { href: string; priority?: PrefetchPriority; children: React.ReactNode }) {
  const prefetch = usePrefetch()
  useEffect(() => { prefetch(href, { priority, kind: 'route' }) }, [href, priority, prefetch])
  return <Link href={href} prefetch={false}>{children}</Link>
}
