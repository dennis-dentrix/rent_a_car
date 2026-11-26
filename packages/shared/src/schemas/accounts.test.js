import { isSecondFactorPaused } from '../second-factor.js'
import { describe, expect, it } from 'vitest'
import {
  authCodeSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  signUpSchema,
} from './accounts.js'

const signUp = {
  full_name: 'Amina Otieno',
  email: 'amina@example.com',
  password: 'longenough1',
  confirm_password: 'longenough1',
}

describe('the sign-in forms', () => {
  it('accepts a sign-up with a name, an email, and a password of 8 to 72 characters', () => {
    expect(signUpSchema.safeParse(signUp).success).toBe(true)
    expect(resetPasswordSchema.safeParse({ password: 'x'.repeat(72) }).success).toBe(true)
  })

  it.each([
    ['a short password', { ...signUp, password: 'short', confirm_password: 'short' }, 'password'],
    [
      'a confirmation that differs',
      { ...signUp, confirm_password: 'longenough2' },
      'confirm_password',
    ],
    [
      'a password past 72 characters',
      { ...signUp, password: 'x'.repeat(73), confirm_password: 'x'.repeat(73) },
      'password',
    ],
    ['a one-letter name', { ...signUp, full_name: 'A' }, 'full_name'],
    ['an address with no @', { ...signUp, email: 'amina.example.com' }, 'email'],
  ])('refuses %s, naming the field', (_name, input, field) => {
    const result = signUpSchema.safeParse(input)
    expect(result.error?.issues[0].path).toEqual([field])
  })

  it('refuses a role in the sign-up, because the database makes every sign-up a customer', () => {
    expect(signUpSchema.safeParse({ ...signUp, role: 'admin' }).success).toBe(false)
  })

  it('asks for only an email to send a reset link', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'a@example.com' }).success).toBe(true)
    expect(forgotPasswordSchema.safeParse({}).success).toBe(false)
  })

  it('takes a six-digit code with or without a space, and nothing else', () => {
    expect(authCodeSchema.parse({ code: '123 456' }).code).toBe('123456')
    expect(authCodeSchema.safeParse({ code: '12345' }).success).toBe(false)
    expect(authCodeSchema.safeParse({ code: '12345a' }).success).toBe(false)
  })
})

describe('pausing the authenticator code', () => {
  it('needs the switch, and never works in production', () => {
    expect(isSecondFactorPaused({ PAUSE_SECOND_FACTOR: 'true' })).toBe(true)
    expect(isSecondFactorPaused({})).toBe(false)
    expect(isSecondFactorPaused({ PAUSE_SECOND_FACTOR: 'true', NODE_ENV: 'production' })).toBe(
      false,
    )
  })
})
