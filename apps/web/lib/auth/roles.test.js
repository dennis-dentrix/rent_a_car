import { describe, expect, it } from 'vitest'
import { homeFor, isSecondFactorRequired, landingFor, needsSecondFactor } from './roles.js'

describe('needsSecondFactor', () => {
  it.each([
    ['staff', { role: 'staff' }, true],
    ['an admin', { role: 'admin' }, true],
    ['a customer', { role: 'customer' }, false],
    ['a customer who turned it on', { role: 'customer', has_second_factor: true }, true],
    ['a company person who did not', { role: 'operator', has_second_factor: false }, false],
    ['a company person who turned it on', { role: 'operator', has_second_factor: true }, true],
  ])('is decided for %s', (_name, profile, expected) => {
    expect(needsSecondFactor(profile)).toBe(expected)
  })
})

describe('homeFor', () => {
  it('sends each kind of person to their own area, and anyone else to the home page', () => {
    expect(['admin', 'customer', 'operator', 'staff'].map(homeFor)).toEqual([
      '/admin',
      '/account',
      '/console',
      '/',
    ])
  })
})

describe('isSecondFactorRequired', () => {
  it('is for staff and admin only', () => {
    expect(['staff', 'admin', 'customer', 'operator'].map(isSecondFactorRequired)).toEqual([
      true,
      true,
      false,
      false,
    ])
  })
})

describe('where a person lands after signing in', () => {
  it('is the page they asked for, or their own area', () => {
    expect(landingFor('customer', '/cars/suv')).toBe('/cars/suv')
    expect(landingFor('customer', '')).toBe('/account')
  })

  it('is always the dashboard for a rental company, unless a page inside it was asked for', () => {
    expect(landingFor('operator', '/cars')).toBe('/console')
    expect(landingFor('operator', '/console/bookings/1')).toBe('/console/bookings/1')
    expect(landingFor('operator', '/consolex')).toBe('/console')
  })
})
