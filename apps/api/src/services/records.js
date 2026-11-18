import { AppError } from '../lib/errors.js'
import { unwrap } from '../lib/supabase.js'

// Small shared helpers for services that create, read, and update one row of a table.
// Row Level Security decides who may do each, because `db` acts as the signed-in user.

/** Insert a row and return it. A row the caller may not write fails as FORBIDDEN. */
export const insertOne = async (db, table, columns, values) =>
  unwrap(await db.from(table).insert(values).select(columns).single())

/** One row by id, or a NOT_FOUND error. */
export async function findOne(db, table, columns, id, idColumn = 'id') {
  const row = unwrap(await db.from(table).select(columns).eq(idColumn, id).maybeSingle())
  if (!row) throw new AppError('NOT_FOUND')
  return row
}

/** Update a row by id and return it. A row the caller cannot see or change is NOT_FOUND. */
export async function updateOne(db, table, columns, id, values) {
  const row = unwrap(await db.from(table).update(values).eq('id', id).select(columns).maybeSingle())
  if (!row) throw new AppError('NOT_FOUND')
  return row
}
