import { describe, expect, it } from 'vitest'
import {
  IDS,
  accounts,
  bookNewQuote,
  call,
  putFile,
  sampleFile,
  staff,
  uploadInspectionFiles,
  withApi,
} from './api-client.js'

const db = withApi()

const report = (bookingId, files, overrides = {}) => ({
  booking_id: bookingId,
  type: 'pickup',
  fuel_level: 'full',
  mileage_km: 12000,
  condition_notes: 'Small scratch on the rear bumper.',
  damage_noted: true,
  files,
  ...overrides,
})
const inspect = (body, token = accounts.staff) =>
  call('POST', '/staff/inspections', { body, token })
const newBookingId = async () => (await bookNewQuote()).body.data.id
const threeFiles = (bookingId) =>
  uploadInspectionFiles(bookingId, [
    { label: 'front' },
    { label: 'rear' },
    { kind: 'document', label: 'signed sheet', content_type: 'application/pdf' },
  ])

// A new booking with one uploaded photo: the starting point of most upload checks.
const uploadedFront = async () => {
  const bookingId = await newBookingId()
  const [file] = await uploadInspectionFiles(bookingId, [{ label: 'front' }])
  return { bookingId, file }
}

describe('inspection reports', () => {
  it('saves a report with its uploaded photos and documents against the booking', async () => {
    const bookingId = await newBookingId()
    const { status, body } = await inspect(report(bookingId, await threeFiles(bookingId)))
    const { rows } = await db.query('select vehicle_id from bookings where id = $1', [bookingId])
    expect(status).toBe(201)
    expect(body.data).toMatchObject({
      type: 'pickup',
      damage_noted: true,
      vehicle_id: rows[0].vehicle_id,
    })
    expect(body.data.files).toHaveLength(3)
  })

  it('does not expose where the files are stored', async () => {
    const bookingId = await newBookingId()
    const { body } = await inspect(report(bookingId, await threeFiles(bookingId)))
    expect(JSON.stringify(body.data)).not.toContain('storage_path')
  })

  it('lists the pickup and return reports for a booking', async () => {
    const bookingId = await newBookingId()
    await inspect(report(bookingId, []))
    await inspect(report(bookingId, [], { type: 'return' }))
    const { body } = await staff('GET', `/staff/bookings/${bookingId}/inspections`)
    expect(body.data.map((item) => item.type)).toEqual(['pickup', 'return'])
  })
})

describe('inspection file uploads', () => {
  it("gives links under the booking's own folder", async () => {
    const { bookingId, file } = await uploadedFront()
    expect(file.storage_path.startsWith(`inspections/${bookingId}/`)).toBe(true)
  })

  // Each case spoils the uploaded file in one way; the report must be refused whichever way it is.
  it.each([
    [
      'names a file that was never uploaded',
      (bookingId, file) => ({
        ...file,
        storage_path: `inspections/${bookingId}/never-uploaded.jpg`,
      }),
    ],
    [
      'declares a different size than was uploaded',
      (_bookingId, file) => ({ ...file, size_bytes: file.size_bytes + 1 }),
    ],
  ])('refuses a report that %s', async (_name, spoil) => {
    const { bookingId, file } = await uploadedFront()
    expect((await inspect(report(bookingId, [spoil(bookingId, file)]))).status).toBe(400)
  })

  it("refuses a file from another booking's folder", async () => {
    const [first, second] = [await newBookingId(), await newBookingId()]
    const files = await uploadInspectionFiles(first, [{ label: 'front' }])
    expect((await inspect(report(second, files))).status).toBe(400)
  })

  it('makes the storage refuse a file bigger than the one declared', async () => {
    const bookingId = await newBookingId()
    const { body } = await staff('POST', `/staff/bookings/${bookingId}/inspection-uploads`, {
      files: [{ content_type: 'image/jpeg', size_bytes: 100 }],
    })
    const [link] = body.data
    const bigger = {
      ...link,
      required_headers: { ...link.required_headers, 'Content-Length': '5000' },
    }
    expect(await putFile(bigger, sampleFile(5000))).toBe(403)
  })
})

describe('opening inspection files', () => {
  const savedFileId = async (bookingId) => {
    const files = await uploadInspectionFiles(bookingId, [{ label: 'front' }])
    const { body } = await inspect(report(bookingId, files))
    return body.data.files[0].id
  }
  const open = (id, token) => call('GET', `/inspection-files/${id}/url`, { token })

  it('gives staff and the customer who rented a link that shows the file', async () => {
    const id = await savedFileId(await newBookingId())
    for (const token of [accounts.staff, accounts.customer]) {
      const { status, body } = await open(id, token)
      const shown = await fetch(body.data.url)
      expect([status, shown.status, (await shown.arrayBuffer()).byteLength]).toEqual([
        200, 200, 2048,
      ])
    }
  })

  it("hides another customer's inspection files", async () => {
    const id = await savedFileId(await newBookingId())
    expect((await open(id, accounts.other)).status).toBe(404)
    expect((await open(IDS.UNKNOWN, accounts.customer)).status).toBe(404)
  })
})

describe('inspection report validation', () => {
  const synthetic = {
    kind: 'photo',
    storage_path: 'inspections/x/y.jpg',
    content_type: 'image/jpeg',
    size_bytes: 10,
  }
  it.each([
    ['a file over 10 MB', { files: [{ ...synthetic, size_bytes: 10485761 }] }],
    ['an unsupported file type', { files: [{ ...synthetic, content_type: 'image/gif' }] }],
    ['an invalid fuel level', { fuel_level: 'overflowing' }],
  ])('rejects %s', async (_name, overrides) => {
    expect((await inspect(report(await newBookingId(), [], overrides))).status).toBe(400)
  })

  it('returns not found for an unknown booking and forbids customers', async () => {
    const unknown = await inspect(report(IDS.UNKNOWN, []))
    const customer = await inspect(report(await newBookingId(), []), accounts.customer)
    expect([unknown.status, customer.status]).toEqual([404, 403])
  })
})
