import Link from 'next/link'
import NavBadge from '@/components/NavBadge'
import { NAV_ICONS } from '@/lib/nav-icons'

function Tile({ tile }) {
  const Icon = NAV_ICONS[tile.icon]
  return (
    <li>
      <Link
        href={tile.href}
        className="state-layer relative flex h-full flex-col gap-3 rounded-panel bg-accent-subtle p-4 text-primary transition-transform duration-fast active:scale-[0.97]"
      >
        <Icon size={26} aria-hidden="true" />
        <span className="text-headline">{tile.label}</span>
        {tile.badge && <NavBadge name={tile.badge} className="absolute right-3 top-3" />}
      </Link>
    </li>
  )
}

/** What waits for the person, as large targets under the thumb. */
export default function MenuTiles({ tiles }) {
  if (!tiles.length) return null
  return (
    <ul className="grid grid-cols-2 gap-3">
      {tiles.map((tile) => (
        <Tile key={tile.href} tile={tile} />
      ))}
    </ul>
  )
}
