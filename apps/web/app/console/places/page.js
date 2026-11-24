import AirportSwitches from '@/components/AirportSwitches'
import AdminPage from '@/components/AdminPage'
import ResourceList from '@/components/ResourceList'
import { copy } from '@/copy/en'
import { CONSOLE_RESOURCES } from '@/lib/console-resources'
import { consoleGet, requireOperator } from '@/lib/console'

const text = copy.operatorConsole.places
const own = copy.operatorConsole.resources.places
const { places } = CONSOLE_RESOURCES

export const metadata = { title: text.title }

export default async function ConsolePlacesPage() {
  const { token } = await requireOperator()
  const [airports, mine] = await Promise.all([
    consoleGet('/operator/airports', token),
    consoleGet('/operator/places', token),
  ])
  const failed = airports.error || mine.error
  return (
    <AdminPage title={text.title} subtitle={text.subtitle} isNarrow hasError={Boolean(failed)}>
      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-title-3">{text.airportsTitle}</h2>
          <p className="text-callout text-label-2">{text.airportsHint}</p>
        </div>
        <AirportSwitches airports={airports.data ?? []} />
      </section>
      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-title-3">{own.title}</h2>
          <p className="text-callout text-label-2">{own.subtitle}</p>
        </div>
        <ResourceList
          rows={mine.data ?? []}
          summarize={places.summarize}
          formProps={{
            resource: 'places',
            scope: 'console',
            fields: places.fields,
            labels: copy.adminSetup.resources.locations.fields,
            refs: {},
          }}
        />
      </section>
    </AdminPage>
  )
}
