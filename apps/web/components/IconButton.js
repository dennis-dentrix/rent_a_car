import Link from 'next/link'
import { cx } from '@/lib/cx'

/** A round icon-only control on a soft fill. `label` is required: it is the accessible name. With `href` it is a link. */
export default function IconButton({ label, className, children, href, ...rest }) {
  const Tag = href ? Link : 'button'
  return (
    <Tag
      {...(href ? { href } : { type: 'button' })}
      aria-label={label}
      className={cx(
        'state-layer inline-flex h-compact min-w-compact items-center justify-center rounded-pill bg-fill text-label',
        'transition-transform duration-fast active:scale-[0.95]',
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  )
}
