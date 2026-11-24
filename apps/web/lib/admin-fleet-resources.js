import { formatShortDate } from '@rent-a-car/shared'
import { copy } from '@/copy/en'

const text = copy.adminFleet
const VEHICLE_STATUSES = ['active', 'maintenance', 'retired']
const TRACKER_STATUSES = ['active', 'inactive', 'faulty', 'removed']

const vehicleTitle = (row) =>
  `${[row.make, row.model].filter(Boolean).join(' ') || text.noMake} · ${row.registration}`

// The fleet's kinds of record, in the same form as the price and place ones. A `parent` is the record a new one
// belongs to (a tracker's vehicle); `pagePath` is the page to refresh once one is saved.
export const FLEET_RESOURCES = {
  vehicles: {
    needs: ['classes', 'locations', 'vehicle-owners'],
    listPath: '/staff/vehicles',
    fields: [
      { name: 'registration', type: 'text', isRequired: true },
      { name: 'chassis_number', type: 'text', isRequired: true },
      { name: 'make', type: 'text' },
      { name: 'model', type: 'text' },
      { name: 'year', type: 'number' },
      { name: 'class_id', type: 'select', ref: 'classes', isRequired: true },
      { name: 'mileage_km', type: 'number' },
      { name: 'home_location_id', type: 'select', ref: 'locations' },
      {
        name: 'owner_id',
        type: 'select',
        ref: 'vehicle-owners',
        isClearable: true,
        blankLabel: text.noOwnerOption,
      },
      {
        name: 'status',
        type: 'select',
        options: VEHICLE_STATUSES,
        optionLabels: text.statuses,
        isEditOnly: true,
      },
    ],
    summarize: (row, refs) => ({
      title: vehicleTitle(row),
      detail: [
        refs.classes.get(row.class_id),
        text.statuses[row.status],
        row.owner_id ? text.partner : null,
      ]
        .filter(Boolean)
        .join(' · '),
      href: `/admin/vehicles/${row.id}`,
      linkLabel: text.openVehicle,
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
