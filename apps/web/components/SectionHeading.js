import { cx } from '@/lib/cx'

/**
 * A section's title, an optional line under it, and an optional action beside it. The title steps up on wider screens,
 * so a section always reads as larger than the things inside it.
 */
export default function SectionHeading({ title, action, className, children }) {
  return (
    <div className={cx('mb-8 flex flex-wrap items-end justify-between gap-4', className)}>
      <div className="max-w-2xl">
        <h2 className="text-title-2 md:text-title-1-lg">{title}</h2>
        {children && <p className="mt-2 text-reading text-label-2">{children}</p>}
      </div>
      {action}
    </div>
  )
}
