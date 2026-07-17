'use client'
import { useTranslation } from '@/hooks/useTranslation'

interface Props { k: string; vars?: Record<string, string | number> }

// Key-based: <T k="nav.home" />
export function T({ k, vars }: Props) {
  const { t } = useTranslation()
  return <>{t(k, vars)}</>
}

// Re-export hook for string contexts
export { useTranslation }
