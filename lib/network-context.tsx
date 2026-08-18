'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

type NetworkContextType = {
  isOnline: boolean
  isOffline: boolean
}

const NetworkContext = createContext<NetworkContextType>({ isOnline: true, isOffline: false })

export function useNetwork() {
  return useContext(NetworkContext)
}

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true)
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    // Initial check
    setIsOnline(navigator.onLine)
    setIsOffline(!navigator.onLine)

    let debounceTimer: ReturnType<typeof setTimeout> | null = null

    const handleOnline = () => {
      if (debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        setIsOnline(true)
        setIsOffline(false)
      }, 500) // Small debounce to avoid flickering
    }

    const handleOffline = () => {
      if (debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        setIsOnline(false)
        setIsOffline(true)
      }, 500)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      if (debounceTimer) clearTimeout(debounceTimer)
    }
  }, [])

  return (
    <NetworkContext.Provider value={{ isOnline, isOffline }}>
      {children}
    </NetworkContext.Provider>
  )
}
