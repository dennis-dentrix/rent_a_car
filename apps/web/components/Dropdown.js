'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useDismiss } from '@/lib/use-dismiss'

const GAP = 8
const EDGE = 12
const MIN_WIDTH = 288
const MAX_HEIGHT = 384

// Where the anchor is on screen, kept current while the panel is open and the page scrolls or resizes.
function useAnchorBox(anchorRef, isOpen) {
  const [box, setBox] = useState(null)
  useEffect(() => {
    if (!isOpen) return undefined
    const measure = () => {
      const rect = anchorRef.current?.getBoundingClientRect()
      if (rect) setBox({ top: rect.bottom + GAP, left: rect.left, width: rect.width })
    }
    measure()
    window.addEventListener('scroll', measure, true)
    window.addEventListener('resize', measure)
    return () => {
      window.removeEventListener('scroll', measure, true)
      window.removeEventListener('resize', measure)
    }
  }, [anchorRef, isOpen])
  return box
}

const placement = (box) => {
  const width = Math.min(Math.max(box.width, MIN_WIDTH), window.innerWidth - EDGE * 2)
  const left = Math.max(EDGE, Math.min(box.left, window.innerWidth - width - EDGE))
  const maxHeight = Math.max(160, Math.min(MAX_HEIGHT, window.innerHeight - box.top - EDGE))
  return { top: box.top, left, width, maxHeight }
}

/**
 * A plain dropdown: a panel that opens under its control (`anchorRef`) and closes on Escape or a tap outside. It
 * is drawn in a layer above the page, so a rounded or clipped parent cannot cut it off. Date pickers are not
 * dropdowns; they keep their own sheet.
 */
export default function Dropdown({ isOpen, onClose, anchorRef, children }) {
  const panelRef = useRef(null)
  const box = useAnchorBox(anchorRef, isOpen)
  useDismiss([anchorRef, panelRef], isOpen, onClose)
  if (!isOpen || !box) return null
  return createPortal(
    <div
      ref={panelRef}
      style={placement(box)}
      className="animate-pop-in fixed z-sheet origin-top-left overflow-y-auto rounded-panel border border-separator bg-surface p-2 shadow-2"
    >
      {children}
    </div>,
    document.body,
  )
}
