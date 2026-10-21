'use client'

import { useEffect, useState } from 'react'

export type Theme = 'paper' | 'candlelit'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('paper')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('hc_theme') as Theme | null
    if (stored === 'paper' || stored === 'candlelit') {
      setTheme(stored)
      document.documentElement.setAttribute('data-theme', stored)
      if (stored === 'candlelit') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const initial: Theme = prefersDark ? 'candlelit' : 'paper'
      setTheme(initial)
      document.documentElement.setAttribute('data-theme', initial)
      if (initial === 'candlelit') {
        document.documentElement.classList.add('dark')
      }
    }

    const matcher = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('hc_theme')) {
        const next: Theme = e.matches ? 'candlelit' : 'paper'
        setTheme(next)
        document.documentElement.setAttribute('data-theme', next)
        if (next === 'candlelit') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }
    }
    matcher.addEventListener('change', handler)
    return () => matcher.removeEventListener('change', handler)
  }, [])

  function toggleTheme() {
    const next: Theme = theme === 'paper' ? 'candlelit' : 'paper'
    setTheme(next)
    localStorage.setItem('hc_theme', next)
    document.documentElement.setAttribute('data-theme', next)
    if (next === 'candlelit') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  return { theme, toggleTheme, mounted }
}
