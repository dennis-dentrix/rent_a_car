import { nairobiDate } from '@carvo/shared'
import { countRows } from '../lib/counts.js'
import { AppError } from '../lib/errors.js'
import { unwrap } from '../lib/supabase.js'
import { getToday } from './operator-today.js'
import { findOne, updateOne } from './records.js'

const COMPANY_COLUMNS =
  'id, business_name, slug, registration_number, kra_pin, address, phone, email, status, status_reason, ' +
  'offers_dropoff, offers_pickup'

/** The company's own record, for its Company page. */
export const getCompany = ({ db }, operatorId) =>
  findOne(db, 'operators', COMPANY_COLUMNS, operatorId)

/** The company changes its contact and registration details; status and plan are not columns it may write. */
export const updateCompany = ({ db }, operatorId, input) =>
  updateOne(db, 'operators', COMPANY_COLUMNS, operatorId, input)

// Active cars with no daily price: renters cannot book them.
const vehiclesWithoutRate = (db, operatorId) =>
  countRows(db, 'vehicles', (q) =>
    q.eq('operator_id', operatorId).eq('status', 'active').is('daily_rate_kes', null),
  )

// How far the company has got with setting up: vehicles of any status, and the services it offers.
async function setupCounts(db, operatorId) {
  const [vehiclesTotal, services] = await Promise.all([
    countRows(db, 'vehicles', (q) => q.eq('operator_id', operatorId)),
    countRows(db, 'operator_services', (q) => q.eq('operator_id', operatorId)),
  ])
  return { vehicles_total: vehiclesTotal, services }
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
  const [company, vehicles, onHire, day, unpriced, setup] = await Promise.all([
    findOne(
      db,
      'operators',
      'business_name, status, status_reason, registration_number, kra_pin, address, phone',
      operatorId,
    ),
    countRows(db, 'vehicles', (q) => q.eq('operator_id', operatorId).eq('status', 'active')),
    countRows(db, 'bookings', (q) => q.eq('operator_id', operatorId).eq('status', 'active')),
    getToday({ db }, operatorId, today),
    vehiclesWithoutRate(db, operatorId),
    setupCounts(db, operatorId),
  ])
  return {
    today,
    company: toCompany(company),
    ...setup,
    vehicles,
    on_hire: onHire,
    ...day,
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
