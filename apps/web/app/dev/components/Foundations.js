import Logo from '@/components/Logo'
import { colors } from '@/styles/tokens/index.js'

// Written out in full so Tailwind can see each class.
const TYPE_CLASSES = {
  display: 'text-display',
  'display-lg': 'text-display-lg',
  'title-1': 'text-title-1',
  'title-1-lg': 'text-title-1-lg',
  'title-2': 'text-title-2',
  headline: 'text-headline',
  body: 'text-body',
  callout: 'text-callout',
  footnote: 'text-footnote',
  caption: 'text-caption',
  price: 'text-price',
  'staff-label': 'text-staff-label',
  'staff-heading': 'text-staff-heading',
}

export function Swatches() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
      {Object.keys(colors.light).map((name) => (
        <div key={name} className="overflow-hidden rounded-card border border-separator">
          <div className="h-12" style={{ background: `var(--color-${name})` }} />
          <p className="px-2 py-1 text-caption">{name}</p>
        </div>
      ))}
    </div>
  )
}

export function TypeScale() {
  return (
    <div className="flex flex-col gap-3">
      {Object.entries(TYPE_CLASSES).map(([name, className]) => (
        <p key={name} className={className}>
          <span className="text-caption text-label-2">{name} </span>
          Hire a car in Nairobi <span className="num">KES 12,500 · 0123456789</span>
        </p>
      ))}
    </div>
  )
}

export function LogoVariants() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <Logo />
      <Logo variant="mark" size={40} />
      <Logo variant="mark" size={16} hasDot={false} />
      <Logo variant="mark" tone="current" size={40} hasDot={false} />
      <Logo variant="tile" size={56} />
    </div>
  )
}
