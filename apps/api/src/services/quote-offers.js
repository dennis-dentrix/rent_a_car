import { AppError, fieldError } from '../lib/errors.js'
import { unwrap } from '../lib/supabase.js'
import { nairobiDate } from '@carvo/shared'
import { availableCount, findPublicClass, rateOn } from './catalogue.js'
import { chauffeurDailyKes, discountsForCar } from './pricing.js'
import { findOne } from './records.js'

// What a quote is for, one car or any car of a class: its class, its daily price, the discounts that may apply,
// and whether it is free for the dates.

async function loadDiscounts(db, classId, day) {
  return unwrap(
    await db
      .from('discounts')
      .select('*')
      .eq('is_active', true)
      .lte('effective_from', day)
      .or(`effective_to.is.null,effective_to.gte.${day}`)
      .or(`class_id.is.null,class_id.eq.${classId}`),
  )
}

// Listed means an active car of an approved company with a price of its own.
async function findListedCar(db, id) {
  const car = unwrap(
    await db
      .from('vehicles')
      .select(
        'id, class_id, daily_rate_kes, chauffeur_option, chauffeur_daily_kes, operator:operators!inner(status)',
      )
      .eq('id', id)
      .eq('status', 'active')
      .eq('operator.status', 'approved')
      .not('daily_rate_kes', 'is', null)
      .maybeSingle(),
  )
  if (!car) throw new AppError('NOT_FOUND', { message: 'That car is not available to book.' })
  return car
}

// The chauffeur is charged by the day, like an extra.
function chauffeurExtras(car, wantsChauffeur) {
  const dailyKes = chauffeurDailyKes(car, wantsChauffeur)
  if (dailyKes === null) {
    throw fieldError('with_chauffeur', 'This car is not offered with a chauffeur.')
  }
  return dailyKes ? [{ name: 'Chauffeur', price_kes: dailyKes, pricing_type: 'per_day' }] : []
}

async function carOffer(db, { vehicle_id, with_chauffeur, start_at, end_at }) {
  const car = await findListedCar(db, vehicle_id)
  const included = chauffeurExtras(car, with_chauffeur)
  const [cls, discounts, isBooked] = await Promise.all([
    findOne(db, 'vehicle_classes', '*', car.class_id),
    loadDiscounts(db, car.class_id, nairobiDate(start_at)),
    db
      .rpc('vehicle_is_booked', { p_vehicle_id: car.id, p_start: start_at, p_end: end_at })
      .then(unwrap),
  ])
  return {
    cls,
    dailyRateKes: car.daily_rate_kes,
    included,
    discounts: discountsForCar(discounts),
    isAvailable: !isBooked,
  }
}

async function classOffer(db, { class_id, start_at, end_at }) {
  const cls = await findPublicClass(db, class_id)
  const rate = await rateOn(db, cls.id, start_at)
  if (!rate) throw new AppError('NOT_FOUND', { message: 'No rate is set for those dates.' })
  const [discounts, count] = await Promise.all([
    loadDiscounts(db, cls.id, nairobiDate(start_at)),
    availableCount(db, cls.id, start_at, end_at),
  ])
  return { cls, dailyRateKes: rate.price_kes, included: [], discounts, isAvailable: count > 0 }
}

/** The offer behind a quote request, which names either a car or a class. */
export const findOffer = (db, input) =>
  input.vehicle_id ? carOffer(db, input) : classOffer(db, input)
