import { describe, expect, it } from 'vitest'
import { initialsOf } from './avatar.js'

describe('initialsOf', () => {
  it('takes the first letters of up to two words, in capitals', () => {
    expect(initialsOf('wanjiru kamau')).toBe('WK')
    expect(initialsOf('Amina Wanjiru Otieno')).toBe('AW')
    expect(initialsOf('  Madonna ')).toBe('M')
  })

  it('gives nothing for no name', () => {
    expect(initialsOf('')).toBe('')
    expect(initialsOf(undefined)).toBe('')
  })
})
