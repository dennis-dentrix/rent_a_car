import AdminPage from '@/components/AdminPage'
import ServiceSwitches from '@/components/ServiceSwitches'
import { copy } from '@/copy/en'
import { consoleGet, requireOperator } from '@/lib/console'

const text = copy.operatorConsole.services

export const metadata = { title: text.title }

export default async function ConsoleServicesPage() {
  const { token } = await requireOperator()
  const { data, error } = await consoleGet('/operator/services', token)
  return (
    <AdminPage title={text.title} subtitle={text.subtitle} isNarrow hasError={Boolean(error)}>
      <ServiceSwitches selected={data ?? []} />
    </AdminPage>
  )
}
