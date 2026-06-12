'use client'
import { useEffect } from 'react'
export default function OpenStorePage() {
  useEffect(() => { window.location.replace('/dashboard/open-store.html') }, [])
  return null
}
