import AdminMoreLink from '@/components/AdminMoreLink'
import AdminPage from '@/components/AdminPage'
import Alert from '@/components/Alert'
import ResourceList from '@/components/ResourceList'
import { copy } from '@/copy/en'
import { adminGet } from '@/lib/admin'
import { nextPageHref } from '@/lib/admin-format'
import { resourcePaths } from '@/lib/admin-resources'
import { refPath, registryFor } from '@/lib/resource-scopes'

// Other records a screen refers to (the classes a rate belongs to), as an id and something to show.
async function loadRefs(scope, needs = [], token) {
  const lists = await Promise.all(
    needs.map((name) => adminGet(refPath(scope, name), token, { limit: 100 })),
  )
  return Object.fromEntries(
    needs.map((name, index) => [
      name,
      (lists[index].data ?? []).map((record) => ({
        id: record.id,
        name: record.name ?? record.full_name,
      })),
    ]),
  )
}

const nameMaps = (refs) =>
  Object.fromEntries(
    Object.entries(refs).map(([key, records]) => [
      key,
      new Map(records.map((record) => [record.id, record.name])),
    ]),
  )

/**
 * A whole list-and-edit screen for one kind of record, for the admin or for an operator: the title, the "Add new" form,
 * each record with its edit form, and the link to older ones. `labels` is the screen's copy ({ title, subtitle, fields }).
 */
export default async function ResourceScreen({ scope, resource, labels, token, cursor, basePath }) {
  const definition = registryFor(scope)[resource]
  const [list, refs] = await Promise.all([
    adminGet(resourcePaths(resource, definition, scope).list, token, { cursor }),
    loadRefs(scope, definition.needs, token),
  ])
  const names = nameMaps(refs)
  return (
    <AdminPage title={labels.title} subtitle={labels.subtitle} isNarrow>
      {list.error && <Alert tone="error" title={copy.admin.loadError} />}
      <ResourceList
        isReadOnly={definition.isReadOnly}
        rows={list.data ?? []}
        summarize={(row) => definition.summarize(row, names)}
        formProps={{ resource, scope, fields: definition.fields, labels: labels.fields, refs }}
      />
      <AdminMoreLink href={nextPageHref(basePath, {}, list.meta?.next_cursor)}>
        {copy.adminSetup.more}
      </AdminMoreLink>
    </AdminPage>
  )
}
