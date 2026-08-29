'use client'
import { useEffect, useState, useRef } from 'react'
import { usePathname } from 'next/navigation'

export function NavigationProgress() {
  const pathname = usePathname()
  const [width,   setWidth]   = useState(0)
  const [visible, setVisible] = useState(false)
  const prev = useRef(pathname)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    if (pathname === prev.current) {return}
    prev.current = pathname

    // Clear any pending timers
    timers.current.forEach(clearTimeout)
    timers.current = []

    // Start progress
    setVisible(true)
    setWidth(0)

    const t1 = setTimeout(() => setWidth(30), 50)
    const t2 = setTimeout(() => setWidth(60), 300)
    const t3 = setTimeout(() => setWidth(80), 600)
    const t4 = setTimeout(() => setWidth(95), 900)
    const t5 = setTimeout(() => {
      setWidth(100)
      const t6 = setTimeout(() => {
        setVisible(false)
        setWidth(0)
      }, 300)
      timers.current.push(t6)
    }, 1100)

    timers.current = [t1, t2, t3, t4, t5]

    return () => timers.current.forEach(clearTimeout)
  }, [pathname])

  if (!visible && width === 0) {return null}

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: 2,
        width: `${width}%`,
        background: 'var(--sn-primary, #1D4ED8)',
        zIndex: 10000,
        transition: width === 100 ? 'width 0.2s ease, opacity 0.3s ease' : 'width 0.4s ease',
        opacity: visible ? 1 : 0,
        pointerEvents: 'none',
        borderRadius: '0 999px 999px 0',
      }}
    />
  )
}
