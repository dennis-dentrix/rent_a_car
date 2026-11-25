import AdminMoreLink from '@/components/AdminMoreLink'
import AdminPage from '@/components/AdminPage'
import InspectionTable from '@/components/InspectionTable'
import Panel from '@/components/Panel'
import { copy } from '@/copy/en'
import { nextPageHref } from '@/lib/admin-format'
import { consoleGet, requireOperator } from '@/lib/console'

const text = copy.inspections

export const metadata = { title: text.title }

export default async function ConsoleInspectionsPage({ searchParams }) {
  const { cursor } = await searchParams
  const { token } = await requireOperator()
  const { data, meta, error } = await consoleGet('/operator/inspections', token, { cursor })
  return (
    <AdminPage title={text.title} subtitle={text.subtitle} hasError={Boolean(error)}>
      <Panel isFlush>
        {data?.length ? (
          <InspectionTable reports={data} basePath="/console/inspections" />
        ) : (
          <p className="px-5 py-10 text-center text-label-2">{text.empty}</p>
        )}
      </Panel>
      <AdminMoreLink href={nextPageHref('/console/inspections', {}, meta?.next_cursor)}>
        {copy.adminSetup.more}
      </AdminMoreLink>
    </AdminPage>
  )
}
