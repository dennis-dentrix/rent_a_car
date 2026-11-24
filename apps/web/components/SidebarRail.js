import Logo from '@/components/Logo'
import NavLink from '@/components/NavLink'
import ThemeToggle from '@/components/ThemeToggle'

/** Operator and admin navigation from tablet up. On phones the TabBar takes over. An item's `group` starts a labelled section. */
export default function SidebarRail({ items, label }) {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-separator bg-bg-grouped md:block">
      <div className="sticky top-0 flex max-h-dvh flex-col gap-1 overflow-y-auto p-5">
        <div className="mb-6 px-4">
          <Logo />
        </div>
        <nav aria-label={label} className="flex flex-col gap-1">
          {items.map((item, index) => (
            <div key={item.href} className="contents">
              {item.group && item.group !== items[index - 1]?.group && (
                <p className="mt-4 px-4 text-caption font-semibold uppercase text-label-3">
                  {item.group}
                </p>
              )}
              <NavLink href={item.href} icon={item.icon} isExact={item.isExact} variant="rail">
                {item.label}
              </NavLink>
            </div>
          ))}
        </nav>
        <div className="mt-6 px-2">
          <ThemeToggle />
        </div>
      </div>
    </aside>
  )
}
