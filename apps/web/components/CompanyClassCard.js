'use client'

import { Pencil, Users } from 'lucide-react'
import { formatMoney } from '@carvo/shared'
import { setClassRateAction } from '@/app/console/actions'
import Badge from '@/components/Badge'
import IconButton from '@/components/IconButton'
import SavedRate from '@/components/SavedRate'
import { copy } from '@/copy/en'

const text = copy.classPrices

// An emptied box changes nothing: a price is ended by its date, in the history below.
const save = (classId) => (price) =>
  price === null ? Promise.resolve({}) : setClassRateAction(classId, price)

function standing(item) {
  if (!item.operator_id) return { label: text.carvoClass, tone: 'neutral' }
  return item.is_public
    ? { label: text.listed, tone: 'success' }
    : { label: text.waiting, tone: 'warning' }
}

function Head({ item, onEdit }) {
  const { label, tone } = standing(item)
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 flex-col items-start gap-1">
        <h2 className="text-headline">{item.name}</h2>
        <span className="flex items-center gap-1 text-footnote text-label-2">
          <Users size={14} aria-hidden="true" />
          {copy.carFacts.seats(item.seats)}
        </span>
        <Badge tone={tone}>{label}</Badge>
      </div>
      {onEdit && (
        <IconButton label={text.editClass(item.name)} onClick={() => onEdit(item)}>
          <Pencil size={16} aria-hidden="true" />
        </IconButton>
      )}
    </div>
  )
}

/** One class: what it is, the company's price per day (changed in place), and what a renter pays today. */
export default function CompanyClassCard({ item, onEdit }) {
  return (
    <li className="flex flex-col gap-4 rounded-panel border border-separator bg-surface p-4 shadow-1">
      <Head item={item} onEdit={item.operator_id ? onEdit : undefined} />
      <div className="mt-auto rounded-control bg-bg-grouped p-3">
        <SavedRate
          label={text.priceLabel(item.name)}
          value={item.ownKes}
          note={item.ownKes ? text.yours : text.unset}
          placeholder={text.placeholder}
          save={save(item.id)}
        />
      </div>
      <p className="num text-footnote text-label-2">
        {item.renterKes ? text.renterPays(formatMoney(item.renterKes)) : text.noRenterPrice}
      </p>
    </li>
  )
}
