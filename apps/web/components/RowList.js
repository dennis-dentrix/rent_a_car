'use client'

import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import Button from '@/components/Button'
import IconButton from '@/components/IconButton'
import { copy } from '@/copy/en'
import { moved } from '@/lib/post-editor'

const text = copy.editor.rows

function RowTools({ noun, index, count, onMove, onRemove }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <p className="text-footnote font-semibold capitalize text-label-2">
        {noun} {index + 1}
      </p>
      <div className="flex gap-1">
        <IconButton label={text.up(noun)} disabled={index === 0} onClick={() => onMove(index - 1)}>
          <ChevronUp size={18} aria-hidden="true" />
        </IconButton>
        <IconButton
          label={text.down(noun)}
          disabled={index === count - 1}
          onClick={() => onMove(index + 1)}
        >
          <ChevronDown size={18} aria-hidden="true" />
        </IconButton>
        <IconButton label={text.remove(noun)} onClick={onRemove}>
          <Trash2 size={18} aria-hidden="true" />
        </IconButton>
      </div>
    </div>
  )
}

/**
 * A list of rows the writer can add to, reorder, and remove: sections, questions, links. Nothing here is saved until
 * the guide is, so removing a row is not final. `renderRow(row, update)` draws the fields of one row.
 */
export default function RowList({ title, noun, rows, onChange, makeRow, addLabel, renderRow }) {
  const update = (index, patch) =>
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)))
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-title-2">{title}</h2>
      {rows.map((row, index) => (
        <div
          key={row.key}
          className="flex flex-col gap-3 rounded-card border border-separator bg-surface p-4"
        >
          <RowTools
            noun={noun}
            index={index}
            count={rows.length}
            onMove={(to) => onChange(moved(rows, index, to))}
            onRemove={() => onChange(rows.filter((_, i) => i !== index))}
          />
          {renderRow(row, (patch) => update(index, patch))}
        </div>
      ))}
      <Button type="button" variant="tonal" onClick={() => onChange([...rows, makeRow()])}>
        {addLabel}
      </Button>
    </section>
  )
}
