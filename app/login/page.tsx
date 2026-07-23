'use client'
import { useTranslation } from "@/hooks/useTranslation"
import { useEffect } from 'react'
export default function LoginRedirect() {
  const { t } = useTranslation()
  useEffect(() => { window.location.replace('/dashboard/login.html') }, [])
  return null
}
