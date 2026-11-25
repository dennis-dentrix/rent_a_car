import { BadgeCheck } from 'lucide-react'
import Badge from '@/components/Badge'
import { copy } from '@/copy/en'

/** Who rents the car out, and that Carvo approved the company. */
export default function ApprovedBy({ name }) {
  return (
    <div className="mb-2 flex flex-wrap items-center gap-2">
      <p className="text-footnote text-label-2">{name}</p>
      <Badge tone="verified" icon={BadgeCheck}>
        {copy.liveCars.approved}
      </Badge>
    </div>
  )
}
