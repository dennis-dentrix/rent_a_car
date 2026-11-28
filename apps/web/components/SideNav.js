'use client'

import LinkPending from '@/components/LinkPending'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import NavBadge from '@/components/NavBadge'
import { activeItem, navGroups } from '@/lib/console-nav'
import { cx } from '@/lib/cx'
import { NAV_ICONS } from '@/lib/nav-icons'

// No movement between pages: this is pressed all day. Colour and a short press are the only answers.
const ITEM =
  'flex min-h-touch items-center gap-3 rounded-control px-3 text-body transition-[color,background-color,transform] duration-fast active:scale-[0.98] md:min-h-compact md:text-cell'

function Item({ item, isCurrent }) {
  const Icon = NAV_ICONS[item.icon]
  return (
    <li>
      <Link
        href={item.href}
        aria-current={isCurrent ? 'page' : undefined}
        className={cx(
          ITEM,
          isCurrent
            ? 'bg-accent-subtle font-bold text-primary'
            : 'text-label-2 hover:bg-fill hover:text-label',
        )}
      >
        <LinkPending size={18}>
          <Icon size={18} strokeWidth={isCurrent ? 2.25 : 1.75} aria-hidden="true" />
        </LinkPending>
        <span className="truncate">{item.label}</span>
        {item.badge && <NavBadge name={item.badge} className="ml-auto" />}
      </Link>
    </li>
  )
}

/** Every page of a console, under its group's name, with the page in view marked. */
export default function SideNav({ items, label }) {
  const current = activeItem(items, usePathname())
  return (
    <nav aria-label={label} className="flex flex-col gap-4">
      {navGroups(items).map((group) => (
        <div key={group.name}>
          <p className="mb-1 px-3 text-micro uppercase text-label-3">{group.name}</p>
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => (
              <Item key={item.href} item={item} isCurrent={item === current} />
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}
