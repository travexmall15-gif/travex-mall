'use client'
import { useEffect } from 'react'
export default function OpenStorePage() {
  useEffect(() => { window.location.replace('/dashboard/open-store-b2b.html') }, [])
  return null
}
