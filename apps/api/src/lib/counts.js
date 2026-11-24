import { unwrap } from './supabase.js'

/** How many rows of a table match, without reading them. `narrow` adds the filters to the query. */
export async function countRows(db, table, narrow) {
  const result = await narrow(db.from(table).select('*', { count: 'exact', head: true }))
  unwrap(result)
  return result.count ?? 0
}
