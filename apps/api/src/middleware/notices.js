import { finished } from 'node:stream/promises'
import { runInBackground } from '../lib/background.js'
import { emailConfigured } from '../lib/email.js'
import { logger } from '../lib/logger.js'
import { sendQueuedNotifications } from '../services/notifications.js'

const sendAfter = async (res) => {
  await finished(res)
  if (res.statusCode < 400) await sendQueuedNotifications()
}

/**
 * The emails a change queued leave as soon as it is saved, without making the caller wait. Anything that fails stays in
 * the queue for the scheduled job.
 */
export function sendNoticesAfterChange(req, res, next) {
  if (req.method !== 'GET' && emailConfigured()) {
    runInBackground(
      sendAfter(res).catch((error) => logger.warn('notices_not_sent', { message: error?.message })),
    )
  }
  next()
}
