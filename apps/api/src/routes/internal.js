import { Router } from 'express'
import { requireJobSecret } from '../middleware/job-secret.js'
import { handle } from '../middleware/respond.js'
import { expireUnpaidBookings } from '../services/bookings.js'
import { sendQueuedNotifications } from '../services/notifications.js'

// Called by Cloudflare Cron Triggers with a shared secret. Not for browsers.
export const internalRouter = Router()
internalRouter.use(requireJobSecret)

internalRouter.post(
  '/jobs/expire-holds',
  handle(async () => ({ data: { expired: await expireUnpaidBookings() } })),
)

internalRouter.post(
  '/jobs/send-notifications',
  handle(async () => ({ data: await sendQueuedNotifications() })),
)
