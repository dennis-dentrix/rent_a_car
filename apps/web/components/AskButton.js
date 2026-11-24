'use client'

import { useState } from 'react'
import AskForm from '@/components/AskForm'
import Button from '@/components/Button'
import Sheet from '@/components/Sheet'
import { copy } from '@/copy/en'

/**
 * Opens the "ask a question" sheet. With `variant` it is a Button; without, a plain button that takes the
 * caller's `className`, so it can sit in a footer list or a call-to-action row. Questions stay in the app: the
 * form sends an enquiry to the API, and no outside chat service is linked.
 */
export default function AskButton({
  variant,
  className,
  classId,
  defaultMessage,
  isFullWidth = true,
  children,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const open = () => setIsOpen(true)
  return (
    <>
      {variant ? (
        <Button variant={variant} isFullWidth={isFullWidth} className={className} onClick={open}>
          {children}
        </Button>
      ) : (
        <button type="button" className={className} onClick={open}>
          {children}
        </button>
      )}
      <Sheet isOpen={isOpen} onClose={() => setIsOpen(false)} title={copy.ask.title}>
        <AskForm
          classId={classId}
          defaultMessage={defaultMessage}
          onDone={() => setIsOpen(false)}
        />
      </Sheet>
    </>
  )
}
