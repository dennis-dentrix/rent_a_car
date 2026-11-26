import { describe, expect, it } from 'vitest'
import { bookingBody, bookingErrors, quoteBody, typedValues } from './booking-request.js'
import { formDataFrom } from './form-data.js'

const typed = {
  full_name: 'Test Renter',
  phone: '+254700000001',
  date_of_birth: '1990-05-01',
  destination: 'Naivasha',
  pickup_place: 'Nairobi',
}
const EMAIL = 'renter@example.test'

describe('what the confirm step checks before booking', () => {
  it('accepts complete details', () => {
    expect(bookingErrors(typedValues(formDataFrom(typed)), EMAIL)).toBeNull()
  })

  it('needs to know where the renter takes the car from', () => {
    expect(bookingErrors({ ...typed, pickup_place: '' }, EMAIL)).toHaveProperty('pickup_place')
  })

  it('asks for drop-off or pick-up only when ticked', () => {
    const values = typedValues(formDataFrom({ ...typed, wants_dropoff: 'on' }))
    const body = bookingBody({ values, email: EMAIL, quoteId: 'q' })
    expect([body.wants_dropoff, body.wants_pickup]).toEqual([true, undefined])
  })

  it('names each detail that is missing or wrong', () => {
    const errors = bookingErrors({ ...typed, phone: '0700', date_of_birth: '' }, EMAIL)
    expect(Object.keys(errors).sort()).toEqual(['date_of_birth', 'phone'])
  })

  it('asks for a chauffeur only when the stay has one', () => {
    expect(quoteBody(formDataFrom({ car_id: 'c', with_chauffeur: '' }))).not.toHaveProperty(
      'with_chauffeur',
    )
  })
})
