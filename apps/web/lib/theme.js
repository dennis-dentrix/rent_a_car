export const THEME_KEY = 'theme'
export const THEME_MODES = ['light', 'dark', 'system']
export const DEFAULT_THEME_MODE = 'light'

/**
 * Puts the colour theme on <html>: "light", "dark", or "system" (follow the device). It uses nothing from
 * outside itself, so the same function is also written into the page as an inline script and runs before
 * the first paint; that is why a saved choice never flashes the wrong theme.
 */
export function applyTheme(mode, root = document.documentElement, media = window.matchMedia) {
  const isDark =
    mode === 'dark' || (mode === 'system' && media('(prefers-color-scheme: dark)').matches)
  root.dataset.theme = isDark ? 'dark' : 'light'
}

// The inline script for <head>: read the saved mode (light if none or storage is blocked) and apply it.
export const themeInitScript = `(function(){var m=${JSON.stringify(DEFAULT_THEME_MODE)};try{m=localStorage.getItem(${JSON.stringify(THEME_KEY)})||m}catch(e){}(${applyTheme.toString()})(m)})()`
