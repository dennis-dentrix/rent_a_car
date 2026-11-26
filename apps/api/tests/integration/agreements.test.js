import { describe, expect, it } from 'vitest'
import {
  accounts,
  asCustomer,
  bookNewQuote,
  changeStatus,
  getBinary,
  staff,
  uploadDocument,
  withApi,
} from './api-client.js'

const db = withApi()

// A 1 by 1 pixel PNG, standing in for a drawn signature.
const PNG =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='

const confirmedBooking = async () => {
  const { id } = (await bookNewQuote()).body.data
  await changeStatus(id, 'confirmed', 'M-PESA ABC123')
  return id
}
const read = async (id, token = accounts.customer) =>
  (await asCustomer('GET', `/bookings/${id}/agreement`, undefined, token)).body.data
const sign = async (id, overrides = {}, token = accounts.customer) => {
  const { terms_sha256 } = await read(id, token)
  const body = { signed_name: 'Test Customer', accept_terms: true, terms_sha256, ...overrides }
  return asCustomer('POST', `/bookings/${id}/agreement/sign`, body, token)
}
const verifyIdentity = async () => {
  for (const type of ['national_id', 'driving_licence']) {
    const { id } = await uploadDocument(accounts.customer, { type })
    await staff('PATCH', `/staff/documents/${id}`, { status: 'verified' })
  }
}
const documents = async (id) =>
  (
    await db.query('select type, status from documents where booking_id = $1 order by created_at', [
      id,
    ])
  ).rows

describe('reading the agreement', () => {
  it('shows the terms with this booking and the rules from settings filled in', async () => {
    const id = await confirmedBooking()
    const agreement = await read(id)
    expect(agreement).toMatchObject({
      booking_id: id,
      can_sign: true,
      signature: null,
      summary: {
        customer: { full_name: 'Test Customer' },
        vehicle: { class_name: expect.any(String) },
      },
    })
    expect(agreement.clauses.length).toBeGreaterThan(8)
    const text = agreement.clauses.map((clause) => clause.text).join(' ')
    expect(text).toContain('60 minutes')
    expect(text).toContain('24 hours')
    expect(text).toContain('21 years')
  })

  it('is with the rental company that has the booking, not the platform', async () => {
    const id = await confirmedBooking()
    await db.query(
      `with company as (insert into operators (business_name, slug) values ('API Savannah Rentals', 'api-savannah')
         returning id) update bookings set operator_id = company.id from company where bookings.id = $1`,
      [id],
    )
    expect((await read(id)).clauses[0].text).toContain('between API Savannah Rentals (the Company)')
  })

  it('cannot be signed until staff confirm the booking', async () => {
    const { id } = (await bookNewQuote()).body.data
    expect((await read(id)).can_sign).toBe(false)
    const { status, body } = await sign(id)
    expect([status, body.error.code]).toEqual([422, 'INVALID_STATUS_TRANSITION'])
  })
})

describe('the agreement PDF', () => {
  it('gives a PDF to read or to print, and keeps it from other customers', async () => {
    const id = await confirmedBooking()
    const pdf = await getBinary(`/bookings/${id}/agreement/pdf`, accounts.customer)
    expect([pdf.status, pdf.type, pdf.bytes.subarray(0, 5).toString()]).toEqual([
      200,
      'application/pdf',
      '%PDF-',
    ])
    expect((await getBinary(`/bookings/${id}/agreement/pdf`, accounts.other)).status).toBe(404)
  })

  it('refuses an id that is not a booking', async () => {
    expect((await asCustomer('GET', '/bookings/not-an-id/agreement')).status).toBe(404)
  })

  it('shows staff the same agreement, and keeps it from customers', async () => {
    const id = await confirmedBooking()
    expect((await staff('GET', `/staff/bookings/${id}/agreement`)).status).toBe(200)
    expect((await asCustomer('GET', `/staff/bookings/${id}/agreement`)).status).toBe(403)
    const pdf = await getBinary(`/staff/bookings/${id}/agreement/pdf`, accounts.staff)
    expect(pdf.status).toBe(200)
  })
})

describe('signing the agreement', () => {
  it('saves the signature and a verified agreement document the customer can open', async () => {
    const id = await confirmedBooking()
    const { status, body } = await sign(id, { signature_image: PNG })
    expect(status).toBe(201)
    expect(await documents(id)).toEqual([{ type: 'agreement', status: 'verified' }])
    const link = await asCustomer('GET', `/documents/${body.data.document_id}/url`)
    const stored = Buffer.from(await (await fetch(link.body.data.url)).arrayBuffer())
    expect(stored.subarray(0, 5).toString()).toBe('%PDF-')
    expect((await read(id)).signature).toMatchObject({
      signed_name: 'Test Customer',
      has_drawn_signature: true,
    })
    expect((await read(id)).can_sign).toBe(false)
  })
})

describe('the evidence of a signature', () => {
  it('keeps the evidence for staff only: when, from where, and which terms', async () => {
    const id = await confirmedBooking()
    const { terms_sha256 } = await read(id)
    await sign(id)
    const customerView = (await read(id)).signature
    const staffView = (await staff('GET', `/staff/bookings/${id}/agreement`)).body.data.signature
    expect(customerView).not.toHaveProperty('ip_address')
    expect(staffView).toMatchObject({ terms_sha256, terms_version: '2026-11-draft-2' })
    expect(staffView.ip_address).toBeTruthy()
    const { rows } = await db.query('select snapshot from agreement_signatures')
    expect(rows[0].snapshot.booking.reference).toMatch(/^BK-/)
  })

  it('emails the customer a confirmation', async () => {
    const id = await confirmedBooking()
    await sign(id)
    const { rows } = await db.query(
      "select to_email from notifications where kind = 'agreement_signed'",
    )
    expect(rows).toEqual([{ to_email: 'customer@example.test' }])
  })
})

describe('signatures that are refused', () => {
  it("refuses a second signature, and one that is not the customer's", async () => {
    const id = await confirmedBooking()
    expect((await sign(id)).status).toBe(201)
    const again = await sign(id)
    expect([again.status, again.body.error.code]).toEqual([409, 'CONFLICT'])
    const body = { signed_name: 'Other Customer', accept_terms: true, terms_sha256: 'a'.repeat(64) }
    const other = await asCustomer('POST', `/bookings/${id}/agreement/sign`, body, accounts.other)
    expect(other.status).toBe(404)
  })

  it.each([
    ['without accepting', { accept_terms: false }],
    ['with a name that is too short', { signed_name: 'A' }],
    ['with a fingerprint that is not the current terms', { terms_sha256: 'a'.repeat(64) }],
    ['with a drawing that is not a PNG', { signature_image: 'aGVsbG8gd29ybGQ=' }],
    ['with an extra field', { signed_at: '2020-01-01T00:00:00Z' }],
  ])('refuses %s', async (_name, overrides) => {
    const id = await confirmedBooking()
    expect((await sign(id, overrides)).status).toBe(400)
    expect(await documents(id)).toEqual([])
  })

  it('cannot be signed by staff, and cannot be called from the database directly', async () => {
    const id = await confirmedBooking()
    const { terms_sha256 } = await read(id)
    const body = { signed_name: 'Staff Member', accept_terms: true, terms_sha256 }
    const attempt = await asCustomer('POST', `/bookings/${id}/agreement/sign`, body, accounts.staff)
    expect(attempt.status).toBe(404)
    const direct = await db.query('select has_function_privilege($1, $2, $3) as allowed', [
      'authenticated',
      'sign_agreement(uuid,uuid,uuid,text,integer,text,timestamptz,text,text,jsonb,boolean,text,text)',
      'execute',
    ])
    expect(direct.rows[0].allowed).toBe(false)
  })

  it('accepts names with letters the PDF fonts do not have', async () => {
    const id = await confirmedBooking()
    expect((await sign(id, { signed_name: 'Łukasz Ñandú 王小明' })).status).toBe(201)
    expect((await read(id)).signature.signed_name).toBe('Łukasz Ñandú 王小明')
  })
})

describe('what a signature allows', () => {
  it('counts as the verified agreement, so the booking can become ready', async () => {
    const id = await confirmedBooking()
    await verifyIdentity()
    expect((await changeStatus(id, 'ready')).status).toBe(422)
    await sign(id)
    expect((await changeStatus(id, 'ready')).status).toBe(200)
  })
})

const changeDates = (id) =>
  asCustomer('PATCH', `/bookings/${id}`, {
    start_at: '2027-04-01T08:00:00+03:00',
    end_at: '2027-04-05T08:00:00+03:00',
  })

describe('a change of dates', () => {
  it('voids the signature, and the customer signs again', async () => {
    const id = await confirmedBooking()
    await sign(id)
    const change = await changeDates(id)
    expect(change.status).toBe(200)
    expect(await documents(id)).toEqual([{ type: 'agreement', status: 'replaced' }])
    const agreement = await read(id)
    expect([agreement.signature, agreement.can_sign]).toEqual([null, true])
    expect((await sign(id)).status).toBe(201)
  })

  it('stops the dates changing once the booking is ready', async () => {
    const id = await confirmedBooking()
    await verifyIdentity()
    await sign(id)
    await changeStatus(id, 'ready')
    const change = await asCustomer('PATCH', `/bookings/${id}`, {
      start_at: '2027-04-01T08:00:00+03:00',
      end_at: '2027-04-05T08:00:00+03:00',
    })
    expect(change.status).toBe(400)
  })

  it('cannot be edited or deleted in the database', async () => {
    const id = await confirmedBooking()
    await sign(id)
    await expect(
      db.query("update agreement_signatures set signed_name = 'Someone Else'"),
    ).rejects.toThrow()
    await expect(db.query('delete from agreement_signatures')).rejects.toThrow()
  })
})
