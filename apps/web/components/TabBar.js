import NavLink from '@/components/NavLink'
import { cx } from '@/lib/cx'

/**
 * The phone and tablet navigation: fixed to the bottom, clear of the home indicator. It hides where the top bar's
 * links appear: from desktop on the public site, from tablet in the consoles (`hasTopNavFromTablet`).
 */
export default function TabBar({ items, label, hasTopNavFromTablet = false }) {
  return (
    <nav
      aria-label={label}
      className={cx(
        'glass pb-safe fixed inset-x-0 bottom-0 z-header border-t border-separator',
        hasTopNavFromTablet ? 'md:hidden' : 'lg:hidden',
      )}
    >
      <div className="mx-auto flex h-tabbar max-w-md items-stretch px-2">
        {items.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            icon={item.icon}
            isExact={item.isExact}
            variant="tab"
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
