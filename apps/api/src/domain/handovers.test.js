import { describe, expect, it } from 'vitest'
import { dayOfHandovers } from './handovers.js'

const booking = (id, start, end, paid = 0) => ({
  id,
  start_at: start,
  end_at: end,
  total_kes: 10000,
  payments: [
    { status: 'succeeded', amount_kes: paid },
    { status: 'failed', amount_kes: 9999 },
  ],
})

describe("a company's day", () => {
  it('lists pickups and returns in time order and totals what pickups still owe', () => {
    const day = dayOfHandovers({
      pickups: [booking('late', '2027-03-01T15:00:00Z', '2027-03-04T15:00:00Z', 4000)],
      returns: [booking('early', '2027-02-26T07:00:00Z', '2027-03-01T07:00:00Z')],
    })
    expect(day.handovers.map((entry) => [entry.id, entry.kind])).toEqual([
      ['early', 'return'],
      ['late', 'pickup'],
    ])
    expect(day.to_collect_kes).toBe(6000)
  })
})
