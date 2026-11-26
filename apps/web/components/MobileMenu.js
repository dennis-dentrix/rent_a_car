'use client'

import { useState } from 'react'
import { Menu as MenuIcon } from 'lucide-react'
import { useAlerts } from '@/components/AlertsProvider'
import IconButton from '@/components/IconButton'
import MenuHeader from '@/components/MenuHeader'
import MenuTiles from '@/components/MenuTiles'
import Overlay from '@/components/Overlay'
import SideNav from '@/components/SideNav'
import { copy } from '@/copy/en'
import { totalAlerts } from '@/lib/alerts'
import { consoleMenu, siteMenu } from '@/lib/mobile-menu'
import { useWho } from '@/lib/use-who'

function Trigger({ onOpen }) {
  const hasNews = totalAlerts(useAlerts()) > 0
  return (
    <span className="relative inline-flex">
      <IconButton label={copy.menu.open} aria-haspopup="dialog" onClick={onOpen}>
        <MenuIcon size={22} aria-hidden="true" />
      </IconButton>
      {hasNews && (
        <span className="pointer-events-none absolute right-0 top-0 size-3 rounded-pill bg-error" />
      )}
    </span>
  )
}

/**
 * The phone's full menu, sliding in from the right: who you are, what waits for you, every page, and your choices.
 * A console passes its own `items`; the public site works them out from who is looking. `children` are the settings
 * kept at the foot.
 */
export default function MobileMenu({ items, children }) {
  const { who } = useWho()
  const [isOpen, setIsOpen] = useState(false)
  const menu = items ? consoleMenu(items) : siteMenu(who?.home)
  const close = () => setIsOpen(false)
  // Choosing a page closes the menu, including the page already in view.
  const closeOnLink = (event) => event.target.closest('a') && close()
  return (
    <>
      <Trigger onOpen={() => setIsOpen(true)} />
      <Overlay isOpen={isOpen} onClose={close} label={copy.menu.open} placement="menu">
        <div onClick={closeOnLink} className="flex min-h-full flex-col">
          <MenuHeader who={who} onClose={close} />
          <div className="flex flex-1 flex-col gap-6 px-4 py-5">
            <MenuTiles tiles={menu.tiles} />
            <SideNav items={menu.items} label={copy.menu.open} />
          </div>
          <div className="pb-safe flex flex-col gap-4 border-t border-separator px-4 py-4">
            {children}
          </div>
        </div>
      </Overlay>
    </>
  )
}
