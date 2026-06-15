'use client'
import { useEffect } from 'react'
export default function AdminRedirect() {
  useEffect(() => { window.location.replace('/dashboard/admin-panel.html') }, [])
  return null
}
