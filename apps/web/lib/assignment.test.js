import { describe, expect, it } from 'vitest'
import { driverOptions, needsAssignment } from './assignment'

const booking = (over) => ({
  status: 'confirmed',
  vehicle: { id: 'v1' },
  handover: { type: 'office' },
  ...over,
})

describe('putting a car and driver on a booking', () => {
  it('is offered for a delivery that has a car, so its driver can be set', () => {
    expect(needsAssignment(booking({ handover: { type: 'delivery' } }))).toBe(true)
  })

  it('is offered for a booking with no car, and not for an office pickup that has one', () => {
    expect([needsAssignment(booking({ vehicle: null })), needsAssignment(booking())]).toEqual([
      true,
      false,
    ])
  })

  it('is not offered once the trip has started', () => {
    expect(needsAssignment(booking({ status: 'active', vehicle: null }))).toBe(false)
  })

  it('offers only drivers who are switched on', () => {
    const drivers = [
      { id: 'd1', name: 'Asha', phone: '+254700000001', is_active: true },
      { id: 'd2', name: 'Ben', phone: '+254700000002', is_active: false },
    ]
    expect(driverOptions(drivers)).toEqual([{ id: 'd1', label: 'Asha · +254700000001' }])
  })
})
