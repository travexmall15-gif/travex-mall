'use client'
import { useEffect } from 'react'
export default function OpenStorePage() {
  useEffect(() => { window.location.replace('/open-store') }, [])
  return null
}
