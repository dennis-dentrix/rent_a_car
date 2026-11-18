import { readFileSync } from 'node:fs'
import { BOOKING_STATUSES as SHARED_STATUSES } from '@rent-a-car/shared'
import { describe, expect, it } from 'vitest'
import { TRANSITIONS, assertTransition, canTransition } from './booking-status.js'

const sqlPairs = () => {
  const sql = readFileSync(
    new URL('../../../../supabase/migrations/20261115000003_bookings.sql', import.meta.url),
    'utf8',
  )
  const block = sql.match(/insert into booking_status_transitions[\s\S]*?;/)[0]
  return [...block.matchAll(/\('(\w+)', '(\w+)'\)/g)].map(([, from, to]) => `${from}>${to}`)
}

describe('booking status transitions', () => {
  it('covers exactly the statuses the shared package lists', () => {
    expect(Object.keys(TRANSITIONS).sort()).toEqual([...SHARED_STATUSES].sort())
  })

  it('allows a paid booking to be confirmed', () => {
    expect(canTransition('pending_payment', 'confirmed')).toBe(true)
  })

  it('lets an unpaid held booking expire', () => {
    expect(canTransition('pending_payment', 'expired')).toBe(true)
  })

  it('rejects skipping from confirmed to active', () => {
    expect(() => assertTransition('confirmed', 'active')).toThrow(/not allowed/)
  })

  it('has no moves out of the final statuses', () => {
    expect([TRANSITIONS.closed, TRANSITIONS.cancelled, TRANSITIONS.expired]).toEqual([[], [], []])
  })

  it('matches the table in the database migration', () => {
    const fromCode = Object.entries(TRANSITIONS).flatMap(([from, tos]) =>
      tos.map((to) => `${from}>${to}`),
    )
    expect(sqlPairs().sort()).toEqual(fromCode.sort())
  })
})
