import { AppError } from '../lib/errors.js'
import { unwrap } from '../lib/supabase.js'
import { findOne } from './records.js'
import { convertFromKes, nairobiDate } from '@carvo/shared'

/**
 * The daily rates in force on a date, as a Map of class id to rate. One query for any number of classes;
 * the database allows only one rate per class and day, so each class has at most one row.
 */
export async function ratesOn(db, classIds, date) {
  const day = nairobiDate(date)
  const rows = unwrap(
    await db
      .from('rates')
      .select('class_id, price_kes, usd_override')
      .in('class_id', classIds)
      .eq('duration_type', 'day')
      // Renters are priced from Carvo's rates. An operator's own rates are not read here until request-and-accept
      // prices a booking from the operator (product pack section 25.9).
      .is('operator_id', null)
      .lte('effective_from', day)
      .or(`effective_to.is.null,effective_to.gte.${day}`),
  )
  return new Map(rows.map((row) => [row.class_id, row]))
}

/** The daily rate in force on a date, or null. */
export async function rateOn(db, classId, date) {
  return (await ratesOn(db, [classId], date)).get(classId) ?? null
}

/** KES-per-unit rate for a display currency, or null for KES. */
export async function exchangeRate(db, currency) {
  if (currency === 'KES') return null
  const row = unwrap(
    await db.from('exchange_rates').select('*').eq('currency', currency).maybeSingle(),
  )
  if (!row)
    throw new AppError('VALIDATION_FAILED', {
      message: `${currency} prices are not available yet.`,
    })
  return { currency, rateToKes: Number(row.rate_to_kes), rateDate: row.rate_date }
}

/** Display rates for every non-KES currency, keyed by currency, so the web app can offer a currency switch. */
export async function listDisplayRates(db) {
  const rows = unwrap(await db.from('exchange_rates').select('currency, rate_to_kes, rate_date'))
  return Object.fromEntries(
    rows.map((row) => [
      row.currency,
      { rate_to_kes: Number(row.rate_to_kes), rate_date: row.rate_date },
    ]),
  )
}

export async function availableCount(db, classId, startAt, endAt) {
  return unwrap(
    await db.rpc('available_vehicle_count', {
      p_class_id: classId,
      p_start: startAt,
      p_end: endAt,
    }),
  )
}

/** Free vehicles for the dates, as a Map of class id to count, for every public class in one call. */
async function availableCounts(db, startAt, endAt) {
  const rows = unwrap(await db.rpc('available_vehicle_counts', { p_start: startAt, p_end: endAt }))
  return new Map(rows.map((row) => [row.class_id, row.available_count]))
}

/** The daily price of the cheapest listed car of each class that has one, as a Map of class id to price. */
async function carPrices(db) {
  const rows = unwrap(await db.from('listed_class_prices').select('class_id, price_kes'))
  return new Map(rows.map((row) => [row.class_id, row.price_kes]))
}

const displayPrice = (kes, fx) => (fx ? convertFromKes(kes, fx.rateToKes) : kes)

// A pure shaping function: the price and count are looked up once for the whole list by the caller.
function toClassItem(cls, { priceKes = null, fx, availableCount }) {
  const item = {
    id: cls.id,
    name: cls.name,
    slug: cls.slug,
    seats: cls.seats,
    best_for: cls.best_for,
    price_per_day_kes: priceKes,
    price_per_day_display: priceKes === null ? null : displayPrice(priceKes, fx),
    display_currency: fx?.currency ?? 'KES',
    image_url: cls.photo_paths[0] ?? null,
  }
  if (availableCount !== undefined) item.available_count = availableCount
  return item
}

/** The public classes with price and, when dates are given, availability. A fixed number of queries, however many classes. */
export async function listClasses(db, { from, to, currency, service }) {
  const [fx, classes, offering] = await Promise.all([
    exchangeRate(db, currency),
    db.from('vehicle_classes').select('*').eq('is_public', true).order('sort_order'),
    service ? db.rpc('classes_offering_service', { p_service: service }) : null,
  ])
  // With a service chosen, keep only the classes some listed vehicle of an operator offering it belongs to.
  const offered = offering ? new Set(unwrap(offering).map((row) => row.class_id)) : null
  const list = unwrap(classes).filter((cls) => !offered || offered.has(cls.id))
  const [prices, counts] = await Promise.all([
    carPrices(db),
    from && to ? availableCounts(db, from, to) : null,
  ])
  return list.map((cls) =>
    toClassItem(cls, { priceKes: prices.get(cls.id), fx, availableCount: counts?.get(cls.id) }),
  )
}

/** A public vehicle class by id, or a NOT_FOUND error. */
export async function findPublicClass(db, id) {
  const cls = await findOne(db, 'vehicle_classes', '*', id)
  if (!cls.is_public) throw new AppError('NOT_FOUND')
  return cls
}

export async function getClass(db, id) {
  const cls = await findPublicClass(db, id)
  const item = toClassItem(cls, { priceKes: (await carPrices(db)).get(cls.id), fx: null })
  return {
    ...item,
    description: cls.description,
    luggage_capacity: cls.luggage_capacity,
    photos: cls.photo_paths,
    rating: null,
    review_count: 0,
  }
}

export async function listLocations(db) {
  return unwrap(
    await db
      .from('locations')
      .select('id, name, type, address, latitude, longitude, entrance_note, slug')
      .eq('is_served', true)
      .order('name'),
  )
}
