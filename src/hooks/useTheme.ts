import { useCallback, useEffect, useState } from 'react'
import { KEYS } from '@/lib/storage'

export type Theme = 'light' | 'dark'

const DARK_QUERY = '(prefers-color-scheme: dark)'
const GROUND: Record<Theme, string> = { light: '#f5f6f8', dark: '#121417' }

function read(): Theme | null {
  try {
    const stored = localStorage.getItem(KEYS.theme)
    return stored === 'light' || stored === 'dark' ? stored : null
  } catch {
    return null
  }
}

/**
 * The editor's light or dark. A stored choice wins; otherwise the device decides and the
 * page follows it if it changes. The sheet itself is never dark — it is paper.
 */
export function useTheme(): [Theme, (theme: Theme) => void] {
  const [choice, setChoice] = useState<Theme | null>(read)
  const [system, setSystem] = useState<Theme>(() =>
    window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light',
  )

  useEffect(() => {
    const media = window.matchMedia(DARK_QUERY)
    const handleChange = (event: MediaQueryListEvent) => setSystem(event.matches ? 'dark' : 'light')
    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [])

  const theme = choice ?? system

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', GROUND[theme])
  }, [theme])

  const set = useCallback((next: Theme) => {
    setChoice(next)
    try {
      localStorage.setItem(KEYS.theme, next)
    } catch {
      // Private mode: the choice lasts the session.
    }
  }, [])

  return [theme, set]
}
