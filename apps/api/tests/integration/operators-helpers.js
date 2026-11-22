import { ids, insertBooking } from './helpers.js'

// Two approved operators, each with a user, a vehicle, and one booking by a different customer.
// Used with `withSeededTransaction`, which has already created the customers, class, and legacy fleet.
export const opIds = {
  opA: '00000000-0000-4000-8000-000000000601',
  opB: '00000000-0000-4000-8000-000000000602',
  userA: '00000000-0000-4000-8000-000000000611',
  userB: '00000000-0000-4000-8000-000000000612',
  vehA: '00000000-0000-4000-8000-000000000701',
  vehB: '00000000-0000-4000-8000-000000000702',
  bookingA: '00000000-0000-4000-8000-000000000801',
  bookingB: '00000000-0000-4000-8000-000000000802',
}

const OPERATORS = [
  [opIds.opA, 'Operator A', 'operator-a', opIds.userA, opIds.vehA, 'OPA 001A'],
  [opIds.opB, 'Operator B', 'operator-b', opIds.userB, opIds.vehB, 'OPB 001B'],
]

async function insertOperatorUser(client, userId, name, operatorId) {
  await client.query('insert into auth.users (id, email) values ($1, $2)', [
    userId,
    `${userId}@example.invalid`,
  ])
  await client.query(
    "update profiles set full_name = $2, role = 'operator', operator_id = $3 where id = $1",
    [userId, `${name} user`, operatorId],
  )
}

export async function seedOperators(client) {
  for (const [operatorId, name, slug, userId, vehicleId, registration] of OPERATORS) {
    await client.query(
      "insert into operators (id, business_name, slug, status, phone) values ($1, $2, $3, 'approved', '+254700000001')",
      [operatorId, name, slug],
    )
    await insertOperatorUser(client, userId, name, operatorId)
    await client.query(
      'insert into vehicles (id, registration, chassis_number, class_id, operator_id) values ($1, $2, $3, $4, $5)',
      [vehicleId, registration, `CHASSIS-${registration}`, ids.cls, operatorId],
    )
  }
  await insertBooking(client, booking(opIds.bookingA, 'OA1', ids.custA, opIds.vehA))
  await insertBooking(client, booking(opIds.bookingB, 'OB1', ids.custB, opIds.vehB))
}

const booking = (id, reference, customer, vehicle) => ({
  id,
  reference,
  customer,
  vehicle,
  start: '2026-12-10',
  end: '2026-12-12',
})

/** A vehicle insert for `operatorId`; returns the `attempt` arguments. */
export const vehicleInsert = (operatorId, registration) => [
  'insert into vehicles (registration, chassis_number, class_id, operator_id) values ($1, $2, $3, $4)',
  [registration, `CHASSIS-${registration}`, ids.cls, operatorId],
]

/** An owner record that belongs to `operatorId`; returns its id. */
export async function insertOperatorOwner(client, operatorId, name = 'Owner') {
  const result = await client.query(
    "insert into vehicle_owners (full_name, phone, operator_id) values ($1, '+254711000099', $2) returning id",
    [name, operatorId],
  )
  return result.rows[0].id
}
