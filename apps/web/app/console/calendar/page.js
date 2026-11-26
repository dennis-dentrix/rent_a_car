import { nairobiDate } from '@carvo/shared'
import AdminPage from '@/components/AdminPage'
import BlockForm from '@/components/BlockForm'
import BlockList from '@/components/BlockList'
import Button from '@/components/Button'
import CalendarGrid from '@/components/CalendarGrid'
import Panel from '@/components/Panel'
import { copy } from '@/copy/en'
import { addDays } from '@/lib/calendar'
import { calendarDays, calendarRows } from '@/lib/calendar-grid'
import { consoleGet, requireOperator } from '@/lib/console'

const text = copy.calendar
const DAY = /^\d{4}-\d{2}-\d{2}$/

export const metadata = { title: text.title }

function Weeks({ from, days }) {
  const link = (shift) => `/console/calendar?from=${addDays(from, shift)}`
  return (
    <div className="flex gap-3">
      <Button href={link(-days)} variant="tonal" size="compact">
        {text.earlier}
      </Button>
      <Button href={link(days)} variant="tonal" size="compact">
        {text.later}
      </Button>
    </div>
  )
}

function Calendar({ data }) {
  const rows = calendarRows(data)
  if (!rows.length) return <p className="text-label-2">{text.none}</p>
  const names = new Map(
    data.vehicles.map((car) => [
      car.id,
      [car.make, car.model, car.registration].filter(Boolean).join(' '),
    ]),
  )
  return (
    <>
      <CalendarGrid days={calendarDays(data.from, data.days)} rows={rows} />
      <div className="grid items-start gap-5 md:grid-cols-2">
        <Panel title={text.blockTitle} hint={text.blockHint}>
          <BlockForm cars={[...names].map(([value, label]) => ({ value, label }))} />
        </Panel>
        <Panel title={text.blocks}>
          <BlockList blocks={data.blocks} carNames={names} />
        </Panel>
      </div>
    </>
  )
}

export default async function CalendarPage({ searchParams }) {
  const { from } = await searchParams
  const { token } = await requireOperator()
  const start = DAY.test(from ?? '') ? from : nairobiDate(new Date())
  const { data, error } = await consoleGet(`/operator/calendar?from=${start}`, token)
  return (
    <AdminPage
      title={text.title}
      subtitle={text.subtitle}
      actions={data && <Weeks from={start} days={data.days} />}
      hasError={Boolean(error)}
    >
      {data && <Calendar data={data} />}
    </AdminPage>
  )
}
