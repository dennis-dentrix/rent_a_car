import { describe, expect, it, vi } from 'vitest'
import { TEMPLATES, renderEmail } from './notification-templates.js'
import { MAX_ATTEMPTS, retryDelayMinutes } from './notification-retry.js'

const booking = {
  reference: 'BK-ABC12345',
  start_at: '2027-03-01T05:00:00Z',
  end_at: '2027-03-04T05:00:00Z',
  total_kes: 37500,
  deposit_kes: 11250,
  refund_due_kes: 0,
}

describe('email wording', () => {
  it('has a template for every kind and renders each one', () => {
    for (const kind of Object.keys(TEMPLATES)) {
      const email = renderEmail(kind, { payload: { document_type: 'national_id' }, booking })
      expect(email.subject.length).toBeGreaterThan(0)
      expect(email.text).toContain('Questions?')
      expect(email.text).not.toContain('WhatsApp')
    }
  })

  it('shows times in Nairobi', () => {
    const { text } = renderEmail('booking_confirmed', { payload: {}, booking })
    expect(text).toContain('Mon 1 Mar at 08:00')
  })

  it('mentions a refund only when one is due', () => {
    const none = renderEmail('booking_cancelled', { payload: {}, booking })
    const due = renderEmail('booking_cancelled', {
      payload: {},
      booking: { ...booking, refund_due_kes: 11250 },
    })
    expect(none.text).not.toContain('refundable deposit of')
    expect(due.text).toContain('KES 11,250')
  })

  it('escapes what a visitor typed before it goes into HTML', () => {
    const { html } = renderEmail('enquiry_alert', {
      payload: { name: '<script>alert(1)</script>' },
    })
    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;')
  })
})

describe('what an email offers the reader', () => {
  it('links to the page for the side being told, when the site address is set', () => {
    vi.stubEnv('APP_URL', 'https://example.test')
    const context = { payload: {}, booking, bookingId: 'b1' }
    expect(renderEmail('company_request', context).text).toContain(
      'https://example.test/console/bookings/b1',
    )
    expect(renderEmail('booking_confirmed', context).text).toContain(
      'https://example.test/account/bookings/b1',
    )
    const message = { payload: { conversation_id: 'c1', to_company: false } }
    expect(renderEmail('message_received', message).text).toContain('/account/messages/c1')
    vi.unstubAllEnvs()
  })

  it('leaves out a deposit when none is taken', () => {
    const free = { payload: {}, booking: { ...booking, deposit_kes: 0 } }
    expect(renderEmail('booking_received', free).text).not.toContain('deposit')
  })

  it('has no email for a kind it does not know', () => {
    expect(renderEmail('made_up', { payload: {} })).toBeNull()
  })
})

describe('retrying a failed email', () => {
  it('waits longer after each failure and gives up after the last attempt', () => {
    const waits = [1, 2, 3, 4].map(retryDelayMinutes)
    expect(waits).toEqual([...waits].sort((a, b) => a - b))
    expect(waits[0]).toBeGreaterThan(0)
    expect(retryDelayMinutes(MAX_ATTEMPTS)).toBeNull()
  })
})
