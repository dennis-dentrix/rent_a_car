import { brand } from '@rent-a-car/shared/brand'

const toRgb = (hex) => {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

const rgba = (hex, alpha) => `rgba(${toRgb(hex).join(',')},${alpha})`

// Positive amount mixes toward black, negative toward white.
const shade = (hex, amount) => {
  const target = amount > 0 ? 0 : 255
  const weight = Math.abs(amount)
  const channels = toRgb(hex).map((c) => Math.round(c + (target - c) * weight))
  return `#${channels.map((c) => c.toString(16).padStart(2, '0')).join('')}`
}

const status = {
  light: { success: '#248A3D', warning: '#B25000', error: '#D70015', info: '#0066CC' },
  dark: { success: '#32D74B', warning: '#FF9F0A', error: '#FF453A', info: '#0A84FF' },
}

const buildColors = (theme, accent, tintAlpha, base) => ({
  'bg-base': theme.base,
  'bg-raised': theme.raised,
  'bg-overlay': theme.overlay,
  'bg-skeleton': theme.skeleton,
  'text-primary': theme.primary,
  'text-secondary': theme.secondary,
  'text-inverse': theme.inverse,
  'accent-default': accent,
  'accent-pressed': theme.pressed(accent),
  'accent-subtle': rgba(accent, tintAlpha),
  'accent-focus': accent,
  'border-subtle': theme.border,
  ...Object.fromEntries(
    Object.entries(base).flatMap(([name, value]) => [
      [`status-${name}`, value],
      [`status-${name}-bg`, rgba(value, tintAlpha)],
    ]),
  ),
})

export const colors = {
  light: buildColors(
    {
      base: '#FFFFFF',
      raised: '#F5F5F7',
      overlay: 'rgba(255,255,255,0.8)',
      skeleton: '#E5E5EA',
      primary: '#1D1D1F',
      secondary: '#6E6E73',
      inverse: '#FFFFFF',
      border: '#D2D2D7',
      pressed: (hex) => shade(hex, 0.1),
    },
    brand.accent,
    0.12,
    status.light,
  ),
  dark: buildColors(
    {
      base: '#000000',
      raised: '#1C1C1E',
      overlay: 'rgba(28,28,30,0.8)',
      skeleton: '#2C2C2E',
      primary: '#F5F5F7',
      secondary: '#98989D',
      inverse: '#000000',
      border: '#3A3A3C',
      pressed: (hex) => shade(hex, -0.1),
    },
    brand.accentDark,
    0.2,
    status.dark,
  ),
}

export const space = {
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '24px',
  6: '32px',
  7: '48px',
  8: '64px',
}

export const radius = { control: '8px', card: '12px', sheet: '16px', pill: '999px' }

export const size = { touch: '44px', row: '32px' }

export const z = { header: 100, stickyBar: 200, sheet: 300, dialog: 400, toast: 500 }

export const motion = {
  duration: { fast: '150ms', standard: '250ms', slow: '400ms' },
  easing: { fast: 'ease-out', standard: 'cubic-bezier(0.2, 0, 0, 1)', slow: 'ease-in-out' },
}

export const shadow = {
  light: { 1: '0 1px 3px rgba(0,0,0,0.08)', 2: '0 8px 24px rgba(0,0,0,0.12)' },
  dark: { 1: '0 1px 3px rgba(0,0,0,0.4)', 2: '0 8px 24px rgba(0,0,0,0.5)' },
}

export const fontFamily =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'

// [size, line height, weight]
export const type = {
  display: ['34px', '41px', 700],
  title1: ['28px', '34px', 700],
  title2: ['22px', '28px', 600],
  title3: ['20px', '25px', 600],
  body: ['17px', '22px', 400],
  callout: ['16px', '21px', 400],
  subhead: ['15px', '20px', 400],
  footnote: ['13px', '18px', 400],
  caption: ['12px', '16px', 500],
  'staff-label': ['14px', '20px', 400],
  'staff-heading': ['12px', '16px', 600],
}
