import { redirect } from 'next/navigation'
import { describe, expect, it } from 'vitest'
import { attempt } from './attempt.js'

const lost = () => Promise.reject(new TypeError('Failed to fetch'))

describe('a call to the server that may not get through', () => {
  it('gives the answer when there is one', async () => {
    expect(await attempt(async () => ({ ok: true }))).toEqual({ ok: true })
  })

  it('answers with a plain message, or what the caller asks for, instead of throwing', async () => {
    expect(await attempt(lost)).toEqual({ error: expect.stringContaining('connection') })
    expect(await attempt(lost, false)).toBe(false)
  })

  it('lets a redirect through, so the page still moves on', async () => {
    await expect(attempt(async () => redirect('/auth'))).rejects.toThrow('NEXT_REDIRECT')
  })
})
