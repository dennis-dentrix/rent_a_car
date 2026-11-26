import {
  BOOKING_MODES,
  CHAUFFEUR_OPTIONS,
  DRIVE_TYPES,
  FUEL_TYPES,
  TRANSMISSIONS,
  formatMoney,
  formatShortDate,
} from '@carvo/shared'
import { copy } from '@/copy/en'
import { mediaUrl } from '@/lib/media'

const text = copy.adminFleet
const VEHICLE_STATUSES = ['active', 'maintenance', 'retired']
const TRACKER_STATUSES = ['active', 'inactive', 'faulty', 'removed']

const vehicleTitle = (row) =>
  `${[row.make, row.model].filter(Boolean).join(' ') || text.noMake} · ${row.registration}`

const STATUS_TONES = { active: 'success', maintenance: 'warning', retired: 'neutral' }

const vehicleCells = (row, refs) => ({
  vehicle: {
    main: [row.make, row.model].filter(Boolean).join(' ') || text.noMake,
    chip: row.year,
    code: row.registration,
    image: mediaUrl(row.photo_paths?.[0], process.env.NEXT_PUBLIC_MEDIA_BASE_URL),
    hasPhotoSlot: true,
  },
  chassis: {
    main: row.chassis_number,
    sub: row.owner_id
      ? `${copy.consoleUi.fleet.managed} · ${refs['vehicle-owners']?.get(row.owner_id) ?? ''}`
      : copy.consoleUi.fleet.company,
  },
  class: refs.classes.get(row.class_id),
  rate: row.daily_rate_kes
    ? { main: formatMoney(row.daily_rate_kes), sub: copy.consoleUi.fleet.perDay }
    : { main: copy.consoleUi.fleet.noPrice },
  status: { pill: text.statuses[row.status], tone: STATUS_TONES[row.status] },
})

const choice = (name, options, optionLabels) => ({
  name,
  type: 'select',
  options,
  optionLabels,
  isClearable: true,
})
const detail = (name, type = 'number') => ({ name, type, isClearable: true })

// A car's form in four parts; `heading` starts a part.
const VEHICLE_FIELDS = [
  { name: 'registration', type: 'text', isRequired: true, heading: text.parts.car },
  { name: 'chassis_number', type: 'text', isRequired: true },
  { name: 'make', type: 'text' },
  { name: 'model', type: 'text' },
  { name: 'year', type: 'number' },
  { name: 'class_id', type: 'select', ref: 'classes', isRequired: true },
  {
    name: 'status',
    type: 'select',
    options: VEHICLE_STATUSES,
    optionLabels: text.statuses,
    isEditOnly: true,
  },
  { ...detail('daily_rate_kes'), heading: text.parts.pricing },
  {
    name: 'booking_mode',
    type: 'select',
    options: BOOKING_MODES,
    optionLabels: text.bookingModes,
  },
  choice('chauffeur_option', CHAUFFEUR_OPTIONS, copy.carFacts.chauffeur),
  detail('chauffeur_daily_kes'),
  { ...detail('seats'), heading: text.parts.details },
  detail('luggage_capacity'),
  choice('transmission', TRANSMISSIONS, copy.carFacts.transmission),
  choice('fuel_type', FUEL_TYPES, copy.carFacts.fuel_type),
  choice('drive_type', DRIVE_TYPES, copy.carFacts.drive_type),
  detail('engine_cc'),
  detail('colour', 'text'),
  { name: 'features', type: 'lines' },
  detail('description', 'textarea'),
  { name: 'mileage_km', type: 'number', heading: text.parts.records },
  { name: 'home_location_id', type: 'select', ref: 'locations' },
  {
    name: 'owner_id',
    type: 'select',
    ref: 'vehicle-owners',
    isClearable: true,
    blankLabel: text.noOwnerOption,
  },
]

// The fleet's kinds of record, in the same form as the price and place ones. A `parent` is the record a new one
// belongs to (a tracker's vehicle); `pagePath` is the page to refresh once one is saved.
export const FLEET_RESOURCES = {
  vehicles: {
    needs: ['classes', 'locations', 'vehicle-owners'],
    columns: [
      { key: 'vehicle', label: copy.consoleUi.fleet.vehicle },
      { key: 'chassis', label: copy.consoleUi.fleet.chassis },
      { key: 'class', label: copy.consoleUi.fleet.class },
      { key: 'rate', label: copy.consoleUi.fleet.rate },
      { key: 'status', label: copy.consoleUi.fleet.status },
    ],
    filters: [
      { key: 'active', label: text.statuses.active },
      { key: 'maintenance', label: text.statuses.maintenance },
      { key: 'retired', label: text.statuses.retired },
      { key: 'company', label: copy.consoleUi.fleet.company },
      { key: 'managed', label: copy.consoleUi.fleet.managed },
    ],
    listPath: '/staff/vehicles',
    pagePath: (vehicleId) => (vehicleId ? `/admin/vehicles/${vehicleId}` : '/admin/setup/vehicles'),
    fields: VEHICLE_FIELDS,
    summarize: (row, refs) => ({
      title: vehicleTitle(row),
      cells: vehicleCells(row, refs),
      tags: [row.status, row.owner_id ? 'managed' : 'company'],
      href: `/admin/vehicles/${row.id}`,
      linkLabel: text.openVehicle,
    }),
  },
  drivers: {
    fields: [
      { name: 'name', type: 'text', isRequired: true },
      { name: 'phone', type: 'text', isRequired: true },
      { name: 'licence_number', type: 'text', isClearable: true },
      { name: 'is_active', type: 'boolean', isOnByDefault: true },
    ],
    summarize: (row) => ({
      title: row.name,
      detail: [row.phone, row.is_active ? null : copy.adminSetup.switchedOff]
        .filter(Boolean)
        .join(' · '),
    }),
  },
  'vehicle-owners': {
    isReadOnly: true,
    fields: [
      {
        name: 'owner_type',
        type: 'select',
        options: ['individual', 'company'],
        optionLabels: text.ownerTypes,
      },
      { name: 'full_name', type: 'text', isRequired: true },
      { name: 'phone', type: 'text', isRequired: true },
      { name: 'email', type: 'text' },
      { name: 'kra_pin', type: 'text' },
      { name: 'notes', type: 'textarea' },
    ],
    summarize: (row) => ({
      title: row.full_name,
      detail: [text.ownerTypes[row.owner_type], row.phone].filter(Boolean).join(' · '),
    }),
  },
  trackers: {
    isNested: true,
    createPath: (vehicleId) => `/admin/vehicles/${vehicleId}/trackers`,
    editPath: (id) => `/admin/trackers/${id}`,
    pagePath: (vehicleId) => `/admin/vehicles/${vehicleId}`,
    fields: [
      { name: 'provider', type: 'text', isRequired: true, isLockedOnEdit: true },
      { name: 'model', type: 'text' },
      { name: 'device_id', type: 'text', isRequired: true, isLockedOnEdit: true },
      { name: 'sim_number', type: 'text' },
      { name: 'installed_on', type: 'date' },
      { name: 'subscription_expires_on', type: 'date' },
      { name: 'notes', type: 'textarea' },
      {
        name: 'status',
        type: 'select',
        options: TRACKER_STATUSES,
        optionLabels: text.trackerStatuses,
        isEditOnly: true,
      },
    ],
    summarize: (row) => ({
      title: `${row.provider} · ${row.device_id}`,
      detail: [
        text.trackerStatuses[row.status],
        row.subscription_expires_on ? formatShortDate(row.subscription_expires_on) : null,
      ]
        .filter(Boolean)
        .join(' · '),
    }),
  },
  agreements: {
    isNested: true,
    isReadOnly: true,
    createPath: (ownerId) => `/admin/vehicle-owners/${ownerId}/agreements`,
    pagePath: () => '/admin/vehicles',
    fields: [
      { name: 'vehicle_id', type: 'hidden' },
      { name: 'commission_percent', type: 'number', isRequired: true },
      { name: 'starts_on', type: 'date', isRequired: true },
      { name: 'ends_on', type: 'date' },
      { name: 'notes', type: 'textarea' },
    ],
  },
}
