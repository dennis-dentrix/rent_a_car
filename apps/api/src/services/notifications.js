import { logger } from '../lib/logger.js'
import { readFile } from '../lib/storage.js'
import { emailConfigured, sendEmail } from '../lib/email.js'
import { unwrap, withServiceRole } from '../lib/supabase.js'
import { renderEmail } from './notification-templates.js'
import { retryDelayMinutes } from './notification-retry.js'

const BATCH_SIZE = 25
const BOOKING_COLUMNS =
  'reference, start_at, end_at, total_kes, deposit_kes, refund_due_kes, status'

/** The bookings that a batch of notifications is about, as a Map of booking id to booking. One query for the batch. */
async function loadBookings(admin, notifications) {
  const ids = [...new Set(notifications.map((n) => n.booking_id).filter(Boolean))]
  if (ids.length === 0) return new Map()
  const rows = unwrap(await admin.from('bookings').select(`id, ${BOOKING_COLUMNS}`).in('id', ids))
  return new Map(rows.map(({ id, ...booking }) => [id, booking]))
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

// `context` is { admin, send, now }: the database client, the function that sends an email, and the current time.
// They travel together so no function here takes more than three arguments.

/** Record a failed send and when to try again, if at all. Returns false. */
async function recordFailure(notification, error, { admin, now }) {
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

// The sealed inspection report travels with its email.
async function attachmentsFor({ kind, payload }) {
  if (kind !== 'inspection_report') return {}
  const content = (await readFile(payload.storage_path)).toString('base64')
  return { attachments: [{ name: 'inspection-report.pdf', mime_type: 'application/pdf', content }] }
}

/** Send one claimed notification and record the result. Returns true when it was sent. */
async function deliver(notification, bookings, context) {
  const { admin, send } = context
  try {
    const booking = bookings.get(notification.booking_id) ?? null
    const email = renderEmail(notification.kind, { payload: notification.payload, booking })
    if (!email) throw new Error(`No template for ${notification.kind}`)
    await send({ to: notification.to_email, ...email, ...(await attachmentsFor(notification)) })
    await finish(admin, notification.id, { sent: true })
    return true
  } catch (error) {
    return recordFailure(notification, error, context)
  }
}

/** Deliver a claimed batch. If its bookings cannot be loaded, every email in it fails and is retried later. */
async function deliverBatch(batch, context) {
  let bookings
  try {
    bookings = await loadBookings(context.admin, batch)
  } catch (error) {
    return Promise.all(batch.map((notification) => recordFailure(notification, error, context)))
  }
  const results = []
  for (const notification of batch) {
    results.push(await deliver(notification, bookings, context))
  }
  return results
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
    const results = await deliverBatch(batch, { admin, send, now })
    const sent = results.filter(Boolean).length
    return { sent, failed: results.length - sent, skipped: false }
  })
}
