import { describe, expect, it } from 'vitest'
import {
  PENDING_EMAIL_COOKIE,
  clearPendingEmail,
  readPendingEmail,
  writePendingEmail,
} from './cookies.js'

// A stand-in for the cookie store of a server action.
function fakeStore() {
  const saved = new Map()
  return {
    saved,
    set: (name, value, options) => saved.set(name, { value, options }),
    get: (name) => saved.get(name),
    delete: (name) => saved.delete(name),
  }
}

describe('the address a sign-up code was sent to', () => {
  it('is kept out of reach of page scripts, only on the sign-in pages, and only for a short while', () => {
    const store = fakeStore()
    writePendingEmail(store, 'amina@example.com')
    const { options } = store.saved.get(PENDING_EMAIL_COOKIE)
    expect(options).toMatchObject({ httpOnly: true, sameSite: 'lax', path: '/auth', maxAge: 900 })
  })

  it('is read back, and gone once cleared', () => {
    const store = fakeStore()
    writePendingEmail(store, 'amina@example.com')
    expect(readPendingEmail(store)).toBe('amina@example.com')
    clearPendingEmail(store)
    expect(readPendingEmail(store)).toBeNull()
  })
})
