'use client'

import { useState } from 'react'
import ActionSheet from '@/components/ActionSheet'
import Button from '@/components/Button'
import Chip from '@/components/Chip'
import DateRangePicker from '@/components/DateRangePicker'
import Dialog from '@/components/Dialog'
import Select from '@/components/Select'
import SegmentedControl from '@/components/SegmentedControl'
import Sheet from '@/components/Sheet'
import TextField from '@/components/Field'
import { useToast } from '@/components/Toast'

export function Buttons() {
  const [isSaving, setIsSaving] = useState(false)
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button onClick={() => setIsSaving(!isSaving)} isLoading={isSaving}>
        Primary
      </Button>
      <Button variant="tonal">Tonal</Button>
      <Button variant="plain">Plain</Button>
      <Button variant="destructive">Destructive</Button>
      <Button disabled>Disabled</Button>
      <Button size="sm">Small</Button>
    </div>
  )
}

export function Fields() {
  const [filters, setFilters] = useState(['suv'])
  const [mode, setMode] = useState('self')
  const toggle = (id) =>
    setFilters((now) => (now.includes(id) ? now.filter((item) => item !== id) : [...now, id]))
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <TextField label="Full name" helper="As on your licence" />
      <TextField label="Email" type="email" error="Enter a valid email" defaultValue="name@" />
      <Select
        label="Pickup"
        options={[
          { value: 'a', label: 'Airport' },
          { value: 'b', label: 'City' },
        ]}
      />
      <SegmentedControl
        label="Driver"
        value={mode}
        onChange={setMode}
        options={[
          { value: 'self', label: 'Self-drive' },
          { value: 'driver', label: 'With driver' },
        ]}
      />
      <div className="flex flex-wrap gap-2">
        {['suv', 'van', 'auto'].map((id) => (
          <Chip key={id} label={id} isSelected={filters.includes(id)} onToggle={() => toggle(id)} />
        ))}
      </div>
    </div>
  )
}

export function Dates() {
  const [range, setRange] = useState({ start: null, end: null })
  return (
    <div className="max-w-sm">
      <DateRangePicker
        {...range}
        minDate="2026-11-24"
        blockedRanges={[['2026-12-05', '2026-12-07']]}
        onChange={setRange}
      />
    </div>
  )
}

function Dialogs({ open, close }) {
  return (
    <>
      <Sheet isOpen={open === 'sheet'} onClose={close} title="Filters">
        <p className="text-callout text-label-2">Filters go here.</p>
      </Sheet>
      <Dialog
        isOpen={open === 'dialog'}
        onClose={close}
        title="Leave this page?"
        description="Your changes are not saved."
        actions={[
          <Button key="stay" onClick={close}>
            Stay
          </Button>,
          <Button key="leave" variant="plain" onClick={close}>
            Leave
          </Button>,
        ]}
      />
      <ActionSheet
        isOpen={open === 'actions'}
        onClose={close}
        title="Cancel booking"
        cancelLabel="Keep booking"
        actions={[{ label: 'Cancel booking', isDestructive: true, onSelect: close }]}
      />
    </>
  )
}

export function Overlays() {
  const [open, setOpen] = useState(null)
  const showToast = useToast()
  return (
    <div className="flex flex-wrap gap-3">
      {['sheet', 'dialog', 'actions'].map((name) => (
        <Button key={name} variant="tonal" onClick={() => setOpen(name)}>
          {name}
        </Button>
      ))}
      <Button variant="tonal" onClick={() => showToast('Saved')}>
        toast
      </Button>
      <Dialogs open={open} close={() => setOpen(null)} />
    </div>
  )
}
