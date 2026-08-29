// ═══════════════════════════════════════════════════════════
// SHOPNEKT — Loading Manager
// Centralized loading state management with skeletons
// ═══════════════════════════════════════════════════════════

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

export type LoadingKey = 
  | 'global'
  | 'vybe-feed'
  | 'market-products'
  | 'flash-deals'
  | 'group-buys'
  | 'messages'
  | 'orders'
  | 'store-products'
  | 'search-results'
  | string

interface LoadingState {
  isLoading: boolean
  progress: number
  error: string | null
  loadedAt: number | null
}

interface LoadingManagerType {
  startLoading: (key: LoadingKey) => void
  stopLoading: (key: LoadingKey) => void
  setError: (key: LoadingKey, error: string | null) => void
  isLoading: (key: LoadingKey) => boolean
  getProgress: (key: LoadingKey) => number
  getError: (key: LoadingKey) => string | null
  subscribe: (callback: (states: Map<LoadingKey, LoadingState>) => void) => () => void
  clearAll: () => void
}

class LoadingManagerImpl implements LoadingManagerType {
  private states: Map<LoadingKey, LoadingState> = new Map()
  private listeners: Set<(states: Map<LoadingKey, LoadingState>) => void> = new Set()

  private notifyListeners() {
    this.listeners.forEach(listener => {
      try { listener(new Map(this.states)) } catch (e) { console.error('LoadingManager listener error:', e) }
    })
  }

  subscribe(callback: (states: Map<LoadingKey, LoadingState>) => void): () => void {
    this.listeners.add(callback)
    callback(new Map(this.states))
    return () => this.listeners.delete(callback)
  }

  startLoading(key: LoadingKey): void {
    this.states.set(key, {
      isLoading: true,
      progress: 0,
      error: null,
      loadedAt: null,
    })
    this.notifyListeners()

    // Simulate progress
    let progress = 0
    const interval = setInterval(() => {
      progress = Math.min(progress + 10, 90)
      const state = this.states.get(key)
      if (state && state.isLoading) {
        this.states.set(key, { ...state, progress })
        this.notifyListeners()
      } else {
        clearInterval(interval)
      }
    }, 100)

    // Store interval ID for cleanup
    ;(this.states.get(key) as any)._interval = interval
  }

  stopLoading(key: LoadingKey): void {
    const state = this.states.get(key)
    if (state && state._interval) {
      clearInterval(state._interval)
    }
    
    this.states.set(key, {
      isLoading: false,
      progress: 100,
      error: null,
      loadedAt: Date.now(),
    })
    this.notifyListeners()

    // Clear after delay
    setTimeout(() => {
      const currentState = this.states.get(key)
      if (currentState && !currentState.isLoading) {
        this.states.delete(key)
        this.notifyListeners()
      }
    }, 500)
  }

  setError(key: LoadingKey, error: string | null): void {
    const state = this.states.get(key)
    if (state) {
      this.states.set(key, {
        ...state,
        isLoading: false,
        error,
      })
      this.notifyListeners()
    }
  }

  isLoading(key: LoadingKey): boolean {
    return this.states.get(key)?.isLoading ?? false
  }

  getProgress(key: LoadingKey): number {
    return this.states.get(key)?.progress ?? 0
  }

  getError(key: LoadingKey): string | null {
    return this.states.get(key)?.error ?? null
  }

  clearAll(): void {
    // Clear all intervals
    this.states.forEach((state) => {
      if ((state as any)._interval) {
        clearInterval((state as any)._interval)
      }
    })
    this.states.clear()
    this.notifyListeners()
  }
}

let loadingManagerInstance: LoadingManagerImpl | null = null

export function getLoadingManager(): LoadingManagerType {
  if (!loadingManagerInstance) loadingManagerInstance = new LoadingManagerImpl()
  return loadingManagerInstance
}

export function cleanupLoadingManager(): void {
  if (loadingManagerInstance) {
    loadingManagerInstance.clearAll()
    loadingManagerInstance = null
  }
}

// Hook for using loading manager
export function useLoading(key: LoadingKey) {
  const managerRef = useRef<LoadingManagerImpl>(getLoadingManager() as LoadingManagerImpl)
  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    progress: 0,
    error: null,
    loadedAt: null,
  })

  useEffect(() => {
    const unsubscribe = managerRef.current.subscribe((states) => {
      const keyState = states.get(key)
      if (keyState) setState(keyState)
    })
    return () => unsubscribe()
  }, [key])

  const startLoading = useCallback(() => {
    managerRef.current.startLoading(key)
  }, [key])

  const stopLoading = useCallback(() => {
    managerRef.current.stopLoading(key)
  }, [key])

  const setError = useCallback((error: string | null) => {
    managerRef.current.setError(key, error)
  }, [key])

  return {
    isLoading: state.isLoading,
    progress: state.progress,
    error: state.error,
    startLoading,
    stopLoading,
    setError,
  }
}

// Skeleton component helper
export function Skeleton({ className = '', style = {} }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
      style={style}
    />
  )
}
