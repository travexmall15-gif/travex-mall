'use client'
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

type Theme    = 'light' | 'dark' | 'system'
type FontSize = 'small' | 'medium' | 'large'

interface ThemeCtx {
  theme:       Theme
  fontSize:    FontSize
  isDark:      boolean
  setTheme:    (t: Theme)    => void
  setFontSize: (f: FontSize) => void
}

const Ctx = createContext<ThemeCtx>({
  theme:'light', fontSize:'medium', isDark:false,
  setTheme:()=>{}, setFontSize:()=>{},
})

function resolveIsDark(t: Theme): boolean {
  if (t === 'dark')   {return true}
  if (t === 'light')  {return false}
  if (typeof window !== 'undefined')
    {return window.matchMedia('(prefers-color-scheme: dark)').matches}
  return false
}

function applyThemeToDOM(t: Theme) {
  const dark = resolveIsDark(t)
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
}

function applyFontToDOM(f: FontSize) {
  document.documentElement.setAttribute('data-fontsize', f)
  const sizes = { small:'13px', medium:'16px', large:'19px' }
  document.documentElement.style.fontSize = sizes[f]
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme,    setThemeState]    = useState<Theme>('light')
  const [fontSize, setFontSizeState] = useState<FontSize>('medium')
  const [isDark,   setIsDark]        = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const p = JSON.parse(localStorage.getItem('sn_appearance') || '{}')
      const t = (p.theme    || 'light')  as Theme
      const f = (p.fontSize || 'medium') as FontSize
      setThemeState(t)
      setFontSizeState(f)
      setIsDark(resolveIsDark(t))
      applyThemeToDOM(t)
      applyFontToDOM(f)
    } catch {}

    // System theme listener
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onSystem = () => {
      if (theme === 'system') {
        setIsDark(mq.matches)
        applyThemeToDOM('system')
      }
    }
    mq.addEventListener('change', onSystem)
    return () => mq.removeEventListener('change', onSystem)
  }, [])

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t)
    const dark = resolveIsDark(t)
    setIsDark(dark)
    applyThemeToDOM(t)
    // Save
    try {
      const p = JSON.parse(localStorage.getItem('sn_appearance') || '{}')
      localStorage.setItem('sn_appearance', JSON.stringify({ ...p, theme: t }))
    } catch {}
  }, [])

  const setFontSize = useCallback((f: FontSize) => {
    setFontSizeState(f)
    applyFontToDOM(f)
    // Save
    try {
      const p = JSON.parse(localStorage.getItem('sn_appearance') || '{}')
      localStorage.setItem('sn_appearance', JSON.stringify({ ...p, fontSize: f }))
    } catch {}
  }, [])

  return (
    <Ctx.Provider value={{ theme, fontSize, isDark, setTheme, setFontSize }}>
      {children}
    </Ctx.Provider>
  )
}

export const useTheme = () => useContext(Ctx)
