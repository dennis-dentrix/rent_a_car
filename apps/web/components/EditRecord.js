'use client'

import { Pencil } from 'lucide-react'
import { useState } from 'react'
import Button from '@/components/Button'
import Drawer from '@/components/Drawer'
import ResourceForm from '@/components/ResourceForm'

/** A button that opens one record's form in a drawer, for a page about that record. */
export default function EditRecord({ label, title, row, formProps }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <Button size="compact" onClick={() => setIsOpen(true)}>
        <Pencil size={16} aria-hidden="true" />
        {label}
      </Button>
      <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)} title={title}>
        <ResourceForm row={row} {...formProps} />
      </Drawer>
    </>
  )
}
