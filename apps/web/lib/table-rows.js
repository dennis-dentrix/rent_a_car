// Every word and number a row shows, however its cells are nested.
const words = (value) =>
  value && typeof value === 'object' ? Object.values(value).flatMap(words) : [value ?? '']

const searchable = (item) =>
  words([item.title, item.detail, item.cells ?? {}])
    .join(' ')
    .toLowerCase()

const isInFilter = (item, filter) => filter === 'all' || (item.tags ?? []).includes(filter)

/** The rows that match what was typed and the chosen filter. */
export function visibleRows(items, { query, filter }) {
  const wanted = query.trim().toLowerCase()
  return items.filter(
    (item) => isInFilter(item, filter) && (!wanted || searchable(item).includes(wanted)),
  )
}

/** The filter pills with the number of rows behind each, "All" first. A filter nothing matches is left out. */
export function filterPills(items, filters, allLabel) {
  const counted = filters
    .map((entry) => ({
      ...entry,
      count: items.filter((item) => isInFilter(item, entry.key)).length,
    }))
    .filter((entry) => entry.count > 0)
  return [{ key: 'all', label: allLabel, count: items.length }, ...counted]
}
