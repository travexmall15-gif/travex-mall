'use client'
import { useEffect } from 'react'
export default function SubscriptionRedirect() {
  useEffect(() => { window.location.replace('/dashboard/subscription.html') }, [])
  return null
}
