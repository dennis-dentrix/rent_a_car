'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import Button from '@/components/Button'
import CompanyClassCard from '@/components/CompanyClassCard'
import Drawer from '@/components/Drawer'
import ResourceForm from '@/components/ResourceForm'
import { copy } from '@/copy/en'

const text = copy.classPrices

/** The company's classes with their prices, and a drawer that adds a class or changes one of its own. */
export default function ClassPrices({ rows, formProps }) {
  const [editing, setEditing] = useState(null)
  const isNew = editing === 'new'
  return (
    <div className="flex flex-col gap-4">
      <Button size="compact" className="self-start" onClick={() => setEditing('new')}>
        <Plus size={16} aria-hidden="true" />
        {text.add}
      </Button>
      <ul className="stagger grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rows.map((item) => (
          <CompanyClassCard key={item.id} item={item} onEdit={setEditing} />
        ))}
      </ul>
      <Drawer
        isOpen={editing !== null}
        onClose={() => setEditing(null)}
        title={isNew ? text.add : (editing?.name ?? '')}
      >
        {editing !== null && <ResourceForm row={isNew ? null : editing} {...formProps} />}
      </Drawer>
    </div>
  )
}
