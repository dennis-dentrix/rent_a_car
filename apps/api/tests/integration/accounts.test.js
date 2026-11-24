import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  IDS,
  accounts,
  call,
  signInWithSecondFactor,
  putFile,
  sampleFile,
  signIn,
  signUpCustomer,
  withApi,
} from './api-client.js'

const db = withApi()

const me = (token, method = 'GET', body) => call(method, '/me', { token, body })
const asAdmin = (method, path, body) => call(method, path, { body, token: accounts.admin })

// 200 when the account may use staff routes, 403 when not.
const staffAccessStatus = async (token) => (await call('GET', '/staff/vehicles', { token })).status

describe('a profile is created at sign-up', () => {
  it('makes every new account a customer, whatever the sign-up data says', async () => {
    await db.query(
      `insert into auth.users (id, email, raw_user_meta_data)
       values (gen_random_uuid(), 'trigger-1@example.test', '{"role":"admin","full_name":"Sneaky"}')`,
    )
    const { rows } = await db.query(
      "select role, full_name from profiles where email = 'trigger-1@example.test'",
    )
    expect(rows).toEqual([{ role: 'customer', full_name: 'Sneaky' }])
  })

  it('shows a new customer their own profile', async () => {
    const { token, email } = await signUpCustomer('Amina Otieno')
    const { status, body } = await me(token)
    expect(status).toBe(200)
    expect(body.data).toMatchObject({
      full_name: 'Amina Otieno',
      email,
      role: 'customer',
      company: null,
    })
  })

  it('requires a signed-in user', async () => {
    expect((await me(null)).status).toBe(401)
  })
})

describe('PATCH /me', () => {
  it('changes the name and the marketing choice', async () => {
    const { token } = await signUpCustomer()
    await me(token, 'PATCH', { full_name: 'Renamed Person', marketing_opt_in: true })
    const { body } = await me(token)
    expect(body.data).toMatchObject({ full_name: 'Renamed Person', marketing_opt_in: true })
  })

  it.each([
    ['a role change', { role: 'admin' }],
    ['a phone number not in international format', { phone: '0700000000' }],
    ['an empty update', {}],
  ])('rejects %s', async (_name, body) => {
    const { token } = await signUpCustomer()
    expect((await me(token, 'PATCH', body)).status).toBe(400)
  })

  it('rejects a phone number that belongs to another account', async () => {
    const { token } = await signUpCustomer()
    expect((await me(token, 'PATCH', { phone: '+254700000001' })).status).toBe(400)
  })
})

describe('admin manages team members', () => {
  it('invites a new team member by email with the staff role', async () => {
    const email = `invite-${Date.now()}@example.test`
    const { status, body } = await asAdmin('POST', '/admin/staff', {
      email,
      full_name: 'New Teammate',
      role: 'staff',
    })
    expect([status, body.data.role, body.data.email]).toEqual([201, 'staff', email])
  })

  it('promotes an existing account, which can then use staff routes', async () => {
    const { id, email, token } = await signUpCustomer()
    expect(await staffAccessStatus(token)).toBe(403)
    await asAdmin('POST', '/admin/staff', { email, full_name: 'Promoted', role: 'staff' })
    expect((await call('GET', '/staff/vehicles', { token })).status).toBe(200)
    expect((await asAdmin('GET', '/admin/staff')).body.data.map((member) => member.id)).toContain(
      id,
    )
  })

  it('switches a team member off and on again', async () => {
    const { id, email, token } = await signUpCustomer()
    await asAdmin('POST', '/admin/staff', { email, full_name: 'Promoted', role: 'staff' })
    await asAdmin('PATCH', `/admin/staff/${id}`, { active: false })
    expect((await call('GET', '/staff/vehicles', { token })).status).toBe(403)
    await asAdmin('PATCH', `/admin/staff/${id}`, { active: true })
    expect((await call('GET', '/staff/vehicles', { token })).status).toBe(200)
  })

  it('stops an admin changing their own access', async () => {
    const { rows } = await db.query("select id from profiles where email = 'admin@example.test'")
    const { status } = await asAdmin('PATCH', `/admin/staff/${rows[0].id}`, { active: false })
    expect(status).toBe(403)
  })

  it('only changes team members, and only for admins', async () => {
    expect((await asAdmin('PATCH', `/admin/staff/${IDS.UNKNOWN}`, { active: false })).status).toBe(
      404,
    )
    const staff = await call('GET', '/admin/staff', { token: accounts.staff })
    expect(staff.status).toBe(403)
  })
})

describe('staff must use a second factor', () => {
  beforeEach(() => {
    process.env.REQUIRE_STAFF_MFA = 'true'
  })
  afterEach(() => {
    process.env.REQUIRE_STAFF_MFA = 'false'
  })

  it('refuses a staff sign-in that has no second factor', async () => {
    const { status, body } = await call('GET', '/staff/vehicles', { token: accounts.staff })
    expect([status, body.error.details.reason]).toEqual([403, 'mfa_required'])
  })

  it('accepts a staff sign-in that used an authenticator app', async () => {
    const token = await signInWithSecondFactor('staff@example.test')
    expect((await call('GET', '/staff/vehicles', { token })).status).toBe(200)
  })

  it('does not ask customers for a second factor', async () => {
    expect((await me(accounts.customer)).status).toBe(200)
  })
})

describe('a profile picture', () => {
  const declared = { content_type: 'image/jpeg', size_bytes: 2048 }
  const send = async (token, bytes = sampleFile('image/jpeg', 2048)) => {
    const link = (await call('POST', '/me/avatar-upload', { body: declared, token })).body.data
    await putFile(link, bytes)
    return {
      link,
      saved: await call('PUT', '/me/avatar', {
        body: { ...declared, storage_path: link.storage_path },
        token,
      }),
    }
  }

  it('is uploaded on a signed link, saved, shown by /me, and then removed', async () => {
    const { id, token } = await signUpCustomer()
    const { link, saved } = await send(token)
    expect(link.storage_path).toMatch(new RegExp(`^avatars/${id}/`))
    expect(saved.body.data.avatar_path).toBe(link.storage_path)
    expect((await me(token)).body.data.avatar_path).toBe(link.storage_path)
    const removed = await call('DELETE', '/me/avatar', { token })
    expect(removed.body.data.avatar_path).toBeNull()
  })

  it('refuses a file that is not the picture it claims, and a file in someone else’s folder', async () => {
    const { token } = await signUpCustomer()
    const fake = await send(token, sampleFile('application/pdf', 2048))
    expect(fake.saved.status).toBe(400)
    const other = await signUpCustomer()
    const theirs = await send(other.token)
    const stolen = await call('PUT', '/me/avatar', {
      body: { ...declared, storage_path: theirs.link.storage_path },
      token,
    })
    expect(stolen.status).toBe(400)
  })
})

describe('the authenticator app, for someone who turned it on', () => {
  it('lets a password alone ask who they are, and nothing else, until they use it', async () => {
    const { email, token } = await signUpCustomer()
    expect((await call('GET', '/documents', { token })).status).toBe(200)
    expect((await me(token)).body.data.has_second_factor).toBe(false)

    const strong = await signInWithSecondFactor(email)
    const passwordOnly = await signIn(email)
    const who = await me(passwordOnly)
    expect(who.status).toBe(200)
    expect(who.body.data.has_second_factor).toBe(true)
    const refused = await call('GET', '/documents', { token: passwordOnly })
    expect([refused.status, refused.body.error.details.reason]).toEqual([403, 'mfa_required'])
    expect((await call('GET', '/documents', { token: strong })).status).toBe(200)
  })
})
