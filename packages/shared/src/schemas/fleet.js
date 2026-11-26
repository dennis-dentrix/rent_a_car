import { z } from 'zod'
import {
  BLOG_IMAGE_CONTENT_TYPES,
  BOOKING_MODES,
  CHAUFFEUR_OPTIONS,
  DRIVE_TYPES,
  FUEL_TYPES,
  MAX_VEHICLE_PHOTO_BYTES,
  TRANSMISSIONS,
} from '../constants.js'
import { e164Phone, hasAtLeastOneField, pageFields } from './common.js'

const text = (max = 200) => z.string().trim().min(1).max(max)
const optionalText = (max = 200) => text(max).optional()

export const VEHICLE_STATUSES = ['active', 'maintenance', 'retired']

const blankable = (field) => field.nullable().optional()

// What a renter wants to know about the car. Each may be left empty, or cleared later.
const vehicleDetails = {
  seats: blankable(z.number().int().min(1).max(60)),
  luggage_capacity: blankable(z.number().int().min(0).max(100)),
  transmission: blankable(z.enum(TRANSMISSIONS)),
  fuel_type: blankable(z.enum(FUEL_TYPES)),
  drive_type: blankable(z.enum(DRIVE_TYPES)),
  engine_cc: blankable(z.number().int().min(50).max(10_000)),
  colour: blankable(text(40)),
  description: blankable(text(1000)),
  features: z.array(text(60)).max(20).optional(),
  chauffeur_option: blankable(z.enum(CHAUFFEUR_OPTIONS)),
  booking_mode: z.enum(BOOKING_MODES).optional(),
  chauffeur_daily_kes: blankable(z.number().int().min(1).max(100_000_000)),
}

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
  // The car's own price per day; empty means the class rate.
  daily_rate_kes: z.number().int().min(1).max(100_000_000).nullable().optional(),
  ...vehicleDetails,
}

const photoFile = {
  content_type: z.enum(BLOG_IMAGE_CONTENT_TYPES),
  size_bytes: z.number().int().min(1).max(MAX_VEHICLE_PHOTO_BYTES),
}
const photoPath = z.string().trim().min(3).max(300)

/** What the browser says it is about to upload as a car photo; the signed link accepts exactly this file. */
export const createVehiclePhotoUploadSchema = z.strictObject(photoFile)
/** Saves a photo once it is in storage. */
export const addVehiclePhotoSchema = z.strictObject({ ...photoFile, storage_path: photoPath })
export const removeVehiclePhotoSchema = z.strictObject({ storage_path: photoPath })

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
