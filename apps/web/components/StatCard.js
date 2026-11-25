import Link from 'next/link'
import { cx } from '@/lib/cx'

const TONES = {
  plain: {
    card: 'bg-surface border border-separator',
    tile: 'bg-bg-grouped text-primary',
    value: '',
    note: 'text-label-2',
    bar: 'bg-accent',
    track: 'bg-fill',
  },
  warm: {
    card: 'bg-surface border border-separator',
    tile: 'bg-tertiary-bg text-tertiary',
    value: 'text-tertiary',
    note: 'text-label-2',
    bar: 'bg-tertiary',
    track: 'bg-fill',
  },
  strong: {
    card: 'bg-hero text-on-hero',
    tile: 'bg-hero-glass text-on-hero',
    value: '',
    note: 'text-on-hero-2',
    bar: 'bg-on-hero',
    track: 'bg-hero-glass',
  },
}

function Bar({ share, look }) {
  return (
    <span
      className={cx('mt-3 block h-1.5 overflow-hidden rounded-pill', look.track)}
      aria-hidden="true"
    >
      <span
        className={cx('block h-full rounded-pill', look.bar)}
        style={{ width: `${Math.round(share * 100)}%` }}
      />
    </span>
  )
}

/**
 * One figure: a small label, an icon, the number, an optional bar showing it as a share of something (0 to 1), and a
 * line of context. `tone` is plain, warm (needs attention) or strong (the one to look at). With `href` the card opens it.
 */
export default function StatCard({ label, value, note, icon: Icon, share, tone = 'plain', href }) {
  const look = TONES[tone]
  const Tag = href ? Link : 'div'
  return (
    <Tag
      href={href}
      className={cx(
        'flex flex-col rounded-panel p-4 shadow-1',
        look.card,
        href && 'transition-transform duration-fast active:scale-[0.98]',
      )}
    >
      <span className="flex items-start justify-between gap-2">
        <span className={cx('text-micro uppercase', look.note)}>{label}</span>
        {Icon && (
          <span
            className={cx(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-control',
              look.tile,
            )}
          >
            <Icon size={16} aria-hidden="true" />
          </span>
        )}
      </span>
      <span className={cx('num mt-1 text-metric', look.value)}>{value}</span>
      {share !== undefined && <Bar share={share} look={look} />}
      {note && <span className={cx('mt-2 text-meta', look.note)}>{note}</span>}
    </Tag>
  )
}
