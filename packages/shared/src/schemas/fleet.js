import { z } from 'zod'
import { e164Phone, hasAtLeastOneField, pageFields } from './common.js'

const text = (max = 200) => z.string().trim().min(1).max(max)
const optionalText = (max = 200) => text(max).optional()

export const VEHICLE_STATUSES = ['active', 'maintenance', 'retired']

const vehicleFields = {
  registration: text(20),
  chassis_number: z.string().trim().min(5).max(40),
  make: optionalText(60),
  model: optionalText(60),
  year: z.number().int().min(1990).max(2100).optional(),
  class_id: z.uuid(),
  mileage_km: z.number().int().min(0).optional(),
  home_location_id: z.uuid().optional(),
  owner_id: z.uuid().nullable().optional(),
}

export const createVehicleSchema = z.strictObject(vehicleFields)

/** Any of the vehicle fields, plus status. At least one must be sent. */
export const updateVehicleSchema = z
  .strictObject({
    ...z.object(vehicleFields).partial().shape,
    status: z.enum(VEHICLE_STATUSES).optional(),
  })
  .refine(...hasAtLeastOneField)

export const listQuerySchema = z.strictObject({
  ...pageFields,
})

const privateDetails = z.strictObject({
  national_id_number: optionalText(40),
  payout_method: z.enum(['mpesa', 'bank']).optional(),
  payout_account: optionalText(60),
  payout_account_name: optionalText(120),
})

export const createOwnerSchema = z.strictObject({
  owner_type: z.enum(['individual', 'company']).default('individual'),
  full_name: text(120),
  phone: e164Phone,
  email: z.email().optional(),
  kra_pin: optionalText(20),
  notes: optionalText(1000),
  private: privateDetails.optional(),
})

export const createAgreementSchema = z
  .strictObject({
    vehicle_id: z.uuid(),
    commission_percent: z.number().min(0).max(100),
    starts_on: z.iso.date(),
    ends_on: z.iso.date().optional(),
    agreement_storage_path: optionalText(300),
    notes: optionalText(1000),
  })
  .refine((agreement) => !agreement.ends_on || agreement.ends_on >= agreement.starts_on, {
    message: 'ends_on cannot be before starts_on.',
    path: ['ends_on'],
  })

const trackerFields = {
  provider: text(80),
  model: optionalText(80),
  device_id: text(60),
  sim_number: optionalText(30),
  installed_on: z.iso.date().optional(),
  subscription_expires_on: z.iso.date().optional(),
  notes: optionalText(1000),
}

export const createTrackerSchema = z.strictObject(trackerFields)

export const updateTrackerSchema = z
  .strictObject({
    ...z.object(trackerFields).omit({ provider: true, device_id: true }).partial().shape,
    status: z.enum(['active', 'inactive', 'faulty', 'removed']).optional(),
    removed_on: z.iso.date().optional(),
  })
  .refine(...hasAtLeastOneField)
