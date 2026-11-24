import { describe, expect, it } from 'vitest'
import { applyTheme, themeInitScript } from './theme.js'

const deviceIs = (isDark) => () => ({ matches: isDark })

describe('applyTheme', () => {
  const themeFor = (mode, isDark = false) => {
    const root = { dataset: {} }
    applyTheme(mode, root, deviceIs(isDark))
    return root.dataset.theme
  }

  it('is light unless dark is chosen', () => {
    expect(themeFor('light', true)).toBe('light')
    expect(themeFor('dark', false)).toBe('dark')
  })

  it('follows the device only in system mode', () => {
    expect(themeFor('system', true)).toBe('dark')
    expect(themeFor('system', false)).toBe('light')
  })

  it('treats an unknown saved value as light', () => {
    expect(themeFor('sepia', true)).toBe('light')
  })
})

describe('themeInitScript', () => {
  it('reads the saved mode and applies it with no outside names', () => {
    const root = { dataset: {} }
    const run = new Function('localStorage', 'document', 'window', `${themeInitScript}`)
    run({ getItem: () => 'dark' }, { documentElement: root }, { matchMedia: deviceIs(false) })
    expect(root.dataset.theme).toBe('dark')
  })

  it('falls back to light when storage is blocked', () => {
    const root = { dataset: {} }
    const run = new Function('localStorage', 'document', 'window', themeInitScript)
    run(
      {
        getItem: () => {
          throw new Error('blocked')
        },
      },
      { documentElement: root },
      { matchMedia: deviceIs(true) },
    )
    expect(root.dataset.theme).toBe('light')
  })
})
