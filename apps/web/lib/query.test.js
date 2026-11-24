import { describe, expect, it } from 'vitest'
import { withParams } from './query.js'

describe('withParams', () => {
  it('builds a query string and skips empty values', () => {
    expect(withParams('/cars', { start: '2026-11-20', end: '', tag: null })).toBe(
      '/cars?start=2026-11-20',
    )
  })

  it('returns the bare path when nothing is set', () => {
    expect(withParams('/cars', { start: undefined })).toBe('/cars')
  })
})
