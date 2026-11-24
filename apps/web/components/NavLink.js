'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Building2,
  CalendarDays,
  Car,
  CarFront,
  CircleHelp,
  ClipboardList,
  FileCheck,
  Inbox,
  LayoutDashboard,
  LayoutGrid,
  Newspaper,
  ScrollText,
  User,
  Users,
} from 'lucide-react'
import { cx } from '@/lib/cx'

// Icons are chosen by name: a server component cannot hand a component function to a client one.
const ICONS = {
  car: Car,
  bookings: CalendarDays,
  user: User,
  today: LayoutDashboard,
  requests: ClipboardList,
  fleet: CarFront,
  help: CircleHelp,
  inbox: Inbox,
  documents: FileCheck,
  companies: Building2,
  guides: Newspaper,
  team: Users,
  audit: ScrollText,
  more: LayoutGrid,
}

// `isExact` is for a section's home page, which would otherwise count as current on every page inside the section.
const isActivePath = (pathname, href, isExact) =>
  pathname === href || (!isExact && pathname.startsWith(`${href}/`))

// Top bar and side rail: a pill that gains a tint when current.
const PILL = {
  top: 'min-h-compact whitespace-nowrap px-4 text-callout font-medium',
  rail: 'min-h-touch w-full justify-start gap-3 px-4 text-callout font-medium',
}

function TabItem({ Icon, isActive, children }) {
  return (
    <>
      <span
        className={cx(
          'flex h-8 w-16 items-center justify-center rounded-pill transition-colors duration-fast',
          isActive && 'bg-accent-subtle',
        )}
      >
        <Icon size={24} strokeWidth={isActive ? 2.25 : 1.75} aria-hidden="true" />
      </span>
      <span className="text-caption">{children}</span>
    </>
  )
}

/** A link that knows when it is the current page: a tint and a bolder label, never colour alone. */
export default function NavLink({ href, icon, variant = 'top', isExact = false, children }) {
  const isActive = isActivePath(usePathname(), href, isExact)
  const Icon = ICONS[icon]
  const current = isActive ? 'text-accent' : 'text-label-2 hover:text-label'
  if (variant === 'tab') {
    return (
      <Link
        href={href}
        aria-current={isActive ? 'page' : undefined}
        className={cx(
          'flex flex-1 flex-col items-center gap-1 py-2 transition-transform duration-fast active:scale-[0.95]',
          current,
        )}
      >
        <TabItem Icon={Icon} isActive={isActive}>
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
