import AdminPage from '@/components/AdminPage'
import Panel from '@/components/Panel'
import ResourceForm from '@/components/ResourceForm'
import { copy } from '@/copy/en'
import { CONSOLE_RESOURCES } from '@/lib/console-resources'
import { consoleGet, requireOperator } from '@/lib/console'

const text = copy.operatorConsole.resources.company

export const metadata = { title: text.title }

export default async function ConsoleCompanyPage() {
  const { token } = await requireOperator()
  const { data, error } = await consoleGet('/operator/company', token)
  return (
    <AdminPage title={text.title} subtitle={text.subtitle} isNarrow hasError={Boolean(error)}>
      {data && (
        <Panel>
          <ResourceForm
            resource="company"
            scope="console"
            fields={CONSOLE_RESOURCES.company.fields}
            labels={text.fields}
            row={data}
            refs={{}}
          />
        </Panel>
      )}
    </AdminPage>
  )
}
