import { copy } from '@/copy/en'
import { FLEET_RESOURCES } from '@/lib/admin-fleet-resources'
import { PRICE_RESOURCES } from '@/lib/admin-resources'

const text = copy.adminSetup
const PLACE_TYPES = ['airport', 'airstrip', 'custom']
// A company's own place has the admin's place fields, without the web address word and the served switch (the server
// sets those), and with the type narrowed to the kinds of place a company may add.
const placeFields = PRICE_RESOURCES.locations.fields
  .filter((field) => !['slug', 'is_served'].includes(field.name))
  .map((field) => (field.name === 'type' ? { ...field, options: PLACE_TYPES } : field))

const { vehicles, trackers, agreements } = FLEET_RESOURCES

const classNote = (row) => {
  if (!row.operator_id) return text.carvoClass
  return row.is_public ? null : text.privateClass
}

// The operator's own screens, built from the same field lists as the admin's. The API for them is `/operator/...`, and
// the page to refresh is the operator's own.
export const CONSOLE_RESOURCES = {
  vehicles: {
    ...vehicles,
    listPath: undefined,
    pagePath: () => '/console/fleet',
    summarize: (row, refs) => ({
      ...vehicles.summarize(row, refs),
      href: `/console/fleet/${row.id}`,
    }),
  },
  'vehicle-owners': {
    ...FLEET_RESOURCES['vehicle-owners'],
    pagePath: () => '/console/owners',
  },
  trackers: {
    ...trackers,
    createPath: (vehicleId) => `/operator/vehicles/${vehicleId}/trackers`,
    editPath: (id) => `/operator/trackers/${id}`,
    pagePath: (vehicleId) => `/console/fleet/${vehicleId}`,
  },
  agreements: {
    ...agreements,
    createPath: (ownerId) => `/operator/vehicle-owners/${ownerId}/agreements`,
    pagePath: () => '/console/fleet',
  },
  classes: {
    pagePath: () => '/console/classes',
    fields: [
      { name: 'name', type: 'text', isRequired: true },
      { name: 'seats', type: 'number', isRequired: true },
      { name: 'luggage_capacity', type: 'number' },
      { name: 'description', type: 'textarea' },
      { name: 'best_for', type: 'list' },
    ],
    // Carvo's classes can be picked but not changed; the company's own can be edited.
    summarize: (row) => ({
      title: row.name,
      detail: [text.describe.seats(row.seats), classNote(row)].filter(Boolean).join(' · '),
      isLocked: !row.operator_id,
    }),
  },
  rates: {
    ...PRICE_RESOURCES.rates,
    needs: ['classes'],
    pagePath: () => '/console/rates',
  },
  places: {
    pagePath: () => '/console/places',
    fields: placeFields,
    summarize: (row) => ({
      title: row.name,
      detail: [text.locationTypes[row.type], row.address].filter(Boolean).join(' · '),
    }),
  },
  company: {
    isSingle: true,
    editPath: () => '/operator/company',
    pagePath: () => '/console/company',
    fields: [
      { name: 'business_name', type: 'text' },
      { name: 'registration_number', type: 'text' },
      { name: 'kra_pin', type: 'text' },
      { name: 'address', type: 'text' },
      { name: 'phone', type: 'text' },
      { name: 'email', type: 'text' },
    ],
  },
}
