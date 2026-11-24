'use client'

import Link from 'next/link'
import { useCallback, useRef, useState } from 'react'
import { signOutAction } from '@/app/auth/actions'
import Avatar from '@/components/Avatar'
import Button from '@/components/Button'
import { copy } from '@/copy/en'
import { areaFor } from '@/lib/areas'
import { useDismiss } from '@/lib/use-dismiss'
import { useWho } from '@/lib/use-who'

const text = copy.auth.menu

const ITEM_CLASS =
  'state-layer flex min-h-touch w-full items-center rounded-control px-3 text-left text-body'

function MenuPanel({ who, onClose }) {
  const area = areaFor(who.role)
  return (
    <div
      role="menu"
      aria-label={text.label}
      className="animate-pop-in absolute right-0 top-full z-sheet mt-2 w-64 origin-top-right rounded-panel border border-separator bg-surface p-1 shadow-2"
    >
      <p className="truncate px-3 py-2 text-callout font-semibold">{who.name}</p>
      <Link href="/account" role="menuitem" className={ITEM_CLASS} onClick={onClose}>
        {text.account}
      </Link>
      <Link href="/settings" role="menuitem" className={ITEM_CLASS} onClick={onClose}>
        {text.settings}
      </Link>
      {area && (
        <Link href={area.href} role="menuitem" className={ITEM_CLASS} onClick={onClose}>
          {area.label}
        </Link>
      )}
      <form action={signOutAction}>
        <button type="submit" role="menuitem" className={ITEM_CLASS}>
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
        className="hidden md:inline-flex"
      >
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
        className="state-layer inline-flex h-compact min-w-compact items-center justify-center rounded-pill transition-transform duration-fast active:scale-[0.95]"
      >
        <Avatar name={who.name} src={who.avatar} size={36} />
      </button>
      {isOpen && <MenuPanel who={who} onClose={close} />}
    </div>
  )
}
