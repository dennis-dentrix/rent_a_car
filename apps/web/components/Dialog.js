'use client'

import Overlay from '@/components/Overlay'

/** Confirms an irreversible action. `actions` are Buttons; the primary one is last. */
export default function Dialog({ isOpen, onClose, title, description, actions }) {
  return (
    <Overlay isOpen={isOpen} onClose={onClose} label={title} placement="center">
      <div className="p-5">
        <h2 className="text-title-2">{title}</h2>
        {description && <p className="mt-2 text-callout text-label-2">{description}</p>}
        <div className="mt-5 flex flex-col gap-2">{actions}</div>
      </div>
    </Overlay>
  )
}
