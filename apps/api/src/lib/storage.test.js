import { describe, expect, it } from 'vitest'
import { documentKey, inspectionKey } from './storage.js'

describe('storage keys', () => {
  it('keeps a customer document under that customer', () => {
    expect(documentKey('owner-1', 'doc-1', 'application/pdf')).toBe('documents/owner-1/doc-1.pdf')
  })

  it('keeps an inspection file under its booking', () => {
    expect(inspectionKey('booking-1', 'file-1', 'image/jpeg')).toBe(
      'inspections/booking-1/file-1.jpg',
    )
  })

  it('picks the file extension from the declared type', () => {
    expect(documentKey('o', 'd', 'image/png')).toMatch(/\.png$/)
  })
})
