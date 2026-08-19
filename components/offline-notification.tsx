'use client'
import { useEffect, useState } from 'react'

export function OfflineNotification() {
  const [online,   setOnline]   = useState(true)
  const [showBack, setShowBack] = useState(false)
  const [mounted,  setMounted]  = useState(false)

  useEffect(() => {
    setMounted(true)
    setOnline(navigator.onLine)

    let backTimer: ReturnType<typeof setTimeout>

    const onOnline = () => {
      setOnline(true)
      setShowBack(true)
      backTimer = setTimeout(() => setShowBack(false), 3500)
    }
    const onOffline = () => {
      setOnline(false)
      setShowBack(false)
      clearTimeout(backTimer)
    }

    window.addEventListener('online',  onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online',  onOnline)
      window.removeEventListener('offline', onOffline)
      clearTimeout(backTimer)
    }
  }, [])

  if (!mounted) return null
  if (online && !showBack) return null

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: 76,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9998,
        background: online ? '#111827' : '#374151',
        color: '#fff',
        padding: '10px 22px',
        borderRadius: 999,
        fontSize: '0.78rem',
        fontWeight: 600,
        boxShadow: '0 4px 20px rgba(0,0,0,0.22)',
        whiteSpace: 'nowrap',
        fontFamily: 'var(--sn-font, Inter, sans-serif)',
        letterSpacing: '0.01em',
      }}
    >
      {online
        ? 'You\'re back online'
        : 'You are not connected to the internet'}
    </div>
  )
}
