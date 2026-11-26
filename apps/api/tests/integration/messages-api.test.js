import { describe, expect, it } from 'vitest'
import { IDS, accounts, asCustomer, call, errorOf, signIn, withApi } from './api-client.js'

const db = withApi()

// A priced car of the seeded rental company (supabase/seed.sql). Test cleanup removes `API-` cars.
async function listedCar() {
  const { rows } = await db.query(
    `insert into vehicles (registration, chassis_number, class_id, operator_id, daily_rate_kes)
     values ('API-MSG1', 'API-CHASSIS-MSG1', $1, 'bbbbbbbb-bbbb-4bbb-8bbb-000000000001', 4000)
     returning id`,
    [IDS.SEDAN],
  )
  return rows[0].id
}

describe('messages about a car', () => {
  it('needs a sign-in', async () => {
    expect((await call('GET', '/messages')).status).toBe(401)
  })

  it('starts a conversation, takes a reply, and hides it from others', async () => {
    const body = { vehicle_id: await listedCar(), body: 'Is it free?' }
    const started = await asCustomer('POST', '/messages', body)
    expect([started.status, started.body.data.company_name]).toEqual([201, 'Seed Fleet'])
    const path = `/messages/${started.body.data.id}`
    const replied = await asCustomer('POST', path, { body: 'For the weekend.' })
    expect(replied.body.data.messages.map((message) => message.body)).toEqual([
      'Is it free?',
      'For the weekend.',
    ])
    expect(errorOf(await call('GET', path, { token: accounts.other }))).toEqual([404, 'NOT_FOUND'])
  })

  it('shows the car and the reservation, and what is unread until it is opened', async () => {
    const body = { vehicle_id: await listedCar(), body: 'Is it free?' }
    const { id } = (await asCustomer('POST', '/messages', body)).body.data
    const token = await signIn('operator@example.test')
    const asCompany = (method, path) => call(method, path, { token })
    expect((await asCompany('GET', '/me/alerts')).body.data).toMatchObject({ unread_messages: 1 })
    const chat = (await asCompany('GET', `/messages/${id}`)).body.data
    expect(chat).toMatchObject({ is_unread: true, booking: null, car: { daily_rate_kes: 4000 } })
    expect(chat).not.toHaveProperty('renter_id')
    expect((await asCompany('POST', `/messages/${id}/read`)).status).toBe(200)
    expect((await asCompany('GET', '/me/alerts')).body.data.unread_messages).toBe(0)
  })
})
