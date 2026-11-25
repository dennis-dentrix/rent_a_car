import { Building2, CalendarArrowDown, CalendarArrowUp, FileCheck, KeyRound } from 'lucide-react'
import { copy } from '@/copy/en'

const text = copy.admin.overview

// A queue is warm while someone is waiting in it.
const queue = (count) => (count > 0 ? 'warm' : 'plain')

/** The admin's headline figures: who is waiting, and what moves today. */
export function adminTiles(overview) {
  return [
    {
      label: text.tiles.companies,
      value: overview.companies_pending,
      note: text.tiles.waiting,
      icon: Building2,
      tone: queue(overview.companies_pending),
      href: '/admin/operators',
    },
    {
      label: text.tiles.documents,
      value: overview.documents_to_review,
      note: text.tiles.waiting,
      icon: FileCheck,
      tone: queue(overview.documents_to_review),
      href: '/admin/documents',
    },
    {
      label: text.pickups,
      value: overview.pickups_today,
      note: text.todayTitle,
      icon: CalendarArrowUp,
    },
    {
      label: text.returns,
      value: overview.returns_today,
      note: text.todayTitle,
      icon: CalendarArrowDown,
    },
    {
      label: text.onHire,
      value: overview.rentals_active,
      note: text.tiles.now,
      icon: KeyRound,
      tone: 'strong',
    },
  ]
}
