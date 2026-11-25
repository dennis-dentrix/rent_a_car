'use client'

import { useEffect, useMemo } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { MIN_INSPECTION_PHOTOS } from '@carvo/shared'
import { copy } from '@/copy/en'

const text = copy.inspections.form
const MOST = 20

function Preview({ url, number, onRemove }) {
  return (
    <li className="relative aspect-[4/3] overflow-hidden rounded-card bg-fill">
      {/* A picture still on this device has no address the image optimiser could fetch. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="" className="h-full w-full object-cover" />
      <button
        type="button"
        onClick={onRemove}
        aria-label={text.removePhoto(number)}
        className="absolute right-2 top-2 flex h-compact w-compact items-center justify-center rounded-control bg-surface shadow-1 transition-transform duration-fast active:scale-[0.95]"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </li>
  )
}

/** Photos chosen or taken on the spot, shown at once and removable before the report is saved. */
export default function PhotoPicker({ photos, onChange }) {
  const urls = useMemo(() => photos.map((photo) => URL.createObjectURL(photo)), [photos])
  useEffect(() => () => urls.forEach((url) => URL.revokeObjectURL(url)), [urls])
  const add = (event) => {
    onChange([...photos, ...event.target.files].slice(0, MOST))
    event.target.value = ''
  }
  return (
    <div className="flex flex-col gap-3">
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {urls.map((url, index) => (
          <Preview
            key={url}
            url={url}
            number={index + 1}
            onRemove={() => onChange(photos.filter((_, i) => i !== index))}
          />
        ))}
        <li>
          <label className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-2 rounded-card border border-dashed border-separator bg-bg-grouped text-meta font-bold text-primary focus-within:ring-2 focus-within:ring-accent">
            <ImagePlus size={22} aria-hidden="true" />
            {text.addPhotos}
            <input type="file" accept="image/*" multiple onChange={add} className="sr-only" />
          </label>
        </li>
      </ul>
      <p role="status" className="text-footnote text-label-2">
        {text.photoCount(photos.length, MIN_INSPECTION_PHOTOS)}
      </p>
    </div>
  )
}
