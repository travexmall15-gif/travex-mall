'use client'
import { useTranslation } from "@/hooks/useTranslation"
import { useEffect } from 'react'
export default function SubscriptionRedirect() {
  const { t } = useTranslation()
  useEffect(() => { window.location.replace('/dashboard/subscription.html') }, [])
  return null
}
