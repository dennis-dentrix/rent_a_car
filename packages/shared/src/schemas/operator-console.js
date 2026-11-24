import { z } from 'zod'
import { e164Phone, hasAtLeastOneField } from './common.js'
import { classBasics, createLocationSchema, updateSchemaFrom } from './admin-data.js'
import { createOwnerSchema } from './fleet.js'

// What a rental company enters in its own console. The server adds who it belongs to, the web address word, and that
// a class or place starts private, so none of those are fields here.

const text = (max = 200) => z.string().trim().min(1).max(max)

export const createOperatorClassSchema = z.strictObject(classBasics)
export const updateOperatorClassSchema = z
  .strictObject(z.object(classBasics).partial().shape)
  .refine(...hasAtLeastOneField)

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
  })
  .partial()
  .refine(...hasAtLeastOneField)
