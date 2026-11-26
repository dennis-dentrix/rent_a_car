import { listPage } from '../lib/pagination.js'
import { unwrap, withServiceRole } from '../lib/supabase.js'
import { calculateStay } from './pricing.js'
import { findOne } from './records.js'

const COLUMNS =
  'id, class_id, make, model, year, seats, luggage_capacity, transmission, fuel_type, drive_type, engine_cc, ' +
  'colour, description, features, chauffeur_option, photo_paths, operator_name, daily_rate_kes, chauffeur_daily_kes, ' +
  'booking_mode, offers_dropoff, offers_pickup, created_at'

// Each car with its class in place of the class id. One query for any number of cars; a class that is not public is
// not named.
async function withClasses(db, cars) {
  const ids = [...new Set(cars.map((car) => car.class_id))]
  const found = unwrap(
    await db
      .from('vehicle_classes')
      .select('id, name, slug, seats')
      .in('id', ids)
      .eq('is_public', true),
  )
  const classes = new Map(found.map((entry) => [entry.id, entry]))
  return cars.map(({ class_id: classId, ...car }) => ({
    ...car,
    class: classes.get(classId) ?? null,
  }))
}

// Settings are not readable by guests, so this one rule is read for them.
const minimumHire = () =>
  withServiceRole('read_minimum_hire', async (admin) =>
    unwrap(await admin.from('settings').select('value').eq('key', 'minimum_hire_days').single()),
  )

// With dates, each car carries what the stay costs. One that cannot be hired the chosen way carries no total.
async function withStayTotals(cars, { from, to, with_chauffeur: withChauffeur }) {
  const { value: minimumDays } = await minimumHire()
  const stay = { startAt: from, endAt: to, minimumDays, withChauffeur }
  return cars.map((car) => ({ ...car, ...calculateStay(car, stay) }))
}

/** The cars renters may see, newest first. With dates, only the free ones, each with its total for the stay. */
export async function listPublicVehicles(db, { limit, cursor, ...stay }) {
  const cars = stay.from
    ? db.rpc('free_cars', { p_start: stay.from, p_end: stay.to }).select(COLUMNS)
    : db.from('public_vehicles').select(COLUMNS)
  const page = await listPage(cars, { limit, cursor })
  const shown = await withClasses(db, page.data)
  return { ...page, data: stay.from ? await withStayTotals(shown, stay) : shown }
}

const isFree = async (db, id, { from, to }) =>
  !unwrap(await db.rpc('vehicle_is_booked', { p_vehicle_id: id, p_start: from, p_end: to }))

/** One car renters may see, with its stay when dates are given. A car that is not listed is not found. */
export async function getPublicVehicle(db, id, stay) {
  const [car] = await withClasses(db, [await findOne(db, 'public_vehicles', COLUMNS, id)])
  if (!stay.from) return car
  const [[priced], free] = await Promise.all([withStayTotals([car], stay), isFree(db, id, stay)])
  return { ...priced, is_free: free }
}
