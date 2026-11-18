import { describe, expect, it } from 'vitest'
import {
  IDS,
  asCustomer,
  accounts,
  bookNewQuote,
  call,
  changeStatus,
  staff,
  uploadDocument,
  withApi,
} from './api-client.js'

const db = withApi()

const declare = (overrides = {}) => ({
  type: 'national_id',
  content_type: 'application/pdf',
  size_bytes: 2048,
  ...overrides,
})
const staffId = async () =>
  (await db.query("select id from profiles where email = 'staff@example.test'")).rows[0].id

describe('a customer uploads a document', () => {
  it('gets a signed link and never the storage path', async () => {
    const { status, body } = await asCustomer('POST', '/documents', declare())
    expect(status).toBe(201)
    expect(body.data).toMatchObject({ type: 'national_id', status: 'uploaded', expires_in: 600 })
    expect(body.data.upload_url).toContain('X-Amz-Signature')
    expect(JSON.stringify(body.data)).not.toContain('storage_path')
  })

  it('confirms the document once the file has arrived', async () => {
    const { completed } = await uploadDocument(accounts.customer)
    expect(completed.status).toBe(200)
    expect(completed.body.data.file_confirmed_at).toEqual(expect.any(String))
  })

  it('refuses to confirm a document whose file was never uploaded', async () => {
    const created = await asCustomer('POST', '/documents', declare())
    const { status } = await asCustomer('POST', `/documents/${created.body.data.id}/complete`)
    expect(status).toBe(400)
  })

  it('replaces an earlier copy that was never reviewed', async () => {
    const first = await uploadDocument(accounts.customer)
    await uploadDocument(accounts.customer)
    const { rows } = await db.query('select status from documents where id = $1', [first.id])
    expect(rows[0].status).toBe('replaced')
  })
})

describe('what a customer may upload', () => {
  it.each([
    ['an agreement, which staff add', declare({ type: 'agreement' })],
    ['a file type that is not allowed', declare({ content_type: 'image/gif' })],
    ['a file over 10 MB', declare({ size_bytes: 10485761 })],
    ['an empty file', declare({ size_bytes: 0 })],
  ])('rejects %s', async (_name, body) => {
    expect((await asCustomer('POST', '/documents', body)).status).toBe(400)
  })

  it('refuses a booking that belongs to another customer', async () => {
    const { id } = (await bookNewQuote()).body.data
    const { status } = await asCustomer(
      'POST',
      '/documents',
      declare({ booking_id: id }),
      accounts.other,
    )
    expect(status).toBe(404)
  })
})

describe('a customer opens their documents', () => {
  it('lists only their own', async () => {
    await uploadDocument(accounts.customer)
    expect((await asCustomer('GET', '/documents')).body.data).toHaveLength(1)
    expect(
      (await asCustomer('GET', '/documents', undefined, accounts.other)).body.data,
    ).toHaveLength(0)
  })

  it('opens their own file with a link that expires, and no one else can', async () => {
    const { id } = await uploadDocument(accounts.customer)
    const { status, body } = await asCustomer('GET', `/documents/${id}/url`)
    const shown = await fetch(body.data.url)
    expect([status, (await shown.arrayBuffer()).byteLength]).toEqual([200, 2048])
    expect(
      (await asCustomer('GET', `/documents/${id}/url`, undefined, accounts.other)).status,
    ).toBe(404)
  })

  it('has no link for a document whose file has not arrived', async () => {
    const created = await asCustomer('POST', '/documents', declare())
    expect((await asCustomer('GET', `/documents/${created.body.data.id}/url`)).status).toBe(400)
  })
})

describe('staff review documents', () => {
  it('shows the queue with only documents whose file arrived, and who owns them', async () => {
    await asCustomer('POST', '/documents', declare())
    const { id } = await uploadDocument(accounts.customer, { type: 'driving_licence' })
    const { body } = await staff('GET', '/staff/documents')
    expect(body.data.map((item) => item.id)).toEqual([id])
    expect(body.data[0].owner.full_name).toBe('Test Customer')
  })

  it('records who verified a document and when', async () => {
    const { id } = await uploadDocument(accounts.customer)
    const { body } = await staff('PATCH', `/staff/documents/${id}`, { status: 'verified' })
    const { rows } = await db.query(
      'select reviewed_by, reviewed_at from documents where id = $1',
      [id],
    )
    expect([body.data.status, rows[0].reviewed_by, rows[0].reviewed_at === null]).toEqual([
      'verified',
      await staffId(),
      false,
    ])
  })
})

describe('staff accept or reject documents', () => {
  it('needs a reason to reject, and the customer then sees it', async () => {
    const { id } = await uploadDocument(accounts.customer)
    expect((await staff('PATCH', `/staff/documents/${id}`, { status: 'rejected' })).status).toBe(
      400,
    )
    await staff('PATCH', `/staff/documents/${id}`, {
      status: 'rejected',
      rejection_reason: 'The photo is blurred',
    })
    const { body } = await asCustomer('GET', '/documents')
    expect(body.data[0]).toMatchObject({
      status: 'rejected',
      rejection_reason: 'The photo is blurred',
    })
  })

  it('reviews a document once, and only for staff', async () => {
    const { id } = await uploadDocument(accounts.customer)
    await staff('PATCH', `/staff/documents/${id}`, { status: 'verified' })
    expect(
      (
        await staff('PATCH', `/staff/documents/${id}`, {
          status: 'rejected',
          rejection_reason: 'Changed my mind',
        })
      ).status,
    ).toBe(400)
    expect((await call('GET', '/staff/documents', { token: accounts.customer })).status).toBe(403)
  })
})

describe('staff open an identity document', () => {
  it('must give a reason, and the reading is logged with it', async () => {
    const { id } = await uploadDocument(accounts.customer)
    expect((await staff('GET', `/staff/documents/${id}/url`)).status).toBe(400)
    const { status, body } = await staff(
      'GET',
      `/staff/documents/${id}/url?reason=Verifying%20before%20pickup`,
    )
    const log = await db.query(
      'select accessed_by, reason from document_access_log where document_id = $1',
      [id],
    )
    expect([status, body.data.url.length > 0, log.rows]).toEqual([
      200,
      true,
      [{ accessed_by: await staffId(), reason: 'Verifying before pickup' }],
    ])
  })

  it('has no document to open for an unknown id', async () => {
    expect((await staff('GET', `/staff/documents/${IDS.UNKNOWN}/url?reason=Checking`)).status).toBe(
      404,
    )
  })
})

describe('from upload to a booking that is ready', () => {
  it('needs the ID, licence, and agreement uploaded and verified', async () => {
    const { id: booking } = (await bookNewQuote()).body.data
    const documents = [
      await uploadDocument(accounts.customer, { type: 'national_id' }),
      await uploadDocument(accounts.customer, { type: 'driving_licence' }),
      await uploadDocument(accounts.staff, {
        path: `/staff/bookings/${booking}/documents`,
        type: 'agreement',
      }),
    ]
    await changeStatus(booking, 'confirmed', 'Deposit received')
    expect((await changeStatus(booking, 'ready')).body.error.code).toBe('DOCUMENTS_NOT_VERIFIED')
    for (const { id } of documents)
      await staff('PATCH', `/staff/documents/${id}`, { status: 'verified' })
    const ready = await changeStatus(booking, 'ready')
    expect([ready.status, ready.body.data.status]).toEqual([200, 'ready'])
  })
})
