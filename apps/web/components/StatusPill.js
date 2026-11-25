import { TONES } from '@/lib/tones'
import { cx } from '@/lib/cx'

/** A state as a dot and a word on a tint, so it is read without relying on colour. */
export default function StatusPill({ tone = 'neutral', children }) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-pill px-2.5 py-1 text-meta font-semibold',
        TONES[tone],
      )}
    >
      <span className="h-1.5 w-1.5 rounded-pill bg-current" aria-hidden="true" />
      {children}
    </span>
  )
}
