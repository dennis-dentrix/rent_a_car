import { Loader } from 'lucide-react'
import { cx } from '@/lib/cx'

/** The one sign that something is on its way. */
export default function Spinner({ size = 18, className }) {
  return (
    <Loader
      size={size}
      className={cx('animate-[spin_700ms_linear_infinite]', className)}
      aria-hidden="true"
    />
  )
}
