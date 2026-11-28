'use client'

import { attempt } from '@/lib/attempt'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { FUEL_LEVELS, MIN_INSPECTION_PHOTOS } from '@carvo/shared'
import Alert from '@/components/Alert'
import Button from '@/components/Button'
import ChecklistField from '@/components/ChecklistField'
import TextField from '@/components/Field'
import Panel from '@/components/Panel'
import PhotoPicker from '@/components/PhotoPicker'
import Select from '@/components/Select'
import TextArea from '@/components/TextArea'
import { copy } from '@/copy/en'
import { submitInspection } from '@/lib/inspection-upload'

const text = copy.inspections.form

const fuelOptions = [
  { value: '', label: text.chooseFuel },
  ...FUEL_LEVELS.map((value) => ({ value, label: copy.inspections.fuel[value] })),
]

// Sends the form. A refusal leaves every answer and photo where it was.
function useSubmit({ bookingId, type, photos }) {
  const router = useRouter()
  const [problem, setProblem] = useState(null)
  const [isSaving, startSaving] = useTransition()
  const submit = (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    if (photos.length < MIN_INSPECTION_PHOTOS) {
      return setProblem(text.problems.photos(MIN_INSPECTION_PHOTOS))
    }
    startSaving(async () => {
      const send = () => submitInspection(formData, { bookingId, type, photos })
      const result = await attempt(send, { error: 'upload' })
      if (result.id) return router.push(`/console/inspections/${result.id}`)
      setProblem(result.message ?? text.problems[result.error])
    })
  }
  return { submit, problem, isSaving }
}

function Fields() {
  return (
    <>
      <Panel title={text.readings}>
        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            label={text.mileage}
            name="mileage_km"
            type="number"
            min="0"
            inputMode="numeric"
            required
          />
          <Select label={text.fuel} name="fuel_level" options={fuelOptions} required />
        </div>
      </Panel>
      <Panel title={text.checks}>
        <ChecklistField />
        <label className="mt-4 flex min-h-touch items-center gap-3">
          <input type="checkbox" name="damage_noted" className="h-5 w-5 accent-primary" />
          {text.damage}
        </label>
        <TextArea label={text.notes} name="condition_notes" maxLength={2000} rows={3} />
      </Panel>
    </>
  )
}

/** The handover inspection a company fills in beside the car. */
export default function InspectionForm({ bookingId, type }) {
  const [photos, setPhotos] = useState([])
  const { submit, problem, isSaving } = useSubmit({ bookingId, type, photos })
  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <Fields />
      <Panel title={text.photos} hint={text.photosHint(MIN_INSPECTION_PHOTOS)}>
        <PhotoPicker photos={photos} onChange={setPhotos} />
      </Panel>
      {problem && <Alert tone="error" title={problem} />}
      <Button type="submit" isLoading={isSaving}>
        {isSaving ? text.saving : text.save}
      </Button>
    </form>
  )
}
