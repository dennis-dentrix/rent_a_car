import ResourceScreen from '@/components/ResourceScreen'
import { copy } from '@/copy/en'
import { requireOperator } from '@/lib/console'

const labels = {
  ...copy.operatorConsole.resources['vehicle-owners'],
  fields: copy.adminFleet.resources['vehicle-owners'].fields,
}

export const metadata = { title: labels.title }

export default async function ConsoleOwnersPage({ searchParams }) {
  const { cursor } = await searchParams
  const { token } = await requireOperator()
  return (
    <ResourceScreen
      scope="console"
      resource="vehicle-owners"
      labels={labels}
      token={token}
      cursor={cursor}
      basePath="/console/owners"
    />
  )
}
