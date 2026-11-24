'use client'

import Overlay from '@/components/Overlay'

/** Filters, pickers, currency, the quote breakdown. A grabber and a bottom sheet on phones, a centred dialog on larger screens. */
export default function Sheet({ isOpen, onClose, title, children }) {
  return (
    <Overlay isOpen={isOpen} onClose={onClose} label={title}>
      <div className="pb-safe px-4 pb-5 pt-2 md:px-5 md:pt-5">
        <div
          className="mx-auto mb-3 h-1 w-9 rounded-pill bg-separator md:hidden"
          aria-hidden="true"
        />
        <h2 className="mb-4 text-title-2">{title}</h2>
        {children}
      </div>
    </Overlay>
  )
}
