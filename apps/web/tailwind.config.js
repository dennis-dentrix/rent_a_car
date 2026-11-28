import plugin from 'tailwindcss/plugin'
import {
  colors,
  space,
  radius,
  size,
  maxWidth,
  screens,
  z,
  motion,
  shadow,
  fontFamily,
  type,
} from './styles/tokens/index.js'

const cssVars = (palette, shadows) => ({
  ...Object.fromEntries(Object.entries(palette).map(([name, value]) => [`--color-${name}`, value])),
  '--shadow-1': shadows[1],
  '--shadow-2': shadows[2],
})

const colorUtilities = Object.fromEntries(
  Object.keys(colors.light).map((name) => [name, `var(--color-${name})`]),
)

/** @type {import('tailwindcss').Config} */
export default {
  // hover: styles apply only on devices that can hover, so a tap on a phone never leaves a stuck hover state.
  future: { hoverOnlyWhenSupported: true },
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}', './copy/**/*.js'],
  theme: {
    screens,
    colors: { transparent: 'transparent', current: 'currentColor', ...colorUtilities },
    spacing: { 0: '0px', ...space, ...size },
    borderRadius: { none: '0', ...radius },
    zIndex: z,
    fontFamily,
    fontSize: type,
    boxShadow: { 1: 'var(--shadow-1)', 2: 'var(--shadow-2)', none: 'none' },
    transitionDuration: motion.duration,
    transitionTimingFunction: motion.easing,
    extend: {
      maxWidth,
      backgroundImage: {
        hero: 'linear-gradient(135deg, var(--color-hero) 0%, var(--color-primary) 55%, var(--color-hero-to) 120%)',
      },
      keyframes: {
        // The arc fades in as it starts, so its round end does not appear out of nowhere.
        draw: {
          '0%': { strokeDashoffset: '1', opacity: '0' },
          '15%': { opacity: '0.3' },
          '100%': { strokeDashoffset: '0', opacity: '0.3' },
        },
        // Size eases over the whole cycle; each ring fades in, then out, and never jumps back into view.
        beacon: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(3.4)' },
        },
        'beacon-fade': {
          '0%, 100%': { opacity: '0' },
          '18%': { opacity: '0.45' },
        },
        'drawer-in': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        rise: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        draw: 'draw 2400ms cubic-bezier(0.65, 0, 0.35, 1) 150ms both',
        beacon:
          'beacon 3200ms cubic-bezier(0.22, 0.61, 0.36, 1) infinite, beacon-fade 3200ms ease-in-out infinite',
        'drawer-in': 'drawer-in 320ms cubic-bezier(0.32, 0.72, 0, 1) both',
        // A screen that appears once: short and decelerating, so it feels ready at once.
        rise: 'rise 240ms cubic-bezier(0.23, 1, 0.32, 1) both',
      },
      minHeight: { touch: size.touch, control: size.control, compact: size.compact, row: size.row },
      minWidth: { touch: size.touch, compact: size.compact },
    },
  },
  plugins: [
    plugin(({ addBase }) => {
      addBase({
        // Light is the default on every device. Dark applies only when a page or the user's own
        // setting puts data-theme="dark" on <html>; the device's dark mode is ignored.
        ':root': cssVars(colors.light, shadow.light),
        ':root[data-theme="dark"]': { ...cssVars(colors.dark, shadow.dark), colorScheme: 'dark' },
      })
    }),
  ],
}
