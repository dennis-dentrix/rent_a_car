import { CROSS_BORDER_RULES, FUEL_POLICIES } from '@carvo/shared'
import { copy } from '@/copy/en'
import { FLEET_RESOURCES } from '@/lib/admin-fleet-resources'
import { PRICE_RESOURCES } from '@/lib/admin-resources'
import { policyLines } from '@/lib/policy-text'

const text = copy.adminSetup
const rules = copy.policies
const PLACE_TYPES = ['airport', 'airstrip', 'custom']
// A company's own place has the admin's place fields, without the web address word and the served switch (the server
// sets those), and with the type narrowed to the kinds of place a company may add.
const placeFields = PRICE_RESOURCES.locations.fields
  .filter((field) => !['slug', 'is_served'].includes(field.name))
  .map((field) => (field.name === 'type' ? { ...field, options: PLACE_TYPES } : field))

const { vehicles, trackers, agreements } = FLEET_RESOURCES

// The operator's own screens, built from the same field lists as the admin's. The API for them is `/operator/...`, and
// the page to refresh is the operator's own.
export const CONSOLE_RESOURCES = {
  vehicles: {
    ...vehicles,
    listPath: undefined,
    pagePath: (vehicleId) => (vehicleId ? `/console/fleet/${vehicleId}` : '/console/fleet'),
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
  policies: {
    needs: ['classes'],
    pagePath: () => '/console/policies',
    fields: [
      {
        name: 'class_id',
        type: 'select',
        ref: 'classes',
        isLockedOnEdit: true,
        blankLabel: rules.allCars,
      },
      { name: 'min_hire_days', type: 'number', isClearable: true },
      { name: 'min_age', type: 'number', isClearable: true },
      {
        name: 'cross_border',
        type: 'select',
        options: CROSS_BORDER_RULES,
        optionLabels: rules.crossBorder,
        isClearable: true,
      },
      { name: 'daily_km_limit', type: 'number', isClearable: true },
      {
        name: 'fuel_policy',
        type: 'select',
        options: FUEL_POLICIES,
        optionLabels: rules.fuel,
        isClearable: true,
      },
      { name: 'rules', type: 'lines' },
    ],
    summarize: (row, refs) => ({
      title: refs.classes.get(row.class_id) ?? rules.allCars,
      detail: policyLines(row).join(' · '),
    }),
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
