import ResourceTable from '@/components/ResourceTable'
import { copy } from '@/copy/en'

/**
 * The records of one kind: summed up on the server, shown in the browser as a table with an add and edit drawer.
 * `summarize` turns a record into { title, detail } and, for a richer table, { cells, tags }.
 */
export default function ResourceList({
  rows,
  summarize,
  formProps,
  isReadOnly = false,
  columns,
  filters,
}) {
  const items = rows.map((row) => ({ id: row.id, row, ...summarize(row) }))
  return (
    <div className="flex flex-col gap-2">
      <ResourceTable
        items={items}
        columns={columns}
        filters={filters}
        formProps={isReadOnly ? undefined : formProps}
      />
      {!isReadOnly && <p className="text-meta text-label-3">{copy.adminSetup.nothingIsDeleted}</p>}
    </div>
  )
}
