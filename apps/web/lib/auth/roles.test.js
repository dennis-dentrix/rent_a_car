import { describe, expect, it } from 'vitest'
import { homeFor, isSecondFactorRequired, needsSecondFactor } from './roles.js'

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
