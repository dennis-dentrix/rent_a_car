import { TONES } from '@/lib/tones'
import { cx } from '@/lib/cx'

/** A pill with an optional icon. Amber ("verified") marks proof only: vetted operators, checked documents. */
export default function Badge({ tone = 'neutral', icon: Icon, children }) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 rounded-pill px-3 py-1 text-caption',
        TONES[tone],
      )}
    >
      {Icon && <Icon size={14} aria-hidden="true" />}
      {children}
    </span>
  )
}
