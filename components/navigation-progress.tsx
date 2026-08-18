'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export function NavigationProgress() {
  const pathname = usePathname()
  const [progress, setProgress] = useState<number | null>(null)

  useEffect(() => {
    // Start progress when pathname changes
    setProgress(0)
    
    let currentProgress = 0
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15
      if (currentProgress > 90) {
        currentProgress = 90
      }
      setProgress(currentProgress)
    }, 150)

    // Complete progress after a short delay (simulating route transition complete)
    const timeout = setTimeout(() => {
      clearInterval(interval)
      setProgress(100)
      // Hide after completion
      setTimeout(() => setProgress(null), 300)
    }, 600)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [pathname])

  if (progress === null) {
    return null
  }

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          backgroundColor: 'rgba(13, 27, 62, 0.1)',
          zIndex: 10000,
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            backgroundColor: '#0D1B3E',
            transition: progress === 100 ? 'width 0.3s ease-out' : 'width 0.15s ease-out',
            background: 'linear-gradient(90deg, #0D1B3E 0%, #1e3a8a 50%, #0D1B3E 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite linear',
            borderRadius: '0 2px 2px 0',
          }}
        />
      </div>
    </>
  )
}
