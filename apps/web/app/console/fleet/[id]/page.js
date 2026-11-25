import Alert from '@/components/Alert'
import VehicleDetail from '@/components/VehicleDetail'
import { copy } from '@/copy/en'
import { loadRefs } from '@/lib/resource-refs'
import { registryFor } from '@/lib/resource-scopes'
import { orNotFound } from '@/lib/admin'
import { consoleGet, requireOperator } from '@/lib/console'

export const metadata = { title: copy.operatorConsole.nav.fleet }

export default async function ConsoleVehiclePage({ params }) {
  const { id } = await params
  const { token } = await requireOperator()
  const { data: vehicle, error } = orNotFound(await consoleGet(`/operator/vehicles/${id}`, token))
  if (error) return <Alert tone="error" title={copy.admin.loadError} />
  const refs = await loadRefs('console', registryFor('console').vehicles.needs, token)
  return <VehicleDetail vehicle={vehicle} scope="console" backHref="/console/fleet" refs={refs} />
}
