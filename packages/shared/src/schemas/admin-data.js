import { z } from 'zod'
import { hasAtLeastOneField } from './common.js'
import { LOCATION_TYPES } from '../places.js'

// What an admin enters to run the business: classes, rates, locations, delivery zones, extras, discounts,
// settings, and the USD rate. Prices are whole KES. Nothing here is deleted; things are switched off.

const text = (max = 200) => z.string().trim().min(1).max(max)
const kes = z.number().int().min(0).max(100_000_000)
const slug = z
  .string()
  .trim()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Use lowercase letters, numbers, and hyphens.')
  .max(80)
const date = z.iso.date()

/**
 * An update schema from a create shape: every field optional, at least one sent. `clearable` fields may be
 * sent as null to clear them; `locked` fields cannot be changed after creation.
 */
export function updateSchemaFrom(shape, { clearable = [], locked = [] } = {}) {
  const fields = Object.fromEntries(
    Object.entries(shape)
      .filter(([name]) => !locked.includes(name))
      .map(([name, field]) => [name, clearable.includes(name) ? field.nullable() : field]),
  )
  return z
    .strictObject(fields)
    .partial()
    .refine(...hasAtLeastOneField)
}

// What describes a class to a renter. A rental company enters these for a class of its own.
export const classBasics = {
  name: text(80),
  seats: z.number().int().min(1).max(60),
  luggage_capacity: z.number().int().min(0).max(100).optional(),
  description: text(2000).optional(),
  best_for: z.array(text(60)).max(10).optional(),
}

const classFields = {
  ...classBasics,
  slug,
  is_public: z.boolean().optional(),
  sort_order: z.number().int().optional(),
  security_deposit_enabled: z.boolean().optional(),
  security_deposit_kes: kes.optional(),
}
export const createClassSchema = z.strictObject(classFields)
export const updateClassSchema = updateSchemaFrom(classFields, {
  clearable: ['security_deposit_enabled', 'security_deposit_kes', 'description'],
})

const locationFields = {
  name: text(120),
  type: z.enum(LOCATION_TYPES),
  address: text(300),
  slug,
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  entrance_note: text(500).optional(),
  is_served: z.boolean().optional(),
}
export const createLocationSchema = z.strictObject(locationFields)
export const updateLocationSchema = updateSchemaFrom(locationFields, {
  clearable: ['latitude', 'longitude', 'entrance_note'],
})

const zoneFields = { name: text(120), fee_kes: kes, is_active: z.boolean().optional() }
export const createZoneSchema = z.strictObject(zoneFields)
export const updateZoneSchema = updateSchemaFrom(zoneFields)

const extraFields = {
  name: text(120),
  price_kes: kes,
  pricing_type: z.enum(['per_day', 'per_booking']),
  is_active: z.boolean().optional(),
}
export const createExtraSchema = z.strictObject(extraFields)
export const updateExtraSchema = updateSchemaFrom(extraFields)

const endsAfterStart = [
  (rule) => !rule.effective_to || !rule.effective_from || rule.effective_to >= rule.effective_from,
  { message: 'effective_to cannot be before effective_from.', path: ['effective_to'] },
]

// The daily price of a class from a date. Two rates for one class cannot cover the same day.
const rateFields = {
  class_id: z.uuid(),
  price_kes: z.number().int().min(1).max(100_000_000),
  usd_override: z.number().int().min(1).optional(),
  effective_from: date,
  effective_to: date.optional(),
}
export const createRateSchema = z.strictObject(rateFields).refine(...endsAfterStart)
export const updateRateSchema = updateSchemaFrom(rateFields, {
  locked: ['class_id'],
  clearable: ['usd_override', 'effective_to'],
}).refine(...endsAfterStart)

// A weekly, monthly, or longer-hire discount. It applies to the vehicle charge only.
const discountFields = {
  class_id: z.uuid().optional(),
  label: text(80),
  min_days: z.number().int().min(1).max(3650),
  kind: z.enum(['percent', 'fixed']),
  value: z.number().int().min(1).max(100_000_000),
  effective_from: date,
  effective_to: date.optional(),
  is_active: z.boolean().optional(),
}
const percentWithinHundred = [
  (discount) => discount.kind !== 'percent' || discount.value <= 100,
  { message: 'A percent discount cannot be more than 100.', path: ['value'] },
]
export const createDiscountSchema = z
  .strictObject(discountFields)
  .refine(...percentWithinHundred)
  .refine(...endsAfterStart)
export const updateDiscountSchema = updateSchemaFrom(discountFields, {
  clearable: ['class_id', 'effective_to'],
}).refine(...endsAfterStart)

const percent = z.number().int().min(0).max(100)
const hours = z
  .number()
  .int()
  .min(0)
  .max(24 * 60)

/** Every setting an admin can change, with the value each one accepts. The database seeds the defaults. */
export const SETTING_SCHEMAS = {
  deposit_percent: percent,
  vat_percent: percent,
  late_return_grace_minutes: z
    .number()
    .int()
    .min(0)
    .max(24 * 60),
  hold_minutes: z
    .number()
    .int()
    .min(1)
    .max(24 * 60),
  quote_expiry_minutes: z
    .number()
    .int()
    .min(1)
    .max(24 * 60),
  cancellation_window_hours: hours,
  date_change_cutoff_hours: hours,
  max_date_changes: z.number().int().min(0).max(10),
  minimum_age: z.number().int().min(18).max(99),
  minimum_hire_days: z.number().int().min(1).max(30),
  review_threshold: z.number().int().min(1).max(5),
  security_deposit_enabled: z.boolean(),
  currency_selector_enabled: z.boolean(),
  etims_enabled: z.boolean(),
  staff_alert_email: z.union([z.email(), z.literal('')]),
}

export const updateSettingSchema = z.strictObject({ value: z.unknown() })

/** The USD rate is the only foreign currency. A new rate applies to quotes made after it is saved. */
export const exchangeRateSchema = z.strictObject({
  rate_to_kes: z.number().positive().max(10_000),
  rate_date: date,
})
