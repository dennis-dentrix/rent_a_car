import { readFileSync, readdirSync } from 'node:fs'
import { BOOKING_STATUSES as SHARED_STATUSES } from '@carvo/shared'
import { describe, expect, it } from 'vitest'
import { TRANSITIONS, assertTransition, canTransition } from './booking-status.js'

// Every migration that adds allowed moves, together.
const MIGRATIONS = new URL('../../../../supabase/migrations/', import.meta.url)
const sqlPairs = () => {
  const sql = readdirSync(MIGRATIONS)
    .map((name) => readFileSync(new URL(name, MIGRATIONS), 'utf8'))
    .join('\n')
  const blocks = sql.match(/insert into booking_status_transitions[\s\S]*?;/g)
  return [...blocks.join('').matchAll(/\('(\w+)', '(\w+)'\)/g)].map(([, f, to]) => `${f}>${to}`)
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

  it('matches the table in the database migrations', () => {
    const fromCode = Object.entries(TRANSITIONS).flatMap(([from, tos]) =>
      tos.map((to) => `${from}>${to}`),
    )
    expect(sqlPairs().sort()).toEqual(fromCode.sort())
  })
})
