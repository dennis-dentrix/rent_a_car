import { describe, expect, it } from 'vitest'
import { buildEnquiry, enquiryErrors } from './enquiry.js'

const text = { nameError: 'name', emailError: 'email', messageError: 'message' }
const filled = { name: ' Amina ', email: ' amina@example.com ', message: ' Is it free? ' }

describe('buildEnquiry', () => {
  it('trims what was typed and attaches the car type only when there is one', () => {
    expect(buildEnquiry(filled)).toEqual({
      name: 'Amina',
      email: 'amina@example.com',
      message: 'Is it free?',
    })
    expect(buildEnquiry({ ...filled, classId: 'abc' }).class_id).toBe('abc')
  })
})

describe('enquiryErrors', () => {
  it('finds nothing wrong with a complete form', () => {
    expect(enquiryErrors(filled, text)).toEqual({})
  })

  it('names each field that is empty or malformed', () => {
    const errors = enquiryErrors({ name: 'A', email: 'not-an-email', message: '  ' }, text)
    expect(Object.keys(errors).sort()).toEqual(['email', 'message', 'name'])
  })
})
