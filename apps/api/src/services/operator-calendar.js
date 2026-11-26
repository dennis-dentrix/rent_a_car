import { nairobiDayRange } from '@carvo/shared'
import { AppError } from '../lib/errors.js'
import { unwrap } from '../lib/supabase.js'
import { HOLDING_STATUSES } from '../domain/booking-status.js'
import { insertOne } from './records.js'

// When each of a company's cars is booked or blocked, and blocking dates for hires made elsewhere.
const BLOCK_COLUMNS = 'id, vehicle_id, start_at, end_at, note, created_at'
const DAYS = 14
const DAY_MS = 24 * 60 * 60 * 1000

/** The company's cars, with every booking and block that touches the two weeks starting on `from`. */
export async function getCalendar({ db }, operatorId, from) {
  const start = nairobiDayRange(from)[0]
  const end = new Date(new Date(start).getTime() + DAYS * DAY_MS).toISOString()
  const overlapping = (query) => query.lt('start_at', end).gt('end_at', start)
  const [vehicles, bookings, blocks] = await Promise.all([
    db
      .from('vehicles')
      .select('id, make, model, registration')
      .eq('operator_id', operatorId)
      .neq('status', 'retired')
      .order('registration'),
    overlapping(
      db
        .from('bookings')
        .select('id, vehicle_id, start_at, end_at')
        .eq('operator_id', operatorId)
        .in('status', HOLDING_STATUSES),
    ),
    overlapping(db.from('vehicle_blocks').select(BLOCK_COLUMNS)),
  ])
  return {
    from,
    days: DAYS,
    vehicles: unwrap(vehicles),
    bookings: unwrap(bookings),
    blocks: unwrap(blocks),
  }
}

/** Blocks a car from the start of the first day to the end of the last. Refused where it is already booked. */
export async function blockDates({ db }, { vehicle_id: vehicleId, start_date, end_date, note }) {
  return insertOne(db, 'vehicle_blocks', BLOCK_COLUMNS, {
    vehicle_id: vehicleId,
    start_at: nairobiDayRange(start_date)[0],
    end_at: nairobiDayRange(end_date)[1],
    note: note ?? null,
  })
}

export async function removeBlock({ db }, id) {
  const [removed] = unwrap(await db.from('vehicle_blocks').delete().eq('id', id).select('id'))
  if (!removed) throw new AppError('NOT_FOUND')
  return removed
}
