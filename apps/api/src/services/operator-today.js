import { nairobiDayRange } from '@carvo/shared'
import { unwrap } from '../lib/supabase.js'
import { dayOfHandovers } from '../domain/handovers.js'

// The company's Today page: requests waiting for an answer, and the cars changing hands today.
const MOVING =
  'id, status, start_at, end_at, total_kes, customer:profiles(full_name), vehicle:vehicles(make, model), ' +
  'payments(amount_kes, status)'
const ASKING =
  'id, start_at, end_at, total_kes, pickup_place, destination, hold_expires_at, ' +
  'customer:profiles(full_name), vehicle:vehicles(make, model)'
const SHOWN = 50

const ofCompany = (db, operatorId, columns) =>
  db.from('bookings').select(columns).eq('operator_id', operatorId)

const movingOn = (db, operatorId, { statuses, column, range: [from, to] }) =>
  ofCompany(db, operatorId, MOVING)
    .in('status', statuses)
    .gte(column, from)
    .lt(column, to)
    .limit(SHOWN)

const waitingRequests = (db, operatorId) =>
  ofCompany(db, operatorId, ASKING)
    .eq('status', 'requested')
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(SHOWN)

const toRequest = ({ customer, vehicle, hold_expires_at: answerBy, ...booking }) => ({
  ...booking,
  answer_by: answerBy,
  renter: customer?.full_name ?? null,
  car: vehicle,
})

export async function getToday({ db }, operatorId, today) {
  const range = nairobiDayRange(today)
  const [requests, pickups, returns] = await Promise.all([
    waitingRequests(db, operatorId),
    movingOn(db, operatorId, { statuses: ['confirmed', 'ready'], column: 'start_at', range }),
    movingOn(db, operatorId, { statuses: ['active'], column: 'end_at', range }),
  ])
  return {
    requests: unwrap(requests).map(toRequest),
    ...dayOfHandovers({ pickups: unwrap(pickups), returns: unwrap(returns) }),
  }
}
