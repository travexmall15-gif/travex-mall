// ═══════════════════════════════════════════════════════════
// SHOPNEKT — Navigation Manager
// Central navigation control with progress tracking
// ═══════════════════════════════════════════════════════════

'use client'

import { useRouter } from 'next/navigation'
import { useRef } from 'react'

export type NavigationState = 'idle' | 'starting' | 'loading' | 'ready' | 'completing'

export interface NavigationManagerType {
  startNavigation: () => void
  completeNavigation: () => void
  cancelNavigation: () => void
  getState: () => NavigationState
  getProgress: () => number
  subscribe: (callback: (state: NavigationState, progress: number) => void) => () => void
  updateProgress: (progress: number) => void
}

class NavigationManagerImpl implements NavigationManagerType {
  private state: NavigationState = 'idle'
  private progressValue: number = 0
  private listeners: Set<(state: NavigationState, progress: number) => void> = new Set()
  private pendingTimeouts: ReturnType<typeof setTimeout>[] = []

  getState(): NavigationState { return this.state }
  getProgress(): number { return this.progressValue }

  private setState(newState: NavigationState, progress?: number) {
    this.state = newState
    if (progress !== undefined) this.progressValue = progress
    this.notifyListeners()
  }

  private notifyListeners() {
    this.listeners.forEach(listener => {
      try { listener(this.state, this.progressValue) } catch (e) { console.error('NavigationManager listener error:', e) }
    })
  }

  subscribe(callback: (state: NavigationState, progress: number) => void): () => void {
    this.listeners.add(callback)
    callback(this.state, this.progressValue)
    return () => this.listeners.delete(callback)
  }

  startNavigation(): void {
    this.pendingTimeouts.forEach(t => clearTimeout(t))
    this.pendingTimeouts = []
    this.setState('starting', 0)

    const t1 = setTimeout(() => { if (this.state === 'starting' || this.state === 'loading') this.setState('loading', 30) }, 50)
    const t2 = setTimeout(() => { if (this.state === 'loading') this.setState('loading', 60) }, 200)
    const t3 = setTimeout(() => { if (this.state === 'loading') this.setState('loading', 85) }, 400)

    this.pendingTimeouts = [t1, t2, t3]
  }

  updateProgress(progress: number): void {
    if (this.state === 'idle' || this.state === 'completing') return
    this.progressValue = Math.min(95, Math.max(0, progress))
    this.notifyListeners()
  }

  completeNavigation(): void {
    this.pendingTimeouts.forEach(t => clearTimeout(t))
    this.pendingTimeouts = []
    this.setState('completing', 100)

    const resetTimeout = setTimeout(() => {
      if (this.state === 'completing') this.setState('idle', 0)
    }, 200)

    this.pendingTimeouts.push(resetTimeout)
  }

  cancelNavigation(): void {
    this.pendingTimeouts.forEach(t => clearTimeout(t))
    this.pendingTimeouts = []
    this.setState('idle', 0)
  }

  cleanup(): void {
    this.pendingTimeouts.forEach(t => clearTimeout(t))
    this.pendingTimeouts = []
    this.listeners.clear()
    this.state = 'idle'
    this.progressValue = 0
  }
}

let navigationManagerInstance: NavigationManagerImpl | null = null

export function getNavigationManager(): NavigationManagerType {
  if (!navigationManagerInstance) navigationManagerInstance = new NavigationManagerImpl()
  return navigationManagerInstance
}

export function cleanupNavigationManager(): void {
  if (navigationManagerInstance) {
    navigationManagerInstance.cleanup()
    navigationManagerInstance = null
  }
}

export function useNavigationManager(): NavigationManagerType {
  const managerRef = useRef<NavigationManagerImpl | null>(null)
  if (!managerRef.current) managerRef.current = new NavigationManagerImpl()
  return managerRef.current
}
