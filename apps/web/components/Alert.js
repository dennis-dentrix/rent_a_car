import { CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react'
import { TONES } from '@/lib/tones'
import { cx } from '@/lib/cx'

const ICONS = { info: Info, success: CircleCheck, warning: TriangleAlert, error: CircleAlert }

/** An inline message that stays until the problem is fixed. Errors use this, never a toast. */
export default function Alert({ tone = 'info', title, children, action }) {
  const Icon = ICONS[tone]
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cx('flex gap-3 rounded-card p-4', TONES[tone])}
    >
      <Icon size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
      <div className="flex-1">
        <p className="text-headline">{title}</p>
        {children && <p className="mt-1 text-callout text-label">{children}</p>}
        {action && <div className="mt-3">{action}</div>}
      </div>
    </div>
  )
}
