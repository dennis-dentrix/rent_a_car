import { cx } from '@/lib/cx'

/** A placeholder with fixed dimensions, so nothing jumps when the real content arrives. */
export default function Skeleton({ className }) {
  return (
    <div aria-hidden="true" className={cx('animate-pulse rounded-control bg-fill', className)} />
  )
}
