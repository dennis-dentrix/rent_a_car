import ResourceScreen from '@/components/ResourceScreen'
import { copy } from '@/copy/en'
import { requireOperator } from '@/lib/console'

const labels = {
  ...copy.operatorConsole.resources.vehicles,
  fields: copy.adminFleet.resources.vehicles.fields,
}

export const metadata = { title: labels.title }

export default async function ConsoleFleetPage({ searchParams }) {
  const { cursor } = await searchParams
  const { token } = await requireOperator()
  return (
    <ResourceScreen
      scope="console"
      resource="vehicles"
      labels={labels}
      token={token}
      cursor={cursor}
      basePath="/console/fleet"
    />
  )
}
