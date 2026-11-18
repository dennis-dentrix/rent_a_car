import { describe, expect, it } from 'vitest'
import { AppError, toErrorBody } from './errors.js'

describe('AppError', () => {
  it('carries the status from the shared code table', () => {
    expect(new AppError('BOOKING_OVERLAP').status).toBe(409)
  })

  it('falls back to INTERNAL_ERROR for an unknown code', () => {
    expect(new AppError('NOPE').code).toBe('INTERNAL_ERROR')
  })

  it('serialises to the API error envelope', () => {
    const body = toErrorBody(new AppError('QUOTE_EXPIRED', { details: { quote_id: 'q1' } }))
    expect(body).toEqual({
      error: {
        code: 'QUOTE_EXPIRED',
        message: 'This quote has expired. Please request a new one.',
        details: { quote_id: 'q1' },
      },
    })
  })
})
