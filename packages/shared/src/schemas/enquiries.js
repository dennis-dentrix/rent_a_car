import { z } from 'zod'
import { e164Phone, isoDateTime, pageFields } from './common.js'

const enquiryFields = {
  name: z.string().trim().min(2).max(120),
  phone: e164Phone.optional(),
  email: z.email().optional(),
  message: z.string().trim().min(1).max(1000).optional(),
  class_id: z.uuid().optional(),
  vehicle_id: z.uuid().optional(),
  start_at: isoDateTime.optional(),
  end_at: isoDateTime.optional(),
}

const datesTogether = (enquiry) => Boolean(enquiry.start_at) === Boolean(enquiry.end_at)
const datesRule = { message: 'Send both start_at and end_at, or neither.', path: ['end_at'] }

/** A visitor's enquiry from the website: an email address is required, a phone number is optional. */
export const createEnquirySchema = z
  .strictObject({ ...enquiryFields, email: z.email() })
  .refine(datesTogether, datesRule)

/** An enquiry staff log from a WhatsApp message or a phone call. */
export const createStaffEnquirySchema = z
  .strictObject({ ...enquiryFields, source: z.enum(['whatsapp', 'phone', 'form']) })
  .refine(datesTogether, datesRule)
  .refine((enquiry) => Boolean(enquiry.phone || enquiry.email), {
    message: 'Send a phone number or an email address.',
    path: ['phone'],
  })

export const listEnquiriesQuerySchema = z.strictObject({
  status: z.enum(['open', 'converted']).optional(),
  ...pageFields,
})
