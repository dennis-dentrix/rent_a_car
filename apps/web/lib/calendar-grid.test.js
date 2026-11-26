import { describe, expect, it } from 'vitest'
import { calendarRows } from './calendar-grid.js'

const period = (start, end) => ({
  vehicle_id: 'a',
  start_at: `${start}+03:00`,
  end_at: `${end}+03:00`,
})

describe("a company's calendar", () => {
  it('marks each Nairobi day a car is booked or blocked, and no day it only ends at midnight', () => {
    const [row] = calendarRows({
      from: '2027-03-01',
      days: 4,
      vehicles: [{ id: 'a' }],
      bookings: [period('2027-03-01T09:00:00', '2027-03-02T09:00:00')],
      blocks: [period('2027-03-03T00:00:00', '2027-03-04T00:00:00')],
    })
    expect(row.cells.map((cell) => cell.state)).toEqual(['booked', 'booked', 'blocked', 'free'])
  })
})
