'use client'

import { useAlerts } from '@/components/AlertsProvider'
import { copy } from '@/copy/en'
import { cx } from '@/lib/cx'

/** How many things wait behind a menu item, `name` being the count to show. Nothing at zero. */
export default function NavBadge({ name, className }) {
  const count = useAlerts()[name]
  if (!count) return null
  return (
    <span
      className={cx(
        'num inline-flex h-5 min-w-5 items-center justify-center rounded-pill bg-error px-1.5 text-caption text-on-primary',
        className,
      )}
    >
      {count > 9 ? '9+' : count}
      <span className="sr-only"> {copy.alerts.waiting}</span>
    </span>
  )
}
