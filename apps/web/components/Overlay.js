'use client'

import { useEffect, useRef } from 'react'
import { cx } from '@/lib/cx'

const PLACEMENTS = {
  // A bottom sheet on phones. From tablet up it is a dialog in the middle of the screen: a dialog is only as
  // tall as its content, so pinning it to an edge left it in a corner, far from the field that opened it.
  sheet: cx(
    'fixed inset-x-0 bottom-0 top-auto m-0 max-h-[90dvh] w-full max-w-none rounded-t-sheet animate-sheet-in',
    'md:inset-0 md:m-auto md:h-fit md:max-h-[85dvh] md:max-w-lg md:rounded-panel md:animate-pop-in',
  ),
  // A panel from the right for editing one record beside the list; a bottom sheet on phones.
  drawer: cx(
    'fixed inset-x-0 bottom-0 top-auto m-0 max-h-[92dvh] w-full max-w-none rounded-t-sheet animate-sheet-in',
    'md:inset-y-0 md:left-auto md:right-0 md:h-dvh md:max-h-none md:max-w-md md:rounded-none md:animate-drawer-in',
  ),
  center: 'm-auto w-[calc(100%-2rem)] max-w-sm rounded-panel animate-pop-in',
}

/**
 * The native <dialog>: the browser traps focus, closes on Escape, and returns focus to the control that
 * opened it. Sheet, Dialog and ActionSheet are built on this.
 */
export default function Overlay({ isOpen, onClose, label, placement = 'sheet', children }) {
  const ref = useRef(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (isOpen && !dialog.open) dialog.showModal()
    if (!isOpen && dialog.open) dialog.close()
  }, [isOpen])

  return (
    <dialog
      ref={ref}
      aria-label={label}
      onClose={onClose}
      onClick={(event) => event.target === ref.current && onClose()}
      className={cx(
        'bg-surface p-0 text-label shadow-2 backdrop:bg-scrim overflow-y-auto',
        PLACEMENTS[placement],
      )}
    >
      {isOpen && children}
    </dialog>
  )
}
