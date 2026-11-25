import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import Logo from '@/components/Logo'
import SideNav from '@/components/SideNav'
import SignOutForm from '@/components/SignOutForm'
import TabBar from '@/components/TabBar'
import ThemeToggle from '@/components/ThemeToggle'
import { brand } from '@carvo/shared/brand'
import { copy } from '@/copy/en'

function Brand({ href, area }) {
  return (
    <Link href={href} className="flex min-w-0 items-center gap-3">
      <Logo variant="tile" size={36} />
      <span className="flex min-w-0 flex-col">
        <span className="text-section">{brand.name}</span>
        <span className="truncate text-meta text-label-2">{area}</span>
      </span>
    </Link>
  )
}

function SiteLink() {
  return (
    <Link
      href="/"
      className="state-layer inline-flex min-h-compact items-center gap-2 rounded-control px-3 text-cell text-label-2"
    >
      <ExternalLink size={18} aria-hidden="true" />
      {copy.consoleUi.viewSite}
    </Link>
  )
}

function Sidebar({ items, area, identity }) {
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-separator bg-surface md:flex">
      <div className="flex flex-col gap-3 border-b border-separator p-4">
        <Brand href={items[0].href} area={area} />
        {identity}
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <SideNav items={items} label={copy.nav.main} />
      </div>
      <div className="flex flex-col items-start gap-2 border-t border-separator p-3">
        <SiteLink />
        <div className="flex w-full items-center justify-between gap-2">
          <SignOutForm size="compact" />
          <ThemeToggle />
        </div>
      </div>
    </aside>
  )
}

// A phone's bar says where you are and who you are; the pages are in the tab bar below.
function PhoneBar({ href, area, identity }) {
  return (
    <header className="glass pt-safe sticky top-0 z-header border-b border-separator md:hidden">
      <div className="flex min-h-header items-center justify-between gap-3 px-4">
        <Brand href={href} area={area} />
        <ThemeToggle />
      </div>
      {identity && <div className="px-4 pb-2">{identity}</div>}
    </header>
  )
}

/**
 * Operator console and admin: a sidebar of grouped pages from tablet up, and on phones a slim top bar with a
 * four-item tab bar. `tabs` is the phone list when it differs from the full one. `area` names the console and
 * `identity` says who is signed in to it.
 */
export default function ConsoleShell({ items, tabs = items, area, identity, children }) {
  return (
    <div className="min-h-dvh pb-[calc(theme(spacing.tabbar)+env(safe-area-inset-bottom))] text-cell md:flex md:pb-0">
      <Sidebar items={items} area={area} identity={identity} />
      <div className="min-w-0 flex-1">
        <PhoneBar href={items[0].href} area={area} identity={identity} />
        <main className="mx-auto w-full max-w-page px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
      <TabBar items={tabs} label={copy.nav.main} hasTopNavFromTablet />
    </div>
  )
}
