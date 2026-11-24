'use client'

import { useEffect, useState } from 'react'
import { applyTheme, DEFAULT_THEME_MODE, THEME_KEY } from '@/lib/theme'

const saveMode = (mode) => {
  try {
    localStorage.setItem(THEME_KEY, mode)
  } catch {
    // Storage can be blocked (private windows); the choice then lasts until the page closes.
  }
}

const readMode = () => {
  try {
    return localStorage.getItem(THEME_KEY) || DEFAULT_THEME_MODE
  } catch {
    return DEFAULT_THEME_MODE
  }
}

/** The saved theme mode and a function to change it: applies it at once, follows the device in "system", keeps it on this device. */
export function useThemeMode() {
  const [mode, setMode] = useState(DEFAULT_THEME_MODE)

  useEffect(() => setMode(readMode()), [])

  useEffect(() => {
    if (mode !== 'system') return undefined
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const follow = () => applyTheme('system')
    query.addEventListener('change', follow)
    return () => query.removeEventListener('change', follow)
  }, [mode])

  const choose = (next) => {
    setMode(next)
    saveMode(next)
    applyTheme(next)
  }
  return [mode, choose]
}
