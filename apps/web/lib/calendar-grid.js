import { nairobiDayRange } from '@carvo/shared'
import { addDays } from '@/lib/calendar'

export const calendarDays = (from, count) =>
  Array.from({ length: count }, (_, index) => addDays(from, index))

// Whether any of the periods covers part of the Nairobi day.
const touches = (periods, day) => {
  const [start, end] = nairobiDayRange(day).map((instant) => Date.parse(instant))
  return periods.some(
    (period) => Date.parse(period.start_at) < end && Date.parse(period.end_at) > start,
  )
}

const stateOn = (day, booked, blocked) => {
  if (touches(booked, day)) return 'booked'
  return touches(blocked, day) ? 'blocked' : 'free'
}

/** One row for each car: its state on each day of the calendar. */
export function calendarRows({ from, days, vehicles, bookings, blocks }) {
  return vehicles.map((car) => {
    const ofCar = (periods) => periods.filter((period) => period.vehicle_id === car.id)
    const [booked, blocked] = [ofCar(bookings), ofCar(blocks)]
    return {
      ...car,
      cells: calendarDays(from, days).map((day) => ({
        day,
        state: stateOn(day, booked, blocked),
      })),
    }
  })
}
