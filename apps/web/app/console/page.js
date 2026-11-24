import { nairobiDate } from '@carvo/shared'
import AdminBookingList from '@/components/AdminBookingList'
import Alert from '@/components/Alert'
import ConsoleStatus from '@/components/ConsoleStatus'
import Eyebrow from '@/components/Eyebrow'
import LargeTitle from '@/components/LargeTitle'
import SetupChecklist from '@/components/SetupChecklist'
import StatTiles from '@/components/StatTiles'
import { copy } from '@/copy/en'
import { consoleGet, getOperatorClassNames, requireOperator } from '@/lib/console'

const text = copy.operatorConsole.today

export const metadata = { title: copy.operatorConsole.meta.title }

const PICKUP_STATUSES = ['confirmed', 'ready']

function Pickups({ bookings, classNames }) {
  return (
    <section aria-labelledby="pickups" className="flex flex-col gap-3">
      <h2 id="pickups" className="text-title-3">
        {text.pickups}
      </h2>
      {bookings.length ? (
        <AdminBookingList
          bookings={bookings}
          classNames={classNames}
          basePath="/console/bookings"
        />
      ) : (
        <p className="text-body text-label-2">{text.noPickups}</p>
      )}
    </section>
  )
}

// The first page of the console: where the company stands, what is left to set up, what moves today.
export default async function ConsolePage() {
  const { token } = await requireOperator()
  const [overview, pickups, classNames] = await Promise.all([
    consoleGet('/operator/overview', token),
    consoleGet('/operator/bookings', token, { date: nairobiDate(new Date()) }),
    getOperatorClassNames(token),
  ])
  if (overview.error) return <Alert tone="error" title={copy.admin.loadError} />
  const data = overview.data
  const dueToday = (pickups.data ?? []).filter((b) => PICKUP_STATUSES.includes(b.status))
  const tiles = [
    { label: text.pickups, value: data.pickups_today },
    { label: text.returns, value: data.returns_today },
    { label: text.onHire, value: data.on_hire },
    { label: text.vehicles, value: data.vehicles },
  ]
  return (
    <div className="flex flex-col gap-8">
      <div>
        <Eyebrow>{text.eyebrow}</Eyebrow>
        <LargeTitle>{data.company.business_name}</LargeTitle>
      </div>
      <ConsoleStatus company={data.company} />
      <SetupChecklist overview={data} />
      {data.vehicles_without_rate > 0 && (
        <Alert tone="warning" title={text.unpriced(data.vehicles_without_rate)} />
      )}
      <StatTiles title={copy.admin.overview.todayTitle} items={tiles} />
      <Pickups bookings={dueToday} classNames={classNames} />
    </div>
  )
}
