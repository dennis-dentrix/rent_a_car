import Link from 'next/link'

/** A few large ways onward from a dashboard, each an icon and a word. */
export default function QuickActions({ actions }) {
  return (
    <ul className="grid grid-cols-3 gap-3">
      {actions.map(({ href, label, icon: Icon }) => (
        <li key={href}>
          <Link
            href={href}
            className="flex h-full flex-col items-center gap-2 rounded-panel border border-separator bg-surface p-3 text-center text-callout font-semibold transition-[border-color,transform] duration-fast hover:border-primary active:scale-[0.97]"
          >
            <span className="flex size-11 items-center justify-center rounded-pill bg-accent-subtle text-primary">
              <Icon size={20} aria-hidden="true" />
            </span>
            {label}
          </Link>
        </li>
      ))}
    </ul>
  )
}
