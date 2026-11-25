import { nairobiDate } from '@carvo/shared'
import AdminBookingList from '@/components/AdminBookingList'
import AdminPage from '@/components/AdminPage'
import Alert from '@/components/Alert'
import ConsoleStatus from '@/components/ConsoleStatus'
import Panel from '@/components/Panel'
import SetupChecklist from '@/components/SetupChecklist'
import StatTiles from '@/components/StatTiles'
import { copy } from '@/copy/en'
import { consoleGet, getOperatorClassNames, requireOperator } from '@/lib/console'
import { consoleTiles } from '@/lib/console-tiles'

const text = copy.operatorConsole.today

export const metadata = { title: copy.operatorConsole.meta.title }

const PICKUP_STATUSES = ['confirmed', 'ready']

function Pickups({ bookings, classNames }) {
  return (
    <Panel title={text.pickups} isFlush>
      {bookings.length ? (
        <AdminBookingList
          bookings={bookings}
          classNames={classNames}
          basePath="/console/bookings"
        />
      ) : (
        <p className="px-5 pb-8 pt-4 text-center text-cell text-label-2">{text.noPickups}</p>
      )}
    </Panel>
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
  return (
    <AdminPage eyebrow={text.eyebrow} title={data.company.business_name} subtitle={text.subtitle}>
      <ConsoleStatus company={data.company} />
      <StatTiles title={copy.admin.overview.todayTitle} items={consoleTiles(data)} />
      <div className="grid items-start gap-5 lg:grid-cols-[2fr_1fr]">
        <Pickups bookings={dueToday} classNames={classNames} />
        <SetupChecklist overview={data} />
      </div>
    </AdminPage>
  )
}
