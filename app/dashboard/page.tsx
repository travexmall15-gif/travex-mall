'use client'
import { useEffect } from 'react'
export default function DashboardPage() {
  useEffect(() => { window.location.replace('/dashboard/dashboard.html') }, [])
  return null
}
