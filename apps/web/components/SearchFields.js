'use client'

import { CarFront, Flag, MapPin, Plane, Users } from 'lucide-react'
import DatesField from '@/components/DatesField'
import DayField from '@/components/DayField'
import Options from '@/components/Options'
import PlaceField from '@/components/PlaceField'
import SearchCell, { BARE } from '@/components/SearchCell'
import { copy } from '@/copy/en'

const counts = (max, label) =>
  Array.from({ length: max }, (_, index) => ({ value: String(index + 1), label: label(index + 1) }))

// The value and change handler for one part of the search, so each cell is a single short line.
const bind = ({ values, set }, key) => ({
  value: values[key],
  onChange: (value) => set(key, value),
})

export function SelectCell({ icon, label, options, value, onChange }) {
  return (
    <SearchCell icon={icon} label={label}>
      {(id) => (
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={BARE}
        >
          <Options options={options} />
        </select>
      )}
    </SearchCell>
  )
}

// A place the renter types, with suggestions from our own places and from the map service.
function TypedPlace({ form, field, icon, label, placeholder, known }) {
  return (
    <PlaceField
      icon={icon}
      label={label}
      placeholder={placeholder}
      known={known}
      {...bind(form, field)}
    />
  )
}

export function PickupCell({ form, search }) {
  return (
    <TypedPlace
      form={form}
      field="pickup"
      icon={MapPin}
      label={copy.search.pickup}
      placeholder={copy.search.pickupPlaceholder}
      known={search.places}
    />
  )
}

export function DestinationCell({ form, search }) {
  return (
    <TypedPlace
      form={form}
      field="dropoff"
      icon={Flag}
      label={copy.search.destination}
      placeholder={copy.search.destinationPlaceholder}
      known={search.places}
    />
  )
}

// The airports and airstrips, for an airport transfer: a list to choose from, not a box to type in.
function AirportCell({ form, airports }) {
  const options = [{ value: '', label: copy.search.chooseAirport }, ...airports]
  return (
    <SelectCell
      icon={Plane}
      label={copy.search.airport}
      options={options}
      {...bind(form, 'pickup')}
    />
  )
}

function WhenCell({ form, error }) {
  return <DayField {...bind(form, 'when')} error={error} />
}

/** How many cells each line shows, so the strip can sit on one row with equal columns. */
export const FIELD_COUNTS = { car_hire: 3, transfers: 4, events: 3 }

/** The trip details for each service line. `form` is { values, set }; `set(key, value)` updates one part. */
export function CarHireFields({ form, search, error }) {
  const { values, set } = form
  return (
    <>
      <PickupCell form={form} search={search} />
      <DestinationCell form={form} search={search} />
      <DatesField
        stay={values.stay}
        onChange={(stay) => set('stay', { ...values.stay, ...stay })}
        error={error}
      />
    </>
  )
}

// An airport transfer starts at an airport or airstrip; any other transfer starts wherever the renter types.
export function TransferFields({ form, search, error }) {
  const isAirport = form.values.service === 'airport_transfer'
  return (
    <>
      {isAirport ? (
        <AirportCell form={form} airports={search.airports} />
      ) : (
        <PickupCell form={form} search={search} />
      )}
      <DestinationCell form={form} search={search} />
      <WhenCell form={form} error={error} />
      <SelectCell
        icon={Users}
        label={copy.search.passengers}
        options={counts(14, copy.search.passengerCount)}
        {...bind(form, 'passengers')}
      />
    </>
  )
}

export function EventFields({ form, search, error }) {
  return (
    <>
      <TypedPlace
        form={form}
        field="place"
        icon={MapPin}
        label={copy.search.eventPlace}
        placeholder={copy.search.eventPlacePlaceholder}
        known={search.places}
      />
      <WhenCell form={form} error={error} />
      <SelectCell
        icon={CarFront}
        label={copy.search.carsNeeded}
        options={counts(10, copy.search.carCount)}
        {...bind(form, 'cars')}
      />
    </>
  )
}
