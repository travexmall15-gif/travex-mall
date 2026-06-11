'use client'

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastType = 'success' | 'error' | 'info'
type Toast = { id: number; message: string; type: ToastType }

const ToastContext = createContext<{
  toast: (message: string, type?: ToastType) => void
}>({ toast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3500)
  }, [])

  const remove = (id: number) =>
    setToasts((prev) => prev.filter((t) => t.id !== id))

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-success" />,
    error: <XCircle className="h-5 w-5 text-destructive" />,
    info: <Info className="h-5 w-5 text-secondary" />,
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2 px-4 md:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="animate-slide-in pointer-events-auto flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-lg"
          >
            {icons[t.type]}
            <p className="flex-1 text-sm font-medium text-ink">{t.message}</p>
            <button
              onClick={() => remove(t.id)}
              aria-label="Dismiss"
              className="text-muted-foreground hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function cnToast(...args: Parameters<typeof cn>) {
  return cn(...args)
}
