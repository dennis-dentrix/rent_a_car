import { describe, expect, it } from 'vitest'
import { colors } from './index.js'

// WCAG 2.1 relative luminance and contrast ratio. Translucent colours are laid over the page first.
const parse = (value) => {
  if (value.startsWith('#')) {
    const n = parseInt(value.slice(1), 16)
    return { rgb: [(n >> 16) & 255, (n >> 8) & 255, n & 255], alpha: 1 }
  }
  const [r, g, b, a = 1] = value.match(/[\d.]+/g).map(Number)
  return { rgb: [r, g, b], alpha: a }
}

const over = (top, bottom) => {
  const { rgb, alpha } = parse(top)
  const base = parse(bottom).rgb
  return rgb.map((c, i) => c * alpha + base[i] * (1 - alpha))
}

const luminance = (rgb) => {
  const [r, g, b] = rgb.map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

const ratio = (foreground, background, page) => {
  const bg = over(background, page)
  const fg = over(foreground, `rgb(${bg.join(',')})`)
  const [light, dark] = [luminance(fg), luminance(bg)].sort((a, b) => b - a)
  return (light + 0.05) / (dark + 0.05)
}

const TEXT_ON_PAGE = [
  'label',
  'label-2',
  'primary',
  'accent',
  'success',
  'warning',
  'error',
  'verified',
]
const SURFACES = ['bg', 'bg-grouped', 'surface']

describe.each(['light', 'dark'])('%s theme contrast', (theme) => {
  const c = colors[theme]

  it.each(TEXT_ON_PAGE.flatMap((text) => SURFACES.map((surface) => [text, surface])))(
    'reads %s on %s at 4.5:1 or better',
    (text, surface) => {
      expect(ratio(c[text], c[surface], c.bg)).toBeGreaterThanOrEqual(4.5)
    },
  )

  it.each(['success', 'warning', 'error', 'info'])(
    'reads %s on its own tint at 4.5:1 or better',
    (name) => {
      expect(ratio(c[name], c[`${name}-bg`], c.bg)).toBeGreaterThanOrEqual(4.5)
    },
  )

  it('reads the primary button and the peach badge', () => {
    expect(ratio(c['on-primary'], c.primary, c.bg)).toBeGreaterThanOrEqual(4.5)
    expect(ratio(c.tertiary, c['tertiary-bg'], c.bg)).toBeGreaterThanOrEqual(4.5)
  })

  it('reads amber on its badge background', () => {
    expect(ratio(c.verified, c['verified-bg'], c.bg)).toBeGreaterThanOrEqual(4.5)
  })

  it('reads text on the accent button and on the tonal button', () => {
    expect(ratio(c['on-accent'], c.accent, c.bg)).toBeGreaterThanOrEqual(4.5)
    expect(ratio(c.accent, c['accent-subtle'], c.bg)).toBeGreaterThanOrEqual(4.5)
  })

  it('reads white and soft white text on the navy hero', () => {
    expect(ratio(c['on-hero'], c.hero, c.bg)).toBeGreaterThanOrEqual(4.5)
    expect(ratio(c['on-hero-2'], c.hero, c.bg)).toBeGreaterThanOrEqual(4.5)
  })

  it('keeps label-3 to placeholders at 3:1 or better', () => {
    expect(ratio(c['label-3'], c.fill, c.bg)).toBeGreaterThanOrEqual(3)
  })
})
