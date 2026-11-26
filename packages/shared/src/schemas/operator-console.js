import { z } from 'zod'
import { e164Phone, hasAtLeastOneField } from './common.js'
import { CROSS_BORDER_RULES, FUEL_POLICIES, HANDOVER_PAYMENT_METHODS } from '../constants.js'
import { createLocationSchema, updateSchemaFrom } from './admin-data.js'
import { createOwnerSchema } from './fleet.js'

// What a rental company enters in its own console. The server adds who it belongs to, the web address word, and that
// a class or place starts private, so none of those are fields here.

const text = (max = 200) => z.string().trim().min(1).max(max)

export const OPERATOR_PLACE_TYPES = ['airport', 'airstrip', 'custom']
const placeFields = {
  name: text(120),
  type: z.enum(OPERATOR_PLACE_TYPES),
  address: text(300),
  latitude: createLocationSchema.shape.latitude,
  longitude: createLocationSchema.shape.longitude,
  entrance_note: text(500).optional(),
}
export const createOperatorPlaceSchema = z.strictObject(placeFields)
export const updateOperatorPlaceSchema = updateSchemaFrom(placeFields, {
  clearable: ['latitude', 'longitude', 'entrance_note'],
})

/** An owner is recorded with contact details only; the private ID and payout details are not collected here. */
export const createOperatorOwnerSchema = createOwnerSchema.omit({ private: true })

/** Switch one of Carvo's airports or airstrips on or off for this company. */
export const setPlaceServedSchema = z.strictObject({ is_served: z.boolean() })

/** A company's own contact and registration details. Its status and plan are the admin's. */
export const updateCompanySchema = z
  .strictObject({
    business_name: text(120),
    registration_number: text(60),
    kra_pin: text(20),
    address: text(300),
    phone: e164Phone,
    email: z.email(),
    offers_dropoff: z.boolean(),
    offers_pickup: z.boolean(),
  })
  .partial()
  .refine(...hasAtLeastOneField)

const policyFields = {
  class_id: z.uuid().optional(),
  min_hire_days: z.number().int().min(1).max(365).optional(),
  min_age: z.number().int().min(18).max(99).optional(),
  cross_border: z.enum(CROSS_BORDER_RULES).optional(),
  daily_km_limit: z.number().int().min(1).max(100_000).optional(),
  fuel_policy: z.enum(FUEL_POLICIES).optional(),
  rules: z.array(text(300)).max(20).optional(),
}
/** A company's rental rules, general (no class) or for one class. */
export const createPolicySchema = z.strictObject(policyFields)
export const updatePolicySchema = updateSchemaFrom(policyFields, {
  clearable: ['min_hire_days', 'min_age', 'cross_border', 'daily_km_limit', 'fuel_policy'],
  locked: ['class_id'],
})

/** What a company says it was paid at handover. The reference is an M-PESA code or bank note, if there is one. */
export const recordPaymentSchema = z.strictObject({
  method: z.enum(HANDOVER_PAYMENT_METHODS),
  amount_kes: z.number().int().min(1),
  reference: text(60).optional(),
})

/** A company's answer to a booking request. A refusal says why. */
export const answerRequestSchema = z
  .strictObject({ accept: z.boolean(), reason: text(500).optional() })
  .refine((answer) => answer.accept || answer.reason, {
    message: 'Say why you are declining.',
    path: ['reason'],
  })

export const calendarQuerySchema = z.strictObject({ from: z.iso.date() })

/** Days a car is not offered, such as a hire made outside the platform. Both days are included. */
export const blockDatesSchema = z
  .strictObject({
    vehicle_id: z.uuid(),
    start_date: z.iso.date(),
    end_date: z.iso.date(),
    note: text(200).optional(),
  })
  .refine((block) => block.end_date >= block.start_date, {
    message: 'The last day cannot be before the first.',
    path: ['end_date'],
  })
