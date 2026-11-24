import Logo from '@/components/Logo'
import NavLink from '@/components/NavLink'
import ThemeToggle from '@/components/ThemeToggle'

/** Operator and admin navigation from tablet up. On phones the TabBar takes over. */
export default function SidebarRail({ items, label }) {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-separator bg-bg-grouped md:block">
      <div className="sticky top-0 flex flex-col gap-1 p-5">
        <div className="mb-6 px-4">
          <Logo />
        </div>
        <nav aria-label={label} className="flex flex-col gap-2">
          {items.map((item) => (
            <NavLink key={item.href} href={item.href} icon={item.icon} variant="rail">
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-6 px-2">
          <ThemeToggle />
        </div>
      </div>
    </aside>
  )
}
