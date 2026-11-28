'use client'

import { attempt } from '@/lib/attempt'
import Image from 'next/image'
import { useState, useTransition } from 'react'
import { ImagePlus, Trash2 } from 'lucide-react'
import { MAX_VEHICLE_PHOTOS, MAX_VEHICLE_PHOTO_BYTES } from '@carvo/shared'
import {
  addPhotoAction,
  removePhotoAction,
  requestPhotoUploadAction,
} from '@/app/admin/car-actions'
import Alert from '@/components/Alert'
import Panel from '@/components/Panel'
import { copy } from '@/copy/en'
import { uploadPicture } from '@/lib/upload'

const text = copy.adminFleet.photos

const send = (car, file) =>
  uploadPicture(file, {
    maxBytes: MAX_VEHICLE_PHOTO_BYTES,
    request: (declaration) => requestPhotoUploadAction(car, declaration),
    save: (photo) => addPhotoAction(car, photo),
  })

function Photo({ photo, isCover, onRemove }) {
  return (
    <li className="relative aspect-[4/3] overflow-hidden rounded-card bg-fill">
      <Image
        src={photo.url}
        alt=""
        fill
        sizes="(min-width: 768px) 240px, 50vw"
        className="object-cover"
      />
      {isCover && (
        <span className="absolute bottom-2 left-2 rounded-pill bg-surface px-2 text-meta font-bold">
          {text.cover}
        </span>
      )}
      <button
        type="button"
        onClick={onRemove}
        aria-label={text.remove}
        className="absolute right-2 top-2 flex h-compact w-compact items-center justify-center rounded-control bg-surface shadow-1 transition-transform duration-fast active:scale-[0.95]"
      >
        <Trash2 size={16} aria-hidden="true" />
      </button>
    </li>
  )
}

function AddTile({ isBusy, onPick }) {
  return (
    <li>
      <label className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-2 rounded-card border border-dashed border-separator bg-bg-grouped text-meta font-bold text-primary focus-within:ring-2 focus-within:ring-accent">
        <ImagePlus size={22} aria-hidden="true" />
        {isBusy ? text.adding : text.add}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={isBusy}
          onChange={(event) => onPick([...event.target.files])}
          className="sr-only"
        />
      </label>
    </li>
  )
}

/** A car's photos: add several at once, or remove one. Each is checked by the server before it appears. */
export default function VehiclePhotos({ car, photos }) {
  const [problem, setProblem] = useState(null)
  const [isBusy, startWork] = useTransition()
  const room = MAX_VEHICLE_PHOTOS - photos.length
  const pick = (files) =>
    startWork(async () => {
      setProblem(null)
      for (const file of files.slice(0, room)) {
        const { error } = await attempt(() => send(car, file), { error: 'upload' })
        if (error) return setProblem(text.errors[error])
      }
    })
  const remove = (path) =>
    startWork(async () => {
      const result = await attempt(() => removePhotoAction(car, path))
      setProblem(result.error ?? null)
    })
  return (
    <Panel title={text.title} hint={text.hint(MAX_VEHICLE_PHOTOS)}>
      <div className="flex flex-col gap-3">
        {problem && <Alert tone="error" title={problem} />}
        {photos.length === 0 && <p className="text-cell text-label-2">{text.empty}</p>}
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {photos.map((photo, index) => (
            <Photo
              key={photo.path}
              photo={photo}
              isCover={index === 0}
              onRemove={() => remove(photo.path)}
            />
          ))}
          {room > 0 && <AddTile isBusy={isBusy} onPick={pick} />}
        </ul>
      </div>
    </Panel>
  )
}
