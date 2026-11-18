import { logger } from '../lib/logger.js'
import { emailConfigured, sendEmail } from '../lib/email.js'
import { unwrap, withServiceRole } from '../lib/supabase.js'
import { renderEmail } from './notification-templates.js'
import { retryDelayMinutes } from './notification-retry.js'

const BATCH_SIZE = 25
const BOOKING_COLUMNS =
  'reference, start_at, end_at, total_kes, deposit_kes, refund_due_kes, status'

async function loadBooking(admin, bookingId) {
  if (!bookingId) return null
  return unwrap(
    await admin.from('bookings').select(BOOKING_COLUMNS).eq('id', bookingId).maybeSingle(),
  )
}

const finish = async (admin, id, { sent, error = null, retryAt = null }) =>
  unwrap(
    await admin.rpc('finish_notification', {
      p_id: id,
      p_sent: sent,
      p_error: error,
      p_retry_at: retryAt,
    }),
  )

/** Send one claimed notification and record the result. Returns true when it was sent. */
async function deliver(admin, notification, send, now) {
  try {
    const booking = await loadBooking(admin, notification.booking_id)
    const email = renderEmail(notification.kind, { payload: notification.payload, booking })
    if (!email) throw new Error(`No template for ${notification.kind}`)
    await send({ to: notification.to_email, ...email })
    await finish(admin, notification.id, { sent: true })
    return true
  } catch (error) {
    const delay = retryDelayMinutes(notification.attempts)
    const retryAt = delay === null ? null : new Date(now.getTime() + delay * 60_000).toISOString()
    logger.warn('notification_failed', { id: notification.id, kind: notification.kind })
    await finish(admin, notification.id, {
      sent: false,
      error: error.message.slice(0, 300),
      retryAt,
    })
    return false
  }
}

/**
 * Send the emails waiting in the queue. Run by the scheduled job. Without a mail service set up, nothing is
 * claimed and the emails stay queued. `send` and `now` are arguments so tests can replace them.
 */
export async function sendQueuedNotifications({ send = sendEmail, now = new Date() } = {}) {
  if (send === sendEmail && !emailConfigured()) {
    logger.warn('email_not_configured')
    return { sent: 0, failed: 0, skipped: true }
  }
  return withServiceRole('send_notifications', async (admin) => {
    const batch = unwrap(await admin.rpc('claim_notifications', { p_limit: BATCH_SIZE }))
    const results = []
    for (const notification of batch) results.push(await deliver(admin, notification, send, now))
    const sent = results.filter(Boolean).length
    return { sent, failed: results.length - sent, skipped: false }
  })
}
