import { describe, expect, it } from 'vitest'
import { allowsContentType, inspectionPurpose } from './file-purposes.js'

describe('which file types a purpose accepts', () => {
  it.each([
    ['inspection_photo', 'image/jpeg', true],
    ['inspection_photo', 'image/png', true],
    ['inspection_photo', 'application/pdf', false],
    ['inspection_document', 'application/pdf', true],
    ['inspection_document', 'image/jpeg', false],
    ['national_id', 'application/pdf', true],
    ['national_id', 'image/gif', false],
    ['blog_image', 'image/webp', true],
    ['blog_image', 'image/svg+xml', false],
    ['unknown_purpose', 'image/png', false],
  ])('%s with %s is %s', (purpose, contentType, expected) => {
    expect(allowsContentType(purpose, contentType)).toBe(expected)
  })

  it('maps an inspection file kind to its purpose', () => {
    expect([inspectionPurpose('photo'), inspectionPurpose('document')]).toEqual([
      'inspection_photo',
      'inspection_document',
    ])
  })
})
