import { z } from 'zod'
import { isoDateTime } from './common.js'

const body = z.string().trim().min(1).max(1000)

/** A renter's first message about a car, with the dates they were looking at. */
export const startConversationSchema = z.strictObject({
  vehicle_id: z.uuid(),
  start_at: isoDateTime.optional(),
  end_at: isoDateTime.optional(),
  body,
})

export const replySchema = z.strictObject({ body })
