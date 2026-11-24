import NavLink from '@/components/NavLink'

/** The phone navigation: fixed to the bottom, clear of the home indicator, hidden from tablet up. */
export default function TabBar({ items, label }) {
  return (
    <nav
      aria-label={label}
      className="glass pb-safe fixed inset-x-0 bottom-0 z-header border-t border-separator lg:hidden"
    >
      <div className="mx-auto flex h-tabbar max-w-md items-stretch px-2">
        {items.map((item) => (
          <NavLink key={item.href} href={item.href} icon={item.icon} variant="tab">
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
