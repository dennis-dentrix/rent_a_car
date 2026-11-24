import { LOCATION_TYPES, formatMoney, formatShortDate } from '@rent-a-car/shared'
import { copy } from '@/copy/en'
import { FLEET_RESOURCES } from '@/lib/admin-fleet-resources'

const text = copy.adminSetup
const describe = text.describe

// One entry per kind of record the admin maintains. The API route is `/admin/<key>`. A field says how it is entered
// (`type`), whether a blank on edit clears it (`isClearable`), and whether it cannot change after creation.
export const PRICE_RESOURCES = {
  classes: {
    fields: [
      { name: 'name', type: 'text', isRequired: true },
      { name: 'slug', type: 'text', isRequired: true },
      { name: 'seats', type: 'number', isRequired: true },
      { name: 'luggage_capacity', type: 'number' },
      { name: 'description', type: 'textarea', isClearable: true },
      { name: 'best_for', type: 'list' },
      { name: 'is_public', type: 'boolean', isOnByDefault: true },
      { name: 'sort_order', type: 'number' },
    ],
    summarize: (row) => ({
      title: row.name,
      detail: [describe.seats(row.seats), row.is_public ? null : text.hidden]
        .filter(Boolean)
        .join(' · '),
    }),
  },
  rates: {
    needs: ['classes'],
    fields: [
      { name: 'class_id', type: 'select', ref: 'classes', isRequired: true, isLockedOnEdit: true },
      { name: 'price_kes', type: 'number', isRequired: true },
      { name: 'usd_override', type: 'number', isClearable: true },
      { name: 'effective_from', type: 'date', isRequired: true },
      { name: 'effective_to', type: 'date', isClearable: true },
    ],
    summarize: (row, refs) => ({
      title: `${refs.classes.get(row.class_id) ?? '—'} · ${formatMoney(row.price_kes)} ${describe.perDay}`,
      detail: [
        describe.from(formatShortDate(row.effective_from)),
        row.effective_to ? describe.until(formatShortDate(row.effective_to)) : text.noEnd,
      ].join(' · '),
    }),
  },
  discounts: {
    needs: ['classes'],
    fields: [
      {
        name: 'class_id',
        type: 'select',
        ref: 'classes',
        isClearable: true,
        blankLabel: text.allClasses,
      },
      { name: 'label', type: 'text', isRequired: true },
      { name: 'min_days', type: 'number', isRequired: true },
      {
        name: 'kind',
        type: 'select',
        options: ['percent', 'fixed'],
        optionLabels: text.kinds,
        isRequired: true,
      },
      { name: 'value', type: 'number', isRequired: true },
      { name: 'effective_from', type: 'date', isRequired: true },
      { name: 'effective_to', type: 'date', isClearable: true },
      { name: 'is_active', type: 'boolean', isOnByDefault: true },
    ],
    summarize: (row, refs) => ({
      title: row.label,
      detail: [
        describe.minDays(row.min_days),
        row.kind === 'percent'
          ? describe.percentOff(row.value)
          : describe.amountOff(formatMoney(row.value)),
        refs.classes.get(row.class_id) ?? text.allClasses,
        row.is_active ? null : text.switchedOff,
      ]
        .filter(Boolean)
        .join(' · '),
    }),
  },
  extras: {
    fields: [
      { name: 'name', type: 'text', isRequired: true },
      { name: 'price_kes', type: 'number', isRequired: true },
      {
        name: 'pricing_type',
        type: 'select',
        options: ['per_day', 'per_booking'],
        isRequired: true,
      },
      { name: 'is_active', type: 'boolean', isOnByDefault: true },
    ],
    summarize: (row) => ({
      title: row.name,
      detail: [
        `${formatMoney(row.price_kes)} ${row.pricing_type === 'per_day' ? describe.perDay : describe.perBooking}`,
        row.is_active ? null : text.switchedOff,
      ]
        .filter(Boolean)
        .join(' · '),
    }),
  },
  'delivery-zones': {
    fields: [
      { name: 'name', type: 'text', isRequired: true },
      { name: 'fee_kes', type: 'number', isRequired: true },
      { name: 'is_active', type: 'boolean', isOnByDefault: true },
    ],
    summarize: (row) => ({
      title: row.name,
      detail: [formatMoney(row.fee_kes), row.is_active ? null : text.switchedOff]
        .filter(Boolean)
        .join(' · '),
    }),
  },
  locations: {
    fields: [
      { name: 'name', type: 'text', isRequired: true },
      {
        name: 'type',
        type: 'select',
        options: LOCATION_TYPES,
        optionLabels: text.locationTypes,
        isRequired: true,
      },
      { name: 'address', type: 'text', isRequired: true },
      { name: 'slug', type: 'text', isRequired: true },
      { name: 'latitude', type: 'number', isClearable: true },
      { name: 'longitude', type: 'number', isClearable: true },
      { name: 'entrance_note', type: 'textarea', isClearable: true },
      { name: 'is_served', type: 'boolean', isOnByDefault: true },
    ],
    summarize: (row) => ({
      title: row.name,
      detail: [text.locationTypes[row.type], row.address, row.is_served ? null : text.hidden]
        .filter(Boolean)
        .join(' · '),
    }),
  },
}

export const RESOURCES = { ...PRICE_RESOURCES, ...FLEET_RESOURCES }

// Where the API lives and which page to refresh, for the admin's screens and for the operator's console.
const SCOPES = {
  admin: { api: '/admin', page: '/admin/setup' },
  console: { api: '/operator', page: '/console' },
}

/** Where a kind of record is listed, created, and changed in the API, unless its definition says otherwise. */
export const resourcePaths = (key, definition, scope = 'admin') => ({
  list: definition.listPath ?? `${SCOPES[scope].api}/${key}`,
  create: (parent) => definition.createPath?.(parent) ?? `${SCOPES[scope].api}/${key}`,
  edit: (id) => definition.editPath?.(id) ?? `${SCOPES[scope].api}/${key}/${id}`,
  page: (parent) => definition.pagePath?.(parent) ?? `${SCOPES[scope].page}/${key}`,
})

const isBlank = (value) => value === undefined || value === null || String(value).trim() === ''

// What one field sends. Blank means "not given" on create, and "clear it" on edit for a field that may be cleared.
function fieldValue(field, formData, isEdit) {
  const raw = formData.get(field.name)
  if (field.type === 'boolean') return formData.has(field.name)
  if (isBlank(raw)) return isEdit && field.isClearable ? null : undefined
  const value = String(raw).trim()
  if (field.type === 'number') return Number.isFinite(Number(value)) ? Number(value) : value
  if (field.type === 'list')
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  return value
}

/** The request body for a form. A field that cannot change after creation is left out of an edit. */
export function buildBody(fields, formData, isEdit) {
  const entries = fields
    .filter((field) => (isEdit ? !field.isLockedOnEdit : !field.isEditOnly))
    .map((field) => [field.name, fieldValue(field, formData, isEdit)])
    .filter(([, value]) => value !== undefined)
  return Object.fromEntries(entries)
}

/** What a form field starts with: the record's value when editing, the field's own default when adding. */
export function startingValue(field, row) {
  if (!row) return field.isOnByDefault ?? ''
  const value = row[field.name]
  if (Array.isArray(value)) return value.join(', ')
  return value ?? (field.type === 'boolean' ? false : '')
}
