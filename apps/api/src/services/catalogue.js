import { AppError } from '../lib/errors.js'
import { unwrap } from '../lib/supabase.js'
import { findOne } from './records.js'
import { convertFromKes, nairobiDate } from '@rent-a-car/shared'

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

const displayPrice = (kes, fx) => (fx ? convertFromKes(kes, fx.rateToKes) : kes)

// A pure shaping function: the rate and count are looked up once for the whole list by the caller.
function toClassItem(cls, { rate, fx, availableCount }) {
  const priceKes = rate?.price_kes ?? null
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
export async function listClasses(db, { from, to, currency }) {
  const [fx, classes] = await Promise.all([
    exchangeRate(db, currency),
    db.from('vehicle_classes').select('*').eq('is_public', true).order('sort_order'),
  ])
  const list = unwrap(classes)
  const [rates, counts] = await Promise.all([
    ratesOn(
      db,
      list.map((cls) => cls.id),
      from ?? new Date(),
    ),
    from && to ? availableCounts(db, from, to) : null,
  ])
  return list.map((cls) =>
    toClassItem(cls, { rate: rates.get(cls.id), fx, availableCount: counts?.get(cls.id) }),
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
  const item = toClassItem(cls, { rate: await rateOn(db, cls.id, new Date()), fx: null })
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
