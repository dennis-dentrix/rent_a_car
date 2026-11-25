import Alert from '@/components/Alert'
import VehicleDetail from '@/components/VehicleDetail'
import { copy } from '@/copy/en'
import { loadRefs } from '@/lib/resource-refs'
import { registryFor } from '@/lib/resource-scopes'
import { adminGet, orNotFound, requireAdmin } from '@/lib/admin'

export const metadata = { title: copy.adminFleet.nav.vehicles }

export default async function AdminVehiclePage({ params }) {
  const { id } = await params
  const { token } = await requireAdmin()
  const { data: vehicle, error } = orNotFound(await adminGet(`/staff/vehicles/${id}`, token))
  if (error) return <Alert tone="error" title={copy.admin.loadError} />
  const refs = await loadRefs('admin', registryFor('admin').vehicles.needs, token)
  return (
    <VehicleDetail vehicle={vehicle} scope="admin" backHref="/admin/setup/vehicles" refs={refs} />
  )
}
