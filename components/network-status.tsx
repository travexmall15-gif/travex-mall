'use client'

import { useEffect, useState } from 'react'
import { useNetwork } from '@/lib/network-context'
import { WifiOff, Wifi } from 'lucide-react'

export function NetworkStatus() {
  const { isOnline, isOffline } = useNetwork()
  const [showMessage, setShowMessage] = useState(false)
  const [message, setMessage] = useState<'offline' | 'online' | null>(null)

  useEffect(() => {
    if (isOffline) {
      setMessage('offline')
      setShowMessage(true)
    } else if (isOnline && message === 'offline') {
      // Just came back online
      setMessage('online')
      setShowMessage(true)
      // Auto-hide after 3 seconds
      const timer = setTimeout(() => {
        setShowMessage(false)
        setMessage(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isOnline, isOffline, message])

  if (!showMessage || message === null) {
    return null
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        animation: 'slideUp 0.3s ease-out',
      }}
    >
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 20px',
          borderRadius: '999px',
          background: message === 'offline' ? '#DC2626' : '#16A34A',
          color: '#fff',
          fontSize: '0.82rem',
          fontWeight: 600,
          boxShadow: '0 4px 16px rgba(0,0,0,0.20)',
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {message === 'offline' ? (
          <>
            <WifiOff size={16} />
            <span>You're not connected to the internet</span>
          </>
        ) : (
          <>
            <Wifi size={16} />
            <span>You're back online</span>
          </>
        )}
      </div>
    </div>
  )
}
