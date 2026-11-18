import { timingSafeEqual } from 'node:crypto'
import { AppError } from '../lib/errors.js'

/**
 * Guard for internal job endpoints. Cloudflare Cron Triggers send the shared secret in
 * the `x-job-secret` header; nothing else may call these routes.
 */
export function requireJobSecret(req, _res, next) {
  const expected = Buffer.from(process.env.INTERNAL_JOB_SECRET ?? '')
  const given = Buffer.from(req.get('x-job-secret') ?? '')
  const matches =
    expected.length > 0 && expected.length === given.length && timingSafeEqual(expected, given)
  if (!matches) throw new AppError('UNAUTHENTICATED')
  next()
}
