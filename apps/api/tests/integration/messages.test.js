import { beforeEach, describe, expect, it } from 'vitest'
import { actAs, actAsOwner, attempt, ids, withSeededTransaction } from './helpers.js'
import { opIds, seedOperators } from './operators-helpers.js'

const client = withSeededTransaction()
beforeEach(async () => {
  await seedOperators(client)
  await client.query('update vehicles set daily_rate_kes = 4000 where id = any($1)', [
    [opIds.vehA, opIds.vehB],
  ])
})

// custB has no booking with company A, so nothing between them is agreed yet; custA has one (operators-helpers.js).
const start = async (renter, body, car = opIds.vehA) => {
  await actAs(client, renter)
  return attempt(client, 'select start_conversation($1, null, null, $2) as id', [car, body])
}
const reply = async (who, conversation, body) => {
  await actAs(client, who)
  return attempt(client, 'select send_message($1, $2)', [conversation, body])
}
const bodies = async (who) => {
  await actAs(client, who)
  const { rows } = await client.query('select body from messages order by created_at, id')
  return rows.map((row) => row.body)
}

describe('talking about a car', () => {
  it('keeps one conversation per renter and car, and marks who is waiting', async () => {
    const first = (await start(ids.custB, 'Is it free?')).rows[0].id
    expect((await start(ids.custB, 'Next week?')).rows[0].id).toBe(first)
    const waiting = async () => {
      await actAsOwner(client)
      const { rows } = await client.query(
        'select awaiting_company from conversations where id = $1',
        [first],
      )
      return rows[0].awaiting_company
    }
    expect(await waiting()).toBe(true)
    expect((await reply(opIds.userA, first, 'Yes it is.')).error).toBeNull()
    expect(await waiting()).toBe(false)
  })

  it('is seen by that renter and that company only', async () => {
    await start(ids.custB, 'Is it free?')
    expect(await bodies(ids.custB)).toHaveLength(1)
    expect(await bodies(opIds.userA)).toHaveLength(1)
    for (const outsider of [opIds.userB, ids.custA, ids.staff, null]) {
      await actAs(client, outsider)
      expect((await attempt(client, 'select id from messages')).rows).toEqual([])
    }
  })

  it('takes no message from an outsider, or from a suspended company', async () => {
    const id = (await start(ids.custB, 'Hello')).rows[0].id
    expect((await reply(opIds.userB, id, 'Hi')).error?.message).toBe('NOT_FOUND')
    await actAsOwner(client)
    await client.query("update operators set status = 'suspended' where id = $1", [opIds.opA])
    expect((await reply(opIds.userA, id, 'Hi')).error?.message).toBe('NOT_FOUND')
  })

  it('starts only about a listed car, with something said', async () => {
    expect((await start(ids.custB, '   ')).error?.message).toBe('VALIDATION_FAILED')
    expect((await start(ids.custB, 'Hi', ids.veh1)).error?.message).toBe('NOT_FOUND')
  })
})

const owner = async (sql, params) => {
  await actAsOwner(client)
  return (await client.query(sql, params)).rows
}
const emails = () =>
  owner("select to_email from notifications where kind = 'message_received' order by created_at")
const alertsOf = async (who) => {
  await actAs(client, who)
  return (await client.query('select * from my_alerts()')).rows[0]
}
// As if the earlier email and the reader's last look were long ago.
const letTimePass = () =>
  owner(`with old as (update notifications set created_at = now() - interval '1 hour')
         update conversations set company_read_at = company_read_at - interval '1 hour'`)
const markRead = async (who, conversation) => {
  await actAs(client, who)
  await client.query('select mark_conversation_read($1)', [conversation])
}

describe('being told of a message', () => {
  it('counts a chat as unread for the other side until they open it', async () => {
    const id = (await start(ids.custB, 'Is it free?')).rows[0].id
    expect((await alertsOf(opIds.userA)).unread_messages).toBe(1)
    expect((await alertsOf(ids.custB)).unread_messages).toBe(0)
    await markRead(opIds.userB, id)
    expect((await alertsOf(opIds.userA)).unread_messages).toBe(1)
    await markRead(opIds.userA, id)
    expect((await alertsOf(opIds.userA)).unread_messages).toBe(0)
  })

  it('emails the first unseen message, and again only after a quiet quarter hour', async () => {
    await start(ids.custB, 'Is it free?')
    await start(ids.custB, 'Hello?')
    expect(await emails()).toHaveLength(1)
    await letTimePass()
    await start(ids.custB, 'Still there?')
    expect(await emails()).toHaveLength(2)
  })

  it('sends no email to someone who has the chat open', async () => {
    const id = (await start(ids.custB, 'Is it free?')).rows[0].id
    await markRead(opIds.userA, id)
    await owner("update notifications set created_at = now() - interval '1 hour'")
    await start(ids.custB, 'Thanks')
    expect(await emails()).toHaveLength(1)
  })

  it("uses the company's person when the company gave no address", async () => {
    await owner('update operators set email = null where id = $1', [opIds.opA])
    await start(ids.custB, 'Is it free?')
    expect((await emails())[0].to_email).toContain('@')
  })
})

describe('contact details before a booking is agreed', () => {
  const TEXT = 'Call +254 712 345 678 or mail me@example.com about 2027-03-01 at KES 165,000'

  it('are hidden, while dates and prices stay', async () => {
    await start(ids.custB, TEXT)
    expect(await bodies(ids.custB)).toEqual([
      'Call [hidden until booked] or mail [hidden until booked] about 2027-03-01 at KES 165,000',
    ])
  })

  it('are shown once the renter has a confirmed booking with the company', async () => {
    await start(ids.custA, TEXT)
    expect(await bodies(ids.custA)).toEqual([TEXT])
  })
})
