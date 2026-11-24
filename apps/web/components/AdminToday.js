import StatTiles from '@/components/StatTiles'
import { copy } from '@/copy/en'

const text = copy.admin.overview

/** Today's movement in Nairobi: cars going out, cars coming back, cars on hire. */
export default function AdminToday({ overview }) {
  const items = [
    { label: text.pickups, value: overview.pickups_today },
    { label: text.returns, value: overview.returns_today },
    { label: text.onHire, value: overview.rentals_active },
  ]
  return <StatTiles title={text.todayTitle} items={items} />
}
