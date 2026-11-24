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

// Status text colours. Each also gets a `-bg` tint (12 percent in light, 20 percent in dark).
const status = {
  light: { success: '#166534', warning: '#9A4A07', error: '#BA1A1A', info: brand.accent },
  dark: { success: '#34D399', warning: '#FBBF24', error: '#FF8A80', info: brand.accentDark },
}

const statusColors = (palette, tint) =>
  Object.fromEntries(
    Object.entries(palette).flatMap(([name, value]) => [
      [name, value],
      [`${name}-bg`, rgba(value, tint)],
    ]),
  )

const light = {
  bg: '#F9F9FF',
  'bg-grouped': '#F1F3FF',
  surface: '#FFFFFF',
  fill: '#E9EDFF',
  label: '#141B2B',
  'label-2': '#424753',
  'label-3': '#727785',
  separator: '#DCE2F7',
  primary: brand.primary,
  'on-primary': '#FFFFFF',
  tertiary: '#713B00',
  'tertiary-bg': '#FFDCC3',
  accent: brand.accent,
  'accent-pressed': shade(brand.accent, 0.28),
  'accent-subtle': rgba(brand.accent, 0.14),
  'on-accent': '#FFFFFF',
  verified: '#92400E',
  'verified-bg': '#FEF3C7',
  'mark-pin': brand.markPin,
  overlay: 'rgba(255,255,255,0.85)',
  scrim: 'rgba(20,27,43,0.4)',
  hero: brand.navy,
  'hero-to': brand.accent,
  'on-hero': '#FFFFFF',
  'on-hero-2': 'rgba(255,255,255,0.76)',
  'hero-glass': 'rgba(255,255,255,0.12)',
  'art-body': brand.navy,
  'art-glass': '#AFC6FF',
  'art-tire': '#141B2B',
  'art-hub': '#E1E8FD',
  'stage-from': '#F1F3FF',
  'stage-to': '#D8E2FF',
  ...statusColors(status.light, 0.12),
}

const dark = {
  bg: '#0B0F1A',
  'bg-grouped': '#121828',
  surface: '#1A2133',
  fill: '#232B40',
  label: '#F2F4FA',
  'label-2': '#B4BACB',
  'label-3': '#8A91A5',
  separator: '#2B3349',
  primary: shade(brand.accentDark, -0.35),
  'on-primary': '#0B0F1A',
  tertiary: '#FFB77D',
  'tertiary-bg': rgba('#F59E0B', 0.18),
  accent: brand.accentDark,
  'accent-pressed': shade(brand.accentDark, -0.28),
  'accent-subtle': rgba(brand.accentDark, 0.16),
  'on-accent': '#0B0F1A',
  verified: '#FFB77D',
  'verified-bg': rgba('#F59E0B', 0.16),
  'mark-pin': '#F59E0B',
  overlay: 'rgba(26,33,51,0.85)',
  scrim: 'rgba(0,0,0,0.6)',
  hero: '#0A2350',
  'hero-to': '#0A5CC8',
  'on-hero': '#FFFFFF',
  'on-hero-2': 'rgba(255,255,255,0.76)',
  'hero-glass': 'rgba(255,255,255,0.1)',
  'art-body': '#5B8DEF',
  'art-glass': '#1A2133',
  'art-tire': '#0B0F1A',
  'art-hub': '#B4BACB',
  'stage-from': '#232B40',
  'stage-to': '#1A2133',
  ...statusColors(status.dark, 0.2),
}

export const colors = { light, dark }

// A 4 px scale: p-1 is 4 px, p-4 is 16 px, p-6 is 24 px. The design uses 4, 8, 12, 16, 24, 32, 48, 64
// (docs/design-system.md); the other steps fill the gaps for layout.
const STEPS = [
  0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 20, 24, 28, 32, 36, 40, 44, 48,
  52, 56, 60, 64, 72, 80, 96,
]
export const space = Object.fromEntries(STEPS.map((step) => [step, `${step * 4}px`]))

export const radius = {
  control: '8px',
  card: '12px',
  panel: '16px',
  sheet: '20px',
  pill: '999px',
}

export const size = {
  touch: '44px',
  control: '48px',
  compact: '40px',
  row: '32px',
  tabbar: '64px',
  header: '56px',
  'header-wide': '72px',
}

export const z = { header: 100, stickyBar: 200, sheet: 300, dialog: 400, toast: 500 }

export const motion = {
  // UI motion stays under 300 ms. The built-in easings are too weak, so each curve is a stronger one: a hard
  // ease-out for things that enter or respond, an ease-in-out for things that move across the screen, and the
  // iOS drawer curve for sheets and panels.
  duration: { fast: '120ms', standard: '200ms', slow: '300ms', drawer: '320ms' },
  easing: {
    fast: 'cubic-bezier(0.23, 1, 0.32, 1)',
    standard: 'cubic-bezier(0.23, 1, 0.32, 1)',
    slow: 'cubic-bezier(0.77, 0, 0.175, 1)',
    drawer: 'cubic-bezier(0.32, 0.72, 0, 1)',
  },
}

export const shadow = {
  light: {
    1: '0 1px 3px rgba(17,24,39,0.04), 0 8px 24px rgba(8,47,106,0.04)',
    2: '0 12px 40px rgba(17,24,39,0.08)',
  },
  dark: {
    1: '0 1px 3px rgba(0,0,0,0.4)',
    2: '0 12px 40px rgba(0,0,0,0.5)',
  },
}

// The one typeface, Nunito Sans, loaded by next/font in app/layout.js and exposed as --font-sans (the name
// Tailwind uses for the default family). The system sans stack is the fallback while it loads.
export const fontFamily = {
  sans: 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const rem = (px) => `${px / 16}rem`

// [size px, line height px, weight, tracking em]. Phone sizes; the `-lg` variants are for desktop. Large text
// is tightened a little and small caps text opened a little, as Apple does with its own type.
const scale = {
  display: [34, 40, 700, -0.025],
  'display-lg': [44, 52, 700, -0.03],
  'title-1': [28, 34, 600, -0.02],
  'title-1-lg': [32, 40, 600, -0.02],
  'title-2': [22, 28, 600, -0.015],
  headline: [17, 24, 600, -0.01],
  body: [16, 24, 400, 0],
  callout: [15, 22, 400, 0],
  footnote: [13, 18, 400, 0],
  caption: [12, 16, 500, 0.02],
  price: [22, 28, 700, -0.015],
  'staff-label': [14, 20, 400, 0],
  'staff-heading': [12, 16, 600, 0.04],
}

export const type = Object.fromEntries(
  Object.entries(scale).map(([name, [px, line, weight, tracking]]) => [
    name,
    [rem(px), { lineHeight: rem(line), fontWeight: weight, letterSpacing: `${tracking}em` }],
  ]),
)
