import { AppError } from '../lib/errors.js'
import { unwrap } from '../lib/supabase.js'
import { convertFromKes, nairobiDate } from '@rent-a-car/shared'

/** The daily rate in force on a date, or null. */
export async function rateOn(db, classId, date) {
  const day = nairobiDate(date)
  const rows = unwrap(
    await db
      .from('rates')
      .select('price_kes, usd_override')
      .eq('class_id', classId)
      .eq('duration_type', 'day')
      .lte('effective_from', day)
      .or(`effective_to.is.null,effective_to.gte.${day}`)
      .limit(1),
  )
  return rows[0] ?? null
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

const displayPrice = (kes, fx) => (fx ? convertFromKes(kes, fx.rateToKes) : kes)

async function toClassItem(db, cls, { from, to, fx }) {
  const rate = await rateOn(db, cls.id, from ?? new Date())
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
  if (from && to) item.available_count = await availableCount(db, cls.id, from, to)
  return item
}

export async function listClasses(db, { from, to, currency }) {
  const fx = await exchangeRate(db, currency)
  const classes = unwrap(
    await db.from('vehicle_classes').select('*').eq('is_public', true).order('sort_order'),
  )
  return Promise.all(classes.map((cls) => toClassItem(db, cls, { from, to, fx })))
}

/** A public vehicle class by id, or a NOT_FOUND error. */
export async function findPublicClass(db, id) {
  const cls = unwrap(await db.from('vehicle_classes').select('*').eq('id', id).maybeSingle())
  if (!cls || !cls.is_public) throw new AppError('NOT_FOUND')
  return cls
}

export async function getClass(db, id) {
  const cls = await findPublicClass(db, id)
  const item = await toClassItem(db, cls, { fx: null })
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
