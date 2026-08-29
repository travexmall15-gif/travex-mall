// ═══════════════════════════════════════════════════════════
// SHOPNEKT — Request Deduplication
// Prevent duplicate API/database requests
// ═══════════════════════════════════════════════════════════

interface PendingRequest<T> {
  promise: Promise<T>
  timestamp: number
  subscribers: Set<(result: T | Error) => void>
}

class RequestDeduplicator {
  private pendingRequests: Map<string, PendingRequest<any>> = new Map()
  private readonly CLEANUP_INTERVAL = 60000 // 1 minute
  private readonly REQUEST_TIMEOUT = 30000 // 30 seconds

  constructor() {
    // Periodically clean up stale requests
    setInterval(() => this.cleanup(), this.CLEANUP_INTERVAL)
  }

  private generateKey(endpoint: string, params?: any): string {
    return `${endpoint}${params ? JSON.stringify(params) : ''}`
  }

  async request<T>(
    endpoint: string,
    fetchFn: () => Promise<T>,
    params?: any
  ): Promise<T> {
    const key = this.generateKey(endpoint, params)
    const existing = this.pendingRequests.get(key)

    // If there's already a pending request, subscribe to it
    if (existing) {
      return new Promise<T>((resolve, reject) => {
        existing.subscribers.add((result) => {
          if (result instanceof Error) reject(result)
          else resolve(result as T)
        })
      })
    }

    // Create new request
    let resolvePromise: (value: T) => void
    let rejectPromise: (reason: Error) => void

    const promise = new Promise<T>((resolve, reject) => {
      resolvePromise = resolve
      rejectPromise = reject
    })

    const pending: PendingRequest<T> = {
      promise,
      timestamp: Date.now(),
      subscribers: new Set(),
    }

    this.pendingRequests.set(key, pending)

    // Execute the actual request
    fetchFn()
      .then((result) => {
        resolvePromise!(result)
        pending.subscribers.forEach((cb) => cb(result))
      })
      .catch((error) => {
        rejectPromise!(error)
        pending.subscribers.forEach((cb) => cb(error))
      })
      .finally(() => {
        // Clean up after a short delay to allow all subscribers to attach
        setTimeout(() => {
          this.pendingRequests.delete(key)
        }, 1000)
      })

    // Timeout handling
    setTimeout(() => {
      if (this.pendingRequests.has(key)) {
        const error = new Error(`Request timeout: ${endpoint}`)
        rejectPromise!(error)
        pending.subscribers.forEach((cb) => cb(error))
        this.pendingRequests.delete(key)
      }
    }, this.REQUEST_TIMEOUT)

    return promise
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, pending] of this.pendingRequests.entries()) {
      if (now - pending.timestamp > this.REQUEST_TIMEOUT) {
        this.pendingRequests.delete(key)
      }
    }
  }

  clear(): void {
    this.pendingRequests.clear()
  }
}

// Singleton instance
const deduplicator = new RequestDeduplicator()

export function deduplicateRequest<T>(
  endpoint: string,
  fetchFn: () => Promise<T>,
  params?: any
): Promise<T> {
  return deduplicator.request(endpoint, fetchFn, params)
}

export function clearRequestCache(): void {
  deduplicator.clear()
}
