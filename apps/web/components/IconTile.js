import { cx } from '@/lib/cx'

// Soft coloured squares for icons: blue is the default, peach and green add variety, "glass" sits on navy.
const TILES = {
  blue: 'bg-accent-subtle text-primary',
  peach: 'bg-tertiary-bg text-tertiary',
  green: 'bg-success-bg text-success',
  glass: 'bg-hero-glass text-on-hero',
}

export default function IconTile({ icon: Icon, tone = 'blue', className }) {
  return (
    <span
      className={cx(
        'flex size-11 shrink-0 items-center justify-center rounded-card',
        TILES[tone],
        className,
      )}
    >
      <Icon size={22} aria-hidden="true" />
    </span>
  )
}
