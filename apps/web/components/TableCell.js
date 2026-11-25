import Image from 'next/image'
import { CarFront } from 'lucide-react'
import StatusPill from '@/components/StatusPill'
import { copy } from '@/copy/en'

function Thumbnail({ src }) {
  return (
    <span className="flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded-control bg-fill text-label-3">
      {src ? (
        <Image src={src} alt="" width={64} height={48} className="h-full w-full object-cover" />
      ) : (
        <CarFront size={20} aria-label={copy.consoleUi.fleet.noPhoto} />
      )}
    </span>
  )
}

function Stacked({ value }) {
  return (
    <span className="flex flex-col gap-0.5">
      <span className="flex flex-wrap items-center gap-1.5">
        <span className="num whitespace-nowrap font-bold">{value.main}</span>
        {value.chip && (
          <span className="num rounded-control bg-fill px-1.5 text-meta">{value.chip}</span>
        )}
      </span>
      {value.code && (
        <span className="num w-max rounded-control bg-accent-subtle px-2 text-meta font-bold tracking-wide text-primary">
          {value.code}
        </span>
      )}
      {value.sub && <span className="text-meta text-label-2">{value.sub}</span>}
    </span>
  )
}

/**
 * One value of a table, from plain data so the server can send it to the browser: text, a status ({ pill, tone }), or a
 * stacked block ({ main, chip, code, sub }).
 */
export default function TableCell({ value }) {
  if (value === null || value === undefined || value === '')
    return <span aria-hidden="true">—</span>
  if (typeof value !== 'object') return value
  if (value.pill) return <StatusPill tone={value.tone}>{value.pill}</StatusPill>
  if (!value.hasPhotoSlot) return <Stacked value={value} />
  return (
    <span className="flex items-center gap-3">
      <Thumbnail src={value.image} />
      <Stacked value={value} />
    </span>
  )
}
