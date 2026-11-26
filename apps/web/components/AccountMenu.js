'use client'

import Link from 'next/link'
import { useCallback, useRef, useState } from 'react'
import { CalendarDays, LayoutDashboard, LogIn, LogOut, MessageSquare, Settings } from 'lucide-react'
import { signOutAction } from '@/app/auth/actions'
import Avatar from '@/components/Avatar'
import Button from '@/components/Button'
import NavBadge from '@/components/NavBadge'
import { copy } from '@/copy/en'
import { areaFor } from '@/lib/areas'
import { useDismiss } from '@/lib/use-dismiss'
import { useWho } from '@/lib/use-who'

const text = copy.auth.menu

const ITEM_CLASS =
  'state-layer flex min-h-touch w-full items-center gap-3 rounded-control px-3 text-left text-body'

function MenuLink({ href, icon: Icon, onClose, children }) {
  return (
    <Link href={href} role="menuitem" className={ITEM_CLASS} onClick={onClose}>
      <Icon size={18} className="text-label-2" aria-hidden="true" />
      {children}
    </Link>
  )
}

// A company or the admin goes to their dashboard; a renter to their trips and messages.
function OwnLinks({ role, onClose }) {
  const area = areaFor(role)
  if (area) {
    return (
      <MenuLink href={area.href} icon={LayoutDashboard} onClose={onClose}>
        {area.label}
      </MenuLink>
    )
  }
  return (
    <>
      <MenuLink href="/account/bookings" icon={CalendarDays} onClose={onClose}>
        {text.bookings}
      </MenuLink>
      <MenuLink href="/account/messages" icon={MessageSquare} onClose={onClose}>
        {copy.messages.title}
        <NavBadge name="unread_messages" className="ml-auto" />
      </MenuLink>
    </>
  )
}

function MenuPanel({ who, onClose }) {
  return (
    <div
      role="menu"
      aria-label={text.label}
      className="animate-pop-in absolute right-0 top-full z-sheet mt-2 w-64 origin-top-right rounded-panel border border-separator bg-surface p-1 shadow-2"
    >
      <p className="truncate px-3 py-2 text-callout font-semibold">{who.name}</p>
      <OwnLinks role={who.role} onClose={onClose} />
      <MenuLink href="/settings" icon={Settings} onClose={onClose}>
        {text.settings}
      </MenuLink>
      <form action={signOutAction}>
        <button type="submit" role="menuitem" className={ITEM_CLASS}>
          <LogOut size={18} className="text-label-2" aria-hidden="true" />
          {text.signOut}
        </button>
      </form>
    </div>
  )
}

/**
 * "Sign in" for a visitor; for someone signed in, their picture (or initials) opening a small menu with their account,
 * their own area if they have one, and Sign out. It reads a flag cookie, so the public pages stay the same for
 * everyone and can be built ahead of time. The first paint is always "Sign in", to match the server.
 */
export default function AccountMenu() {
  const { who, hasHint } = useWho()
  const [isOpen, setIsOpen] = useState(false)
  const root = useRef(null)
  const close = useCallback(() => setIsOpen(false), [])
  useDismiss(root, isOpen, close)

  if (!who) {
    return (
      <Button
        href={hasHint ? '/account' : '/auth'}
        variant="tonal"
        size="compact"
        className="whitespace-nowrap"
      >
        {!hasHint && <LogIn size={16} aria-hidden="true" />}
        {hasHint ? copy.nav.account : copy.nav.signIn}
      </Button>
    )
  }
  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-label={text.label}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className="state-layer relative inline-flex h-compact min-w-compact items-center justify-center rounded-pill transition-transform duration-fast active:scale-[0.95]"
      >
        <Avatar name={who.name} src={who.avatar} size={36} />
        <NavBadge name="unread_messages" className="absolute -right-1 -top-1" />
      </button>
      {isOpen && <MenuPanel who={who} onClose={close} />}
    </div>
  )
}
