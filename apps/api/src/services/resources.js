import { listPage } from '../lib/pagination.js'
import { findOne, insertOne, updateOne } from './records.js'

/**
 * One kind of record that a person fills in, listed, read, created, and changed the same way for every kind. `scope`
 * narrows a list to what the caller may see (an operator's own rows), `prepare` adds what the server decides (the
 * operator, the web address word), and `read` replaces the plain read of one row. A kind with no `create` or `update`
 * cannot be written that way. Row Level Security still decides who may write; these only shape the request.
 */
export const resource = (table, columns, { create, update, scope, prepare, read } = {}) => ({
  table,
  columns: `id, ${columns}, created_at`,
  create,
  update,
  scope,
  prepare,
  read,
})

export const listResource = (auth, { table, columns, scope }, { limit, cursor }) => {
  const query = auth.db.from(table).select(columns)
  return listPage(scope ? scope(query, auth) : query, { limit, cursor })
}

export const getResource = (auth, { table, columns, read }, id) =>
  read ? read(auth, id) : findOne(auth.db, table, columns, id)

export async function createResource(auth, { table, columns, prepare }, input) {
  const values = prepare ? await prepare(input, auth) : input
  return insertOne(auth.db, table, columns, values)
}

export const updateResource = (auth, { table, columns }, id, input) =>
  updateOne(auth.db, table, columns, id, input)
