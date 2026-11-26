'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import NavBadge from '@/components/NavBadge'
import { cx } from '@/lib/cx'
import { NAV_ICONS } from '@/lib/nav-icons'

// `isExact` is for a section's home page, which would otherwise count as current on every page inside the section.
const isActivePath = (pathname, href, isExact) =>
  pathname === href || (!isExact && pathname.startsWith(`${href}/`))

// Top bar and side rail: a pill that gains a tint when current.
const PILL = {
  top: 'min-h-compact whitespace-nowrap px-4 text-callout font-medium',
  rail: 'min-h-touch w-full justify-start gap-3 px-4 text-callout font-medium',
}

function TabItem({ Icon, isActive, badge, children }) {
  return (
    <>
      <span
        className={cx(
          'relative flex h-8 w-full max-w-16 items-center justify-center rounded-pill transition-colors duration-fast',
          isActive && 'bg-accent-subtle',
        )}
      >
        <Icon size={24} strokeWidth={isActive ? 2.25 : 1.75} aria-hidden="true" />
        {badge && <NavBadge name={badge} className="absolute right-1 top-0" />}
      </span>
      <span className="max-w-full truncate text-caption">{children}</span>
    </>
  )
}

/** A link that knows when it is the current page: a tint and a bolder label, never colour alone. */
export default function NavLink({ href, icon, variant = 'top', isExact = false, badge, children }) {
  const isActive = isActivePath(usePathname(), href, isExact)
  const Icon = NAV_ICONS[icon]
  const current = isActive ? 'text-accent' : 'text-label-2 hover:text-label'
  if (variant === 'tab') {
    return (
      <Link
        href={href}
        aria-current={isActive ? 'page' : undefined}
        className={cx(
          'flex min-w-0 flex-1 flex-col items-center gap-1 py-2 transition-transform duration-fast active:scale-[0.95]',
          current,
        )}
      >
        <TabItem Icon={Icon} isActive={isActive} badge={badge}>
          {children}
        </TabItem>
      </Link>
    )
  }
  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={cx(
        'state-layer inline-flex items-center rounded-pill',
        PILL[variant],
        current,
        isActive && 'bg-accent-subtle',
      )}
    >
      {Icon && <Icon size={20} aria-hidden="true" />}
      {children}
    </Link>
  )
}
