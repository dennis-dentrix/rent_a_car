import { afterEach, describe, expect, it, vi } from 'vitest'
import { sendQueuedNotifications } from '../../src/services/notifications.js'
import {
  accounts,
  asCustomer,
  bookNewQuote,
  call,
  changeStatus,
  reviewDocument,
  uploadDocument,
  withApi,
} from './api-client.js'

const db = withApi()

const queued = async () =>
  (await db.query('select kind, to_email, status, payload from notifications order by created_at'))
    .rows
const kinds = async () => (await queued()).map((row) => row.kind)
const bookingId = async () => (await bookNewQuote()).body.data.id
const send = () => vi.fn().mockResolvedValue(undefined)

describe('emails are queued when something happens', () => {
  it('thanks the customer when a booking is made', async () => {
    await bookNewQuote()
    expect(await queued()).toMatchObject([
      { kind: 'booking_received', to_email: 'customer@example.test', status: 'pending' },
    ])
  })

  it('tells the customer when staff confirm, cancel, or expire a booking', async () => {
    const id = await bookingId()
    await changeStatus(id, 'confirmed', 'M-PESA ABC123')
    await changeStatus(id, 'cancelled', 'Customer asked')
    expect(await kinds()).toEqual(['booking_received', 'booking_confirmed', 'booking_cancelled'])
  })

  it('tells the customer when they change their dates', async () => {
    const id = await bookingId()
    await asCustomer('PATCH', `/bookings/${id}`, {
      start_at: '2027-04-01T08:00:00+03:00',
      end_at: '2027-04-05T08:00:00+03:00',
    })
    expect(await kinds()).toEqual(['booking_received', 'dates_changed'])
  })

  it('tells the customer why a document was rejected', async () => {
    const { id } = await uploadDocument(accounts.customer)
    await reviewDocument(id, {
      status: 'rejected',
      rejection_reason: 'The photo is blurred',
    })
    const [row] = await queued()
    expect(row).toMatchObject({ kind: 'document_rejected', to_email: 'customer@example.test' })
    expect(row.payload.reason).toBe('The photo is blurred')
  })

  it('does not queue anything for a document that is accepted', async () => {
    const { id } = await uploadDocument(accounts.customer)
    await reviewDocument(id, { status: 'verified' })
    expect(await kinds()).toEqual([])
  })
})

describe('enquiries', () => {
  const enquire = (body) =>
    call('POST', '/enquiries', {
      body: { name: 'Wanjiru', email: 'visitor@example.test', ...body },
    })

  afterEach(() => db.query("update settings set value = '\"\"' where key = 'staff_alert_email'"))

  it('thanks a visitor who left an email, and alerts the team only when an address is set', async () => {
    await enquire()
    expect(await kinds()).toEqual(['enquiry_received'])
    await db.query(
      "update settings set value = '\"team@example.test\"' where key = 'staff_alert_email'",
    )
    await enquire()
    expect((await kinds()).sort()).toEqual([
      'enquiry_alert',
      'enquiry_received',
      'enquiry_received',
    ])
  })

  it('needs an email address to write back to', async () => {
    const { status } = await call('POST', '/enquiries', {
      body: { name: 'Wanjiru', phone: '+254712345678' },
    })
    expect([status, await kinds()]).toEqual([400, []])
  })
})

describe('sending the queue', () => {
  it('sends each email once, with the booking details, then has nothing left to send', async () => {
    await bookNewQuote()
    const sender = send()
    expect(await sendQueuedNotifications({ send: sender })).toEqual({
      sent: 1,
      failed: 0,
      skipped: false,
    })
    expect(sender.mock.calls[0][0]).toMatchObject({ to: 'customer@example.test' })
    expect(sender.mock.calls[0][0].subject).toMatch(/^We have your booking BK-/)
    expect((await queued())[0].status).toBe('sent')
    expect(await sendQueuedNotifications({ send: sender })).toMatchObject({ sent: 0 })
  })

  it('shows the refund that was recorded when a booking is cancelled', async () => {
    const id = await bookingId()
    await changeStatus(id, 'confirmed', 'M-PESA ABC123')
    await asCustomer('POST', `/bookings/${id}/cancel`, {})
    const sender = send()
    await sendQueuedNotifications({ send: sender })
    const cancelled = sender.mock.calls
      .map(([mail]) => mail)
      .find((mail) => /cancelled/.test(mail.subject))
    expect(cancelled.text).toContain('refundable deposit of')
  })
})

describe('sending the queue when it fails', () => {
  it('keeps a failed email to try again later, and records why', async () => {
    await bookNewQuote()
    const failing = vi.fn().mockRejectedValue(new Error('Mail service answered 503'))
    const now = new Date('2026-11-15T10:00:00Z')
    expect(await sendQueuedNotifications({ send: failing, now })).toMatchObject({ failed: 1 })
    const { rows } = await db.query(
      'select status, attempts, last_error, send_after from notifications',
    )
    expect(rows[0]).toMatchObject({
      status: 'pending',
      attempts: 1,
      last_error: 'Mail service answered 503',
    })
    expect(rows[0].send_after.toISOString()).toBe('2026-11-15T10:05:00.000Z')
  })

  it('does not resend a failed email before its time, and gives up after the last attempt', async () => {
    await bookNewQuote()
    const failing = vi.fn().mockRejectedValue(new Error('down'))
    await sendQueuedNotifications({ send: failing })
    expect(await sendQueuedNotifications({ send: failing })).toMatchObject({ sent: 0, failed: 0 })
    for (let attempt = 2; attempt <= 5; attempt += 1) {
      await db.query('update notifications set send_after = now()')
      await sendQueuedNotifications({ send: failing })
    }
    const { rows } = await db.query('select status, attempts from notifications')
    expect(rows[0]).toEqual({ status: 'failed', attempts: 5 })
  })

  it('takes up an email left half sent by a run that crashed', async () => {
    await bookNewQuote()
    await db.query(
      "update notifications set status = 'sending', claimed_at = now() - interval '11 minutes'",
    )
    expect(await sendQueuedNotifications({ send: send() })).toMatchObject({ sent: 1 })
  })
})

describe('the scheduled job', () => {
  it('needs the job secret', async () => {
    expect((await call('POST', '/internal/jobs/send-notifications')).status).toBe(401)
  })

  it('leaves emails queued when no mail service is set up', async () => {
    await bookNewQuote()
    const { status, body } = await call('POST', '/internal/jobs/send-notifications', {
      headers: { 'x-job-secret': process.env.INTERNAL_JOB_SECRET },
    })
    expect([status, body.data]).toEqual([200, { sent: 0, failed: 0, skipped: true }])
    expect((await queued())[0].status).toBe('pending')
  })
})
