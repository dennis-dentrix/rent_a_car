import { ERROR_CODES } from '@rent-a-car/shared'

export class AppError extends Error {
  /**
   * @param {keyof typeof ERROR_CODES} code
   * @param {{ message?: string, details?: object }} [options]
   */
  constructor(code, { message, details = {} } = {}) {
    const known = ERROR_CODES[code] ?? ERROR_CODES.INTERNAL_ERROR
    super(message ?? known.message)
    this.name = 'AppError'
    this.code = ERROR_CODES[code] ? code : 'INTERNAL_ERROR'
    this.status = known.status
    this.details = details
  }
}

/** A VALIDATION_FAILED error pointing at one field. */
export const fieldError = (field, message) =>
  new AppError('VALIDATION_FAILED', { details: { [field]: message } })

export const toErrorBody = (error) => ({
  error: { code: error.code, message: error.message, details: error.details },
})
