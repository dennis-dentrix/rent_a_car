'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import IconButton from '@/components/IconButton'
import Sheet from '@/components/Sheet'
import SuggestBox from '@/components/SuggestBox'
import { copy } from '@/copy/en'

/**
 * The header's search: a box under the nav from tablet up, and a search button that opens a sheet on a
 * phone. Both suggest services, car types, and places as you type.
 */
export default function HeaderSearch({ suggestions }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <div className="hidden min-w-0 max-w-md flex-1 lg:block">
        <SuggestBox suggestions={suggestions} isPopover />
      </div>
      <div className="lg:hidden">
        <IconButton label={copy.headerSearch.open} onClick={() => setIsOpen(true)}>
          <Search size={20} aria-hidden="true" />
        </IconButton>
        <Sheet isOpen={isOpen} onClose={() => setIsOpen(false)} title={copy.headerSearch.title}>
          <SuggestBox suggestions={suggestions} isAutoFocus onDone={() => setIsOpen(false)} />
        </Sheet>
      </div>
    </>
  )
}
