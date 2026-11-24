'use client'

import Overlay from '@/components/Overlay'
import Button from '@/components/Button'

/** Choices after a tap, with the destructive one marked, such as cancelling a booking. */
export default function ActionSheet({ isOpen, onClose, title, actions, cancelLabel }) {
  return (
    <Overlay isOpen={isOpen} onClose={onClose} label={title}>
      <div className="pb-safe flex flex-col gap-2 px-4 pb-4 pt-4">
        <p className="text-center text-footnote text-label-2">{title}</p>
        {actions.map((action) => (
          <Button
            key={action.label}
            variant={action.isDestructive ? 'destructive' : 'tonal'}
            isFullWidth
            onClick={action.onSelect}
          >
            {action.label}
          </Button>
        ))}
        <Button variant="plain" isFullWidth onClick={onClose}>
          {cancelLabel}
        </Button>
      </div>
    </Overlay>
  )
}
