import { describe, expect, it } from 'vitest'
import {
  DATES,
  IDS,
  asCustomer,
  call,
  errorOf,
  get,
  officeQuote,
  postQuote,
  query,
  signIn,
  withApi,
  createCarBooking,
} from './api-client.js'

// Bookings are made through the API on separate connections, so they cannot be rolled back.
const db = withApi()

// A car of the seeded rental company, with its own daily price. Test cleanup removes `API-` cars.
const SEED_FLEET = 'bbbbbbbb-bbbb-4bbb-8bbb-000000000001'
async function pricedCar(dailyKes = 4000, plate = 'API-CAR1') {
  const { rows } = await db.query(
    `insert into vehicles (registration, chassis_number, class_id, operator_id, daily_rate_kes)
     values ($4, $5, $1, $2, $3) returning id`,
    [IDS.SEDAN, SEED_FLEET, dailyKes, plate, `API-CHASSIS-${plate}`],
  )
  return rows[0].id
}
const quoteCar = (vehicle_id) => postQuote(officeQuote({ class_id: undefined, vehicle_id }))

describe('POST /quotes for a particular car', () => {
  it("charges the car's own daily price", async () => {
    const { status, body } = await quoteCar(await pricedCar())
    expect([status, body.data.total_kes, body.data.availability]).toEqual([201, 12000, true])
  })

  it('does not offer a car without a price', async () => {
    expect(errorOf(await quoteCar(await pricedCar(null)))).toEqual([404, 'NOT_FOUND'])
  })

  it.each([
    ['both a class and a car', { vehicle_id: IDS.KAA_001 }],
    ['neither a class nor a car', { class_id: undefined }],
  ])('rejects %s', async (_name, body) => {
    expect(errorOf(await postQuote(officeQuote(body)))).toEqual([400, 'VALIDATION_FAILED'])
  })
})

describe('changing the dates of a booked car', () => {
  it("prices the new dates from the same car's price today", async () => {
    const car = await pricedCar()
    const quote = await quoteCar(car)
    const booked = await createCarBooking(quote.body.data.id)
    await db.query('update vehicles set daily_rate_kes = 5000 where id = $1', [car])
    const dates = { start_at: '2027-04-01T08:00:00+03:00', end_at: '2027-04-04T08:00:00+03:00' }
    const { body } = await asCustomer('PATCH', `/bookings/${booked.body.data.id}`, dates)
    expect(body.data.booking.total_kes).toBe(15000)
  })
})

describe('hiring a car with a chauffeur', () => {
  const offered = async () => {
    const car = await pricedCar()
    await db.query(
      "update vehicles set chauffeur_option = 'both', chauffeur_daily_kes = 3000 where id = $1",
      [car],
    )
    return car
  }
  const stay = query({ from: DATES.START, to: DATES.END_3_DAYS })

  it('shows the same total on the car page as on the quote', async () => {
    const car = await offered()
    const page = await get(`/vehicles/${car}${stay}&with_chauffeur=true`)
    const quote = await postQuote(
      officeQuote({ class_id: undefined, vehicle_id: car, with_chauffeur: true }),
    )
    expect(page.body.data).toMatchObject({ days: 3, total_kes: 21000, is_free: true })
    expect(quote.body.data.total_kes).toBe(21000)
  })

  it('is refused for a car that offers none', async () => {
    const car = await pricedCar()
    const body = officeQuote({ class_id: undefined, vehicle_id: car, with_chauffeur: true })
    expect(errorOf(await postQuote(body))).toEqual([400, 'VALIDATION_FAILED'])
  })
})

describe('booking a particular car', () => {
  const book = async (details) => {
    const quote = await quoteCar(await pricedCar())
    return createCarBooking(quote.body.data.id, details)
  }

  it('is confirmed at once', async () => {
    const { status, body } = await book()
    expect([status, body.data.status, body.data.destination]).toEqual([
      201,
      'confirmed',
      'Naivasha',
    ])
  })

  it('shows the renter the car and how to reach the company', async () => {
    const booked = await book()
    const { body } = await asCustomer('GET', `/bookings/${booked.body.data.id}`)
    expect(body.data.car).toMatchObject({ registration: 'API-CAR1' })
    expect(body.data.company).toEqual({ name: 'Seed Fleet', phone: '+254700000005' })
  })

  it('needs a date of birth', async () => {
    expect(errorOf(await book({ date_of_birth: undefined }))).toEqual([400, 'VALIDATION_FAILED'])
  })

  it('says so when the renter is too young', async () => {
    expect(errorOf(await book({ date_of_birth: '2012-01-01' }))).toEqual([422, 'UNDER_MINIMUM_AGE'])
  })
})

describe('a company running its hire', () => {
  const bookedHire = async () => {
    const quote = await quoteCar(await pricedCar())
    const booked = await createCarBooking(quote.body.data.id)
    return `/operator/bookings/${booked.body.data.id}`
  }
  const company = async (method, path, body) =>
    call(method, path, { body, token: await signIn('operator@example.test') })

  it('says what is missing before the car can be ready, and records a payment', async () => {
    const path = await bookedHire()
    const early = await company('PATCH', `${path}/status`, { to_status: 'ready' })
    expect(errorOf(early)).toEqual([422, 'DOCUMENTS_NOT_VERIFIED'])
    const paid = await company('POST', `${path}/payments`, { method: 'cash', amount_kes: 5000 })
    expect([paid.status, paid.body.data.payments[0].amount_kes]).toEqual([201, 5000])
    expect((await company('GET', `${path}/documents`)).body.data).toEqual([])
  })

  it('is closed to the renter', async () => {
    const path = await bookedHire()
    expect((await asCustomer('GET', `${path}/documents`)).status).toBe(403)
  })
})

describe('what a car type costs', () => {
  it("is its cheapest listed car's daily price, converted when USD is chosen", async () => {
    await pricedCar(6000, 'API-CAR2')
    await pricedCar(4000)
    const sedan = async (currency) =>
      (await get(`/classes${query({ currency })}`)).body.data.find((item) => item.id === IDS.SEDAN)
    expect((await sedan('KES')).price_per_day_kes).toBe(4000)
    expect(await sedan('USD')).toMatchObject({ price_per_day_display: 31, display_currency: 'USD' })
    expect((await get(`/classes/${IDS.SEDAN}`)).body.data.price_per_day_kes).toBe(4000)
  })
})

describe('a company blocking dates', () => {
  const company = async (method, path, body) =>
    call(method, path, { body, token: await signIn('operator@example.test') })

  it('shows them on its calendar, refuses booked days, and frees them again', async () => {
    const car = await pricedCar()
    const block = { vehicle_id: car, start_date: '2027-03-02', end_date: '2027-03-03' }
    const made = await company('POST', '/operator/blocks', block)
    expect(made.status).toBe(201)
    const { body } = await company('GET', '/operator/calendar?from=2027-03-01')
    expect(body.data.blocks.map((entry) => entry.id)).toEqual([made.body.data.id])
    expect(errorOf(await company('POST', '/operator/blocks', block))).toEqual([409, 'CONFLICT'])
    expect((await company('DELETE', `/operator/blocks/${made.body.data.id}`)).status).toBe(200)
  })
})

describe('news of a booking', () => {
  const company = async (path, body) =>
    call('POST', `/operator/bookings/${path}`, {
      body,
      token: await signIn('operator@example.test'),
    })

  it('tells the renter when the company answers, until the booking is opened', async () => {
    const car = await pricedCar()
    await db.query("update vehicles set booking_mode = 'request' where id = $1", [car])
    const { id } = (await createCarBooking((await quoteCar(car)).body.data.id)).body.data
    await company(`${id}/answer`, { accept: true })
    const alerts = async () => (await asCustomer('GET', '/me/alerts')).body.data.booking_updates
    expect(await alerts()).toBe(1)
    expect((await asCustomer('GET', '/bookings')).body.data[0]).toMatchObject({ has_news: true })
    expect((await asCustomer('POST', `/bookings/${id}/seen`)).status).toBe(200)
    expect(await alerts()).toBe(0)
  })
})
