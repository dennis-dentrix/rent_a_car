import Link from 'next/link'
import AccountMenu from '@/components/AccountMenu'
import CurrencySelector from '@/components/CurrencySelector'
import HeaderSearch from '@/components/HeaderSearch'
import Logo from '@/components/Logo'
import NavLink from '@/components/NavLink'
import ThemeToggle from '@/components/ThemeToggle'
import { copy } from '@/copy/en'
import { topLinks } from '@/lib/nav'

/**
 * Phone: the mark and name on the left, the settings link on the right (the tab bar carries the
 * navigation). Tablet and up: links in the middle, sign in on the right.
 */
export default function Header({ suggestions }) {
  return (
    <header className="glass pt-safe sticky top-0 z-header border-b border-separator">
      <div className="mx-auto flex h-header max-w-[1280px] items-center gap-4 px-4 md:h-header-wide md:gap-8 md:px-6 lg:px-10">
        <Link href="/" aria-label={copy.nav.home} className="shrink-0">
          <Logo />
        </Link>
        <nav aria-label={copy.nav.main} className="hidden shrink-0 items-center gap-1 lg:flex">
          {topLinks.map((link) => (
            <NavLink key={link.href} href={link.href}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <HeaderSearch suggestions={suggestions} />
          <CurrencySelector />
          <ThemeToggle />
          <AccountMenu />
        </div>
      </div>
    </header>
  )
}
