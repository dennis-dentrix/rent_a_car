import Link from 'next/link'
import { Loader } from 'lucide-react'
import { cx } from '@/lib/cx'

const VARIANTS = {
  primary: 'bg-primary text-on-primary',
  tonal: 'bg-accent-subtle text-primary',
  plain: 'bg-transparent text-primary',
  destructive: 'bg-error-bg text-error',
  // For navy panels: a white button and a frosted one.
  light: 'bg-on-hero text-hero',
  glass: 'bg-hero-glass text-on-hero',
}

const SIZES = {
  md: 'min-h-control px-6 text-body',
  compact: 'min-h-compact px-5 text-callout',
  sm: 'min-h-row px-3 text-staff-label',
}

const buttonClasses = ({ variant, size, isFullWidth, className }) =>
  cx(
    'state-layer inline-flex max-w-full select-none items-center justify-center gap-2 rounded-control text-center font-semibold',
    'transition-transform duration-fast active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40',
    VARIANTS[variant],
    SIZES[size],
    isFullWidth && 'w-full',
    className,
  )

/**
 * variant: primary (one per screen), tonal, plain, destructive. With `href` it renders a link.
 * While `isLoading` the label stays and the button ignores clicks, so the screen says "saving", not "done".
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  href,
  isLoading = false,
  isFullWidth = false,
  children,
  className,
  ...rest
}) {
  const classes = buttonClasses({ variant, size, isFullWidth, className })
  const content = (
    <>
      {isLoading && (
        <Loader size={18} className="animate-[spin_700ms_linear_infinite]" aria-hidden="true" />
      )}
      {children}
    </>
  )
  if (href) {
    return (
      <Link href={href} className={classes} {...rest}>
        {content}
      </Link>
    )
  }
  return (
    <button
      type="button"
      className={classes}
      aria-busy={isLoading || undefined}
      disabled={rest.disabled || isLoading}
      {...rest}
    >
      {content}
    </button>
  )
}
