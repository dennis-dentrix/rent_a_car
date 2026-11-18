import { ZodError } from 'zod'
import { AppError, toErrorBody } from '../lib/errors.js'
import { logger } from '../lib/logger.js'

/**
 * Wrap a handler so it sends the API envelope.
 * The handler returns { data, meta?, status? } or throws; errors reach `errorHandler`.
 */
export const handle = (handler) => async (req, res) => {
  const { data, meta = { next_cursor: null }, status = 200 } = await handler(req)
  res.status(status).json({ data, meta })
}

export const notFoundHandler = () => {
  throw new AppError('NOT_FOUND')
}

const fieldDetails = (error) =>
  Object.fromEntries(error.issues.map((issue) => [issue.path.join('.') || '_', issue.message]))

function toAppError(error) {
  if (error instanceof AppError) return error
  if (error instanceof ZodError) {
    return new AppError('VALIDATION_FAILED', { details: fieldDetails(error) })
  }
  if (error?.type === 'entity.parse.failed' || error?.type === 'entity.too.large') {
    return new AppError('VALIDATION_FAILED', { message: 'The request body must be valid JSON.' })
  }
  logger.error('unhandled_error', { message: error?.message })
  return new AppError('INTERNAL_ERROR')
}

// Express recognises an error handler by its four parameters.
export const errorHandler = (error, _req, res, _next) => {
  const appError = toAppError(error)
  res.status(appError.status).json(toErrorBody(appError))
}
