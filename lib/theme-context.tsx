'use client'
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

type Theme = 'light' | 'dark' | 'system'
type FontSize = 'small' | 'medium' | 'large'

interface ThemeCtx {
  theme:       Theme
  fontSize:    FontSize
  setTheme:    (t: Theme)    => void
  setFontSize: (f: FontSize) => void
  isDark:      boolean
}

const Ctx = createContext<ThemeCtx>({
  theme: 'light', fontSize: 'medium',
  setTheme: () => {}, setFontSize: () => {}, isDark: false,
})

const FONT_SIZES = { small: '14px', medium: '16px', large: '18px' }

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme,    setThemeState]    = useState<Theme>('light')
  const [fontSize, setFontSizeState] = useState<FontSize>('medium')

  useEffect(() => {
    try {
      const p = JSON.parse(localStorage.getItem('sn_appearance') || '{}')
      if (p.theme)    applyTheme(p.theme,    false)
      if (p.fontSize) applyFont(p.fontSize,  false)
    } catch {}

    // Listen for system dark mode
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handleSystem = () => {
      if (theme === 'system') applyTheme('system', false)
    }
    mq.addEventListener('change', handleSystem)
    return () => mq.removeEventListener('change', handleSystem)
  }, [])

  const applyTheme = (t: Theme, save = true) => {
    setThemeState(t)
    const isDark = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    if (save) {
      const p = JSON.parse(localStorage.getItem('sn_appearance') || '{}')
      localStorage.setItem('sn_appearance', JSON.stringify({ ...p, theme: t }))
    }
  }

  const applyFont = (f: FontSize, save = true) => {
    setFontSizeState(f)
    document.documentElement.style.setProperty('--base-font', FONT_SIZES[f])
    if (save) {
      const p = JSON.parse(localStorage.getItem('sn_appearance') || '{}')
      localStorage.setItem('sn_appearance', JSON.stringify({ ...p, fontSize: f }))
    }
  }

  const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  return (
    <Ctx.Provider value={{
      theme, fontSize, isDark,
      setTheme:    (t) => applyTheme(t),
      setFontSize: (f) => applyFont(f),
    }}>
      {children}
    </Ctx.Provider>
  )
}

export const useTheme = () => useContext(Ctx)
