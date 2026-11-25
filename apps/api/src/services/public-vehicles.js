import { listPage } from '../lib/pagination.js'
import { unwrap } from '../lib/supabase.js'
import { ratesOn } from './catalogue.js'
import { findOne } from './records.js'

const COLUMNS =
  'id, class_id, make, model, year, seats, luggage_capacity, transmission, fuel_type, drive_type, engine_cc, ' +
  'colour, description, features, chauffeur_option, photo_paths, operator_name, created_at'

// The class of each car on the page, and the daily price a renter of that class pays today. Two queries for any
// number of cars. A class that is not public is not named.
async function classesFor(db, cars, today) {
  const ids = [...new Set(cars.map((car) => car.class_id))]
  const [classes, rates] = await Promise.all([
    db.from('vehicle_classes').select('id, name, slug, seats').in('id', ids).eq('is_public', true),
    ratesOn(db, ids, today),
  ])
  return new Map(
    unwrap(classes).map((entry) => [
      entry.id,
      { ...entry, daily_rate_kes: rates.get(entry.id)?.price_kes ?? null },
    ]),
  )
}

// Each car with its class in place of the class id.
async function withClasses(db, cars, today) {
  const classes = await classesFor(db, cars, today)
  return cars.map(({ class_id: classId, ...car }) => ({
    ...car,
    class: classes.get(classId) ?? null,
  }))
}

/** The cars renters may see, newest first, each with its class and the class's daily price. */
export async function listPublicVehicles(db, { limit, cursor }, today = new Date()) {
  const page = await listPage(db.from('public_vehicles').select(COLUMNS), { limit, cursor })
  return { ...page, data: await withClasses(db, page.data, today) }
}

/** One car renters may see. A car that is not active, or whose company is not approved, is not found. */
export async function getPublicVehicle(db, id, today = new Date()) {
  const car = await findOne(db, 'public_vehicles', COLUMNS, id)
  const [shown] = await withClasses(db, [car], today)
  return shown
}
