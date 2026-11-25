import InsetList from '@/components/InsetList'
import { navGroups } from '@/lib/console-nav'
import { NAV_ICONS } from '@/lib/nav-icons'

const row = ({ href, label, icon }) => {
  const Icon = NAV_ICONS[icon]
  return {
    id: href,
    href,
    title: label,
    leading: (
      <span className="flex size-9 shrink-0 items-center justify-center rounded-control bg-accent-subtle text-primary">
        <Icon size={18} aria-hidden="true" />
      </span>
    ),
  }
}

/** The phone's full menu: the same groups and order as the sidebar, each page with its icon. */
export default function MenuGroups({ items }) {
  return (
    <div className="stagger flex flex-col gap-5">
      {navGroups(items).map((group) => (
        <section key={group.name} className="flex flex-col gap-2">
          <h2 className="px-1 text-micro uppercase text-label-3">{group.name}</h2>
          <InsetList items={group.items.map(row)} />
        </section>
      ))}
    </div>
  )
}
