'use client'

import { X } from 'lucide-react'
import Overlay from '@/components/Overlay'
import { copy } from '@/copy/en'

/** A panel for one record: slides in from the right, a bottom sheet on phones. Closes on Escape or a tap outside. */
export default function Drawer({ isOpen, onClose, title, subtitle, children }) {
  return (
    <Overlay isOpen={isOpen} onClose={onClose} label={title} placement="drawer">
      <div className="sticky top-0 z-header flex items-start justify-between gap-3 border-b border-separator bg-surface px-5 py-4">
        <div className="min-w-0">
          <h2 className="text-section">{title}</h2>
          {subtitle && <p className="text-meta text-label-2">{subtitle}</p>}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={copy.consoleUi.close}
          className="state-layer flex h-compact w-compact shrink-0 items-center justify-center rounded-control"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>
      <div className="pb-safe px-5 pb-6">{children}</div>
    </Overlay>
  )
}
