import {
  createClassSchema,
  createDiscountSchema,
  createExtraSchema,
  createLocationSchema,
  createRateSchema,
  createZoneSchema,
  exchangeRateSchema,
  SETTING_SCHEMAS,
  updateClassSchema,
  updateDiscountSchema,
  updateExtraSchema,
  updateLocationSchema,
  updateRateSchema,
  updateZoneSchema,
} from '@carvo/shared'
import { AppError } from '../lib/errors.js'
import { unwrap } from '../lib/supabase.js'
import { resource } from './resources.js'

// The tables an admin fills in to run the business. Row Level Security lets only an admin write them, and the
// database keeps the audit trail.
export const ADMIN_RESOURCES = {
  classes: resource(
    'vehicle_classes',
    'name, slug, seats, luggage_capacity, description, best_for, is_public, sort_order, ' +
      'security_deposit_enabled, security_deposit_kes',
    { create: createClassSchema, update: updateClassSchema },
  ),
  locations: resource(
    'locations',
    'name, type, address, slug, latitude, longitude, entrance_note, is_served',
    { create: createLocationSchema, update: updateLocationSchema },
  ),
  'delivery-zones': resource('delivery_zones', 'name, fee_kes, is_active', {
    create: createZoneSchema,
    update: updateZoneSchema,
  }),
  extras: resource('extras', 'name, price_kes, pricing_type, is_active', {
    create: createExtraSchema,
    update: updateExtraSchema,
  }),
  rates: resource('rates', 'class_id, price_kes, usd_override, effective_from, effective_to', {
    create: createRateSchema,
    update: updateRateSchema,
    // An operator's own rates are not Carvo's rate table.
    scope: (query) => query.is('operator_id', null),
  }),
  discounts: resource(
    'discounts',
    'class_id, label, min_days, kind, value, effective_from, effective_to, is_active',
    { create: createDiscountSchema, update: updateDiscountSchema },
  ),
}

const SETTING_COLUMNS = 'key, value, updated_by, updated_at'

export async function listSettings(db) {
  const rows = unwrap(await db.from('settings').select(SETTING_COLUMNS).order('key'))
  return rows.filter((row) => row.key in SETTING_SCHEMAS)
}

/** Change one setting. The value must be the kind that setting takes (a percent, a number of hours, on or off). */
export async function updateSetting({ db, user }, key, value) {
  const schema = SETTING_SCHEMAS[key]
  if (!schema) throw new AppError('NOT_FOUND')
  const row = unwrap(
    await db
      .from('settings')
      .update({ value: schema.parse(value), updated_by: user.id })
      .eq('key', key)
      .select(SETTING_COLUMNS)
      .maybeSingle(),
  )
  if (!row) throw new AppError('NOT_FOUND')
  return row
}

const EXCHANGE_COLUMNS = 'currency, rate_to_kes, rate_date, updated_at'

export const listExchangeRates = async (db) =>
  unwrap(await db.from('exchange_rates').select(EXCHANGE_COLUMNS).order('currency'))

/** Set the rate used for USD quotes made from now on. Quotes already made keep the rate they were made at. */
export async function setExchangeRate(db, currency, input) {
  if (currency !== 'USD') throw new AppError('NOT_FOUND')
  const values = { currency, ...exchangeRateSchema.parse(input) }
  return unwrap(await db.from('exchange_rates').upsert(values).select(EXCHANGE_COLUMNS).single())
}
