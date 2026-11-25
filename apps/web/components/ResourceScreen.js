import AdminMoreLink from '@/components/AdminMoreLink'
import AdminPage from '@/components/AdminPage'
import Alert from '@/components/Alert'
import ResourceList from '@/components/ResourceList'
import { copy } from '@/copy/en'
import { adminGet } from '@/lib/admin'
import { nextPageHref } from '@/lib/admin-format'
import { resourcePaths } from '@/lib/admin-resources'
import { loadRefs } from '@/lib/resource-refs'
import { registryFor } from '@/lib/resource-scopes'

const nameMaps = (refs) =>
  Object.fromEntries(
    Object.entries(refs)
      .filter(([, records]) => Array.isArray(records))
      .map(([key, records]) => [key, new Map(records.map((record) => [record.id, record.name]))]),
  )

/**
 * A whole list-and-edit screen for one kind of record, for the admin or for an operator: the title, the "Add new" form,
 * each record with its edit form, and the link to older ones. `labels` is the screen's copy ({ title, subtitle, fields }).
 */
export default async function ResourceScreen(props) {
  const { scope, resource, labels, token, cursor, basePath } = props
  const definition = registryFor(scope)[resource]
  const [list, refs] = await Promise.all([
    adminGet(resourcePaths(resource, definition, scope).list, token, { cursor }),
    loadRefs(scope, definition.needs, token),
  ])
  const names = nameMaps(refs)
  return (
    <AdminPage eyebrow={props.eyebrow} title={labels.title} subtitle={labels.subtitle}>
      {list.error && <Alert tone="error" title={copy.admin.loadError} />}
      <ResourceList
        isReadOnly={definition.isReadOnly}
        columns={definition.columns}
        filters={definition.filters}
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
