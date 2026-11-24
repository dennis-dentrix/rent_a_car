import { nairobiDate, nairobiDayRange } from '@rent-a-car/shared'
import { countRows } from '../lib/counts.js'
import { AppError } from '../lib/errors.js'
import { unwrap } from '../lib/supabase.js'
import { findOne, updateOne } from './records.js'

const COMPANY_COLUMNS =
  'id, business_name, slug, registration_number, kra_pin, address, phone, email, status, status_reason'

/** The company's own record, for its Company page. */
export const getCompany = ({ db }, operatorId) =>
  findOne(db, 'operators', COMPANY_COLUMNS, operatorId)

/** The company changes its contact and registration details; status and plan are not columns it may write. */
export const updateCompany = ({ db }, operatorId, input) =>
  updateOne(db, 'operators', COMPANY_COLUMNS, operatorId, input)

// Bookings of the company in one of the statuses whose start or end falls inside the day.
const bookingsMoving = (db, operatorId, { statuses, column, range: [from, to] }) =>
  countRows(db, 'bookings', (q) =>
    q.eq('operator_id', operatorId).in('status', statuses).gte(column, from).lt(column, to),
  )

// Active vehicles whose class has no rate of this company in force today: they cannot be priced for a request.
async function vehiclesWithoutRate(db, operatorId, today) {
  const [vehicles, rates] = await Promise.all([
    db.from('vehicles').select('class_id').eq('operator_id', operatorId).eq('status', 'active'),
    db
      .from('rates')
      .select('class_id')
      .eq('operator_id', operatorId)
      .lte('effective_from', today)
      .or(`effective_to.is.null,effective_to.gte.${today}`),
  ])
  const priced = new Set(unwrap(rates).map((row) => row.class_id))
  return unwrap(vehicles).filter((row) => !priced.has(row.class_id)).length
}

// How far the company has got with setting up: vehicles of any status, its own rates, and the services it offers.
async function setupCounts(db, operatorId) {
  const [vehiclesTotal, rates, services] = await Promise.all([
    countRows(db, 'vehicles', (q) => q.eq('operator_id', operatorId)),
    countRows(db, 'rates', (q) => q.eq('operator_id', operatorId)),
    countRows(db, 'operator_services', (q) => q.eq('operator_id', operatorId)),
  ])
  return { vehicles_total: vehiclesTotal, rates, services }
}

// The company's review state, and whether the details renters and admins look for are filled in.
const toCompany = ({
  business_name,
  status,
  status_reason,
  registration_number,
  kra_pin,
  address,
  phone,
}) => ({
  business_name,
  status,
  status_reason,
  is_complete: Boolean(registration_number && kra_pin && address && phone),
})

/** What the company needs to see first: its review status, today's movement, and what is not ready to rent. */
export async function getOperatorOverview({ db }, operatorId, now = new Date()) {
  const today = nairobiDate(now)
  const range = nairobiDayRange(today)
  const [company, vehicles, onHire, pickups, returns, unpriced, setup] = await Promise.all([
    findOne(
      db,
      'operators',
      'business_name, status, status_reason, registration_number, kra_pin, address, phone',
      operatorId,
    ),
    countRows(db, 'vehicles', (q) => q.eq('operator_id', operatorId).eq('status', 'active')),
    countRows(db, 'bookings', (q) => q.eq('operator_id', operatorId).eq('status', 'active')),
    bookingsMoving(db, operatorId, { statuses: ['confirmed', 'ready'], column: 'start_at', range }),
    bookingsMoving(db, operatorId, { statuses: ['active'], column: 'end_at', range }),
    vehiclesWithoutRate(db, operatorId, today),
    setupCounts(db, operatorId),
  ])
  return {
    today,
    company: toCompany(company),
    ...setup,
    vehicles,
    on_hire: onHire,
    pickups_today: pickups,
    returns_today: returns,
    vehicles_without_rate: unpriced,
  }
}

const AIRPORT_TYPES = ['airport', 'airstrip']

/** Carvo's airports and airstrips, each with whether this company serves it. Everything is served unless switched off. */
export async function listAirports({ db }, operatorId) {
  const [places, off] = await Promise.all([
    db
      .from('locations')
      .select('id, name, type, address')
      .is('operator_id', null)
      .eq('is_served', true)
      .in('type', AIRPORT_TYPES)
      .order('type')
      .order('name'),
    db.from('operator_excluded_locations').select('location_id').eq('operator_id', operatorId),
  ])
  const switchedOff = new Set(unwrap(off).map((row) => row.location_id))
  return unwrap(places).map((place) => ({ ...place, is_served: !switchedOff.has(place.id) }))
}

/** Serve or stop serving one of Carvo's airports or airstrips. Only those can be switched. */
export async function setAirportServed({ db }, operatorId, locationId, isServed) {
  const place = unwrap(
    await db
      .from('locations')
      .select('id')
      .eq('id', locationId)
      .is('operator_id', null)
      .in('type', AIRPORT_TYPES)
      .maybeSingle(),
  )
  if (!place) throw new AppError('NOT_FOUND')
  const query = db.from('operator_excluded_locations')
  unwrap(
    isServed
      ? await query.delete().eq('operator_id', operatorId).eq('location_id', locationId)
      : await query.upsert({ operator_id: operatorId, location_id: locationId }),
  )
  return { id: locationId, is_served: isServed }
}
