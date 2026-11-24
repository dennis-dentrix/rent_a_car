import {
  createOperatorClassSchema,
  createOperatorOwnerSchema,
  createOperatorPlaceSchema,
  createRateSchema,
  createVehicleSchema,
  updateOperatorClassSchema,
  updateOperatorPlaceSchema,
  updateRateSchema,
  updateVehicleSchema,
} from '@rent-a-car/shared'
import { resource } from './resources.js'
import { getVehicle } from './vehicles.js'

// What a rental company fills in. Every list is narrowed to its own rows, and every new row is stamped with its
// operator by the server, so a company can never write for another one. Row Level Security is the real rule.
const ownRows = (query, { operatorId }) => query.eq('operator_id', operatorId)
const stamp = (input, { operatorId }) => ({ ...input, operator_id: operatorId })

const wordFrom = (name) =>
  name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50)

// The address word is unique across the platform, so an operator's own is prefixed with the company's.
const ownSlug = (input, { operatorSlug }) => `${operatorSlug}-${wordFrom(input.name)}`

export const OPERATOR_RESOURCES = {
  vehicles: resource(
    'vehicles',
    'registration, chassis_number, make, model, year, class_id, status, mileage_km, home_location_id, owner_id',
    {
      create: createVehicleSchema,
      update: updateVehicleSchema,
      scope: ownRows,
      prepare: stamp,
      read: ({ db }, id) => getVehicle(db, id),
    },
  ),
  'vehicle-owners': resource(
    'vehicle_owners',
    'owner_type, full_name, phone, email, kra_pin, status, notes',
    { create: createOperatorOwnerSchema, scope: ownRows, prepare: stamp },
  ),
  // Carvo's classes and the company's own are both listed (Row Level Security shows the right ones).
  classes: resource(
    'vehicle_classes',
    'name, slug, seats, luggage_capacity, description, best_for, is_public, operator_id',
    {
      create: createOperatorClassSchema,
      update: updateOperatorClassSchema,
      prepare: (input, auth) => ({
        ...stamp(input, auth),
        slug: ownSlug(input, auth),
        is_public: false,
      }),
    },
  ),
  rates: resource('rates', 'class_id, price_kes, usd_override, effective_from, effective_to', {
    create: createRateSchema,
    update: updateRateSchema,
    scope: ownRows,
    prepare: stamp,
  }),
  places: resource(
    'locations',
    'name, type, address, slug, latitude, longitude, entrance_note, is_served',
    {
      create: createOperatorPlaceSchema,
      update: updateOperatorPlaceSchema,
      scope: ownRows,
      prepare: (input, auth) => ({
        ...stamp(input, auth),
        slug: ownSlug(input, auth),
        is_served: false,
      }),
    },
  ),
}
