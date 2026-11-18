import { describe, expect, it } from 'vitest'
import { createEnquirySchema, createStaffEnquirySchema, e164Phone } from './index.js'

describe('phone numbers', () => {
  it.each([
    ['+254712345678', '+254712345678'],
    ['+44 20 7946 0958', '+442079460958'],
    ['+1 (415) 555-0132', '+14155550132'],
    ['0049 30 901820', '+4930901820'],
  ])('accepts %s from any country', (input, expected) => {
    expect(e164Phone.parse(input)).toBe(expected)
  })

  it.each(['0712345678', '+0123456789', '+12', 'call me', ''])('refuses %s', (input) => {
    expect(e164Phone.safeParse(input).success).toBe(false)
  })
})

describe('enquiries', () => {
  const visitor = { name: 'Amina', email: 'amina@example.test' }

  it('needs an email on the website form, and the phone is optional', () => {
    expect(createEnquirySchema.safeParse(visitor).success).toBe(true)
    expect(createEnquirySchema.safeParse({ name: 'Amina', phone: '+254712345678' }).success).toBe(
      false,
    )
  })

  it('lets staff log an enquiry with a phone or an email, but not neither', () => {
    const source = 'whatsapp'
    expect(
      createStaffEnquirySchema.safeParse({ name: 'Amina', phone: '+254712345678', source }).success,
    ).toBe(true)
    expect(createStaffEnquirySchema.safeParse({ ...visitor, source }).success).toBe(true)
    expect(createStaffEnquirySchema.safeParse({ name: 'Amina', source }).success).toBe(false)
  })
})
