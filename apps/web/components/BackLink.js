import Link from 'next/link'
import { cx } from '@/lib/cx'

/** The way back from a page to the one above it, tall enough to tap with a thumb. */
export default function BackLink({ href, children, className }) {
  return (
    <Link
      href={href}
      className={cx(
        'inline-flex min-h-touch w-max items-center text-callout font-semibold text-primary',
        className,
      )}
    >
      {children}
    </Link>
  )
}
