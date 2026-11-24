import { createClient } from '@supabase/supabase-js'
import { ERROR_CODES } from '@carvo/shared'
import { AppError } from './errors.js'
import { logger } from './logger.js'

const clientWith = (key, extra = {}) =>
  createClient(process.env.SUPABASE_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    ...extra,
  })

/** Client for public reads. Subject to Row Level Security as a guest. */
export const createAnonClient = () => clientWith(process.env.SUPABASE_ANON_KEY)

/** Client that acts as the signed-in user. Row Level Security applies to every query. */
export const createUserClient = (accessToken) =>
  clientWith(process.env.SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  })

/**
 * Run work with the service role, which bypasses RLS. Server code only.
 * Every use is logged with its purpose.
 */
export async function withServiceRole(purpose, work) {
  logger.info('service_role_used', { purpose })
  return work(clientWith(process.env.SUPABASE_SERVICE_ROLE_KEY))
}

// Postgres errors a caller can fix, shown as the matching API error instead of a server error.
const DATABASE_ERRORS = {
  23505: ['CONFLICT', 'That value is already in use.'],
  '23P01': ['CONFLICT', 'That overlaps an existing record.'],
  23503: ['VALIDATION_FAILED', 'It refers to a record that does not exist.'],
  23502: ['VALIDATION_FAILED', 'A required value is missing.'],
  23514: ['VALIDATION_FAILED', 'A value is outside the allowed range.'],
  42501: ['FORBIDDEN', undefined],
}

/**
 * Return the data of a Supabase result. A database function that raises an API error code
 * (for example QUOTE_EXPIRED) becomes that error; known constraint errors become 4xx errors;
 * anything else is logged and hidden.
 */
export function unwrap({ data, error }) {
  if (!error) return data
  if (error.code === 'P0001' && ERROR_CODES[error.message]) throw new AppError(error.message)
  const [code, message] = DATABASE_ERRORS[error.code] ?? []
  if (code) throw new AppError(code, { message })
  logger.error('database_error', { code: error.code, message: error.message })
  throw new AppError('INTERNAL_ERROR')
}
