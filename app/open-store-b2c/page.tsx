'use client'
import { useEffect } from 'react'
export default function OpenStorePage() {
  useEffect(() => { window.location.replace('/dashboard/open-store-v2.html') }, [])
  return null
}
