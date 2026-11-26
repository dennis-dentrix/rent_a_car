import Link from 'next/link'
import AccountMenu from '@/components/AccountMenu'
import BookingsBell from '@/components/BookingsBell'
import MenuChoices, { CurrencyChoice } from '@/components/MenuChoices'
import MobileMenu from '@/components/MobileMenu'
import CurrencySelector from '@/components/CurrencySelector'
import HeaderSearch from '@/components/HeaderSearch'
import Logo from '@/components/Logo'
import NavLink from '@/components/NavLink'
import { copy } from '@/copy/en'
import { topLinks } from '@/lib/nav'

/**
 * Phone and tablet: the mark and name on the left, controls on the right (the tab bar carries the
 * navigation). Desktop: links in the middle. Sign in shows from tablet up. With very large text on a phone the
 * header wraps and scrolls away instead of covering a quarter of the screen.
 */
export default function Header({ suggestions }) {
  return (
    <header className="glass pt-safe sticky top-0 z-header border-b border-separator max-[20em]:static">
      <div className="mx-auto flex min-h-[theme(spacing.header)] max-w-page flex-wrap items-center gap-x-4 gap-y-2 px-gutter py-2 md:min-h-[theme(spacing.header-wide)] md:gap-x-8 md:px-6 lg:px-10">
        <Link
          href="/"
          aria-label={copy.nav.home}
          className="inline-flex min-h-touch shrink-0 items-center"
        >
          <Logo />
        </Link>
        <nav aria-label={copy.nav.main} className="hidden shrink-0 items-center gap-1 lg:flex">
          {topLinks.map((link) => (
            <NavLink key={link.href} href={link.href}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="ml-auto flex flex-wrap items-center justify-end gap-2 md:ml-0">
          <HeaderSearch suggestions={suggestions} />
          <BookingsBell />
          {/* On a phone the currency, the account, and every page are in the menu. */}
          <div className="hidden items-center gap-2 lg:flex">
            <CurrencySelector />
            <AccountMenu />
          </div>
          <div className="lg:hidden">
            <MobileMenu>
              <MenuChoices>
                <CurrencyChoice />
              </MenuChoices>
            </MobileMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
