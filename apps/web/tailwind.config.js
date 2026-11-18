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

const fontSize = Object.fromEntries(
  Object.entries(type).map(([name, [fontSizeValue, lineHeight, fontWeight]]) => [
    name,
    [fontSizeValue, { lineHeight, fontWeight }],
  ]),
)

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    screens: { md: '768px', lg: '1024px', wide: '1440px' },
    colors: { transparent: 'transparent', current: 'currentColor', ...colorUtilities },
    spacing: { 0: '0px', ...space, touch: size.touch, row: size.row },
    borderRadius: { none: '0', ...radius },
    zIndex: z,
    fontFamily: { sans: fontFamily },
    fontSize,
    boxShadow: { 1: 'var(--shadow-1)', 2: 'var(--shadow-2)', none: 'none' },
    transitionDuration: motion.duration,
    transitionTimingFunction: motion.easing,
    extend: {
      minHeight: { touch: size.touch, row: size.row },
      minWidth: { touch: size.touch },
    },
  },
  plugins: [
    plugin(({ addBase }) => {
      addBase({
        ':root': cssVars(colors.light, shadow.light),
        '@media (prefers-color-scheme: dark)': { ':root': cssVars(colors.dark, shadow.dark) },
      })
    }),
  ],
}
