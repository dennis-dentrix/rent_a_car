import { z } from 'zod'
import { fieldError } from './errors.js'
import { unwrap } from './supabase.js'

// Cursor pagination (docs/api-spec.md section 1). The cursor is opaque to clients.
// The default and maximum page sizes are in the shared package.

// A cursor ends up inside a database filter, so both parts are strictly validated.
const TIMESTAMP = /^\d{4}-\d{2}-\d{2}T[\d:.]+(Z|\+00:00)$/

export const encodeCursor = (row) =>
  Buffer.from(JSON.stringify({ t: row.created_at, id: row.id })).toString('base64url')

export function decodeCursor(cursor) {
  try {
    const { t, id } = JSON.parse(Buffer.from(cursor, 'base64url').toString())
    if (!TIMESTAMP.test(t) || !z.uuid().safeParse(id).success) throw new Error('invalid cursor')
    return { createdAt: t, id }
  } catch {
    throw fieldError('cursor', 'This cursor is not valid.')
  }
}

/**
 * Turn `limit + 1` fetched rows (newest first) into a page and the cursor for the next one.
 * Fetching one extra row is how we know whether a next page exists.
 */
export function toPage(rows, limit) {
  const page = rows.slice(0, limit)
  const next = rows.length > limit ? encodeCursor(page[page.length - 1]) : null
  return { data: page, meta: { next_cursor: next } }
}

/**
 * Run a select query newest first, starting after `cursor`. The selected columns must include
 * `id` and `created_at`. Returns `{ data, meta }` for the response envelope.
 */
export async function listPage(query, { limit, cursor }) {
  let paged = query
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(limit + 1)
  if (cursor) {
    const { createdAt, id } = decodeCursor(cursor)
    paged = paged.or(`created_at.lt."${createdAt}",and(created_at.eq."${createdAt}",id.lt.${id})`)
  }
  return toPage(unwrap(await paged), limit)
}
