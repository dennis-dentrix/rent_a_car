import ResourceScreen from '@/components/ResourceScreen'
import { copy } from '@/copy/en'
import { requireOperator } from '@/lib/console'

const labels = {
  ...copy.operatorConsole.resources.rates,
  fields: copy.adminSetup.resources.rates.fields,
}

export const metadata = { title: labels.title }

export default async function ConsoleRatesPage({ searchParams }) {
  const { cursor } = await searchParams
  const { token } = await requireOperator()
  return (
    <ResourceScreen
      scope="console"
      resource="rates"
      labels={labels}
      token={token}
      cursor={cursor}
      basePath="/console/rates"
    />
  )
}
