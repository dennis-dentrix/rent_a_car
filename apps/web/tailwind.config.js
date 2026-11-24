import plugin from 'tailwindcss/plugin'
import {
  colors,
  space,
  radius,
  size,
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
    screens: { md: '768px', lg: '1024px', wide: '1440px' },
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
      backgroundImage: {
        hero: 'linear-gradient(135deg, var(--color-hero) 0%, var(--color-primary) 55%, var(--color-hero-to) 120%)',
        stage: 'linear-gradient(160deg, var(--color-stage-from), var(--color-stage-to))',
      },
      keyframes: {
        draw: { from: { strokeDashoffset: '1' }, to: { strokeDashoffset: '0' } },
        rise: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        beacon: {
          '0%': { transform: 'scale(1)', opacity: '0.7' },
          '100%': { transform: 'scale(3.2)', opacity: '0' },
        },
      },
      animation: {
        draw: 'draw 1600ms cubic-bezier(0.77, 0, 0.175, 1) 200ms both',
        // A screen that appears once: short and decelerating, so it feels ready at once.
        rise: 'rise 240ms cubic-bezier(0.23, 1, 0.32, 1) both',
        beacon: 'beacon 2400ms ease-out infinite',
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
