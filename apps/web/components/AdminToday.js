import { copy } from '@/copy/en'

const text = copy.admin.overview

function Stat({ label, value }) {
  return (
    <div className="rounded-card bg-bg-grouped p-4">
      <p className="num text-display">{value}</p>
      <p className="text-callout text-label-2">{label}</p>
    </div>
  )
}

/** Today's movement in Nairobi: cars going out, cars coming back, cars on hire. */
export default function AdminToday({ overview }) {
  return (
    <section aria-labelledby="today" className="flex flex-col gap-3">
      <h2 id="today" className="text-title-3">
        {text.todayTitle}
      </h2>
      <div className="grid grid-cols-3 gap-3">
        <Stat label={text.pickups} value={overview.pickups_today} />
        <Stat label={text.returns} value={overview.returns_today} />
        <Stat label={text.onHire} value={overview.rentals_active} />
      </div>
    </section>
  )
}
