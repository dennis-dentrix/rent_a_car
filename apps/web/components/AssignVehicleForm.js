'use client'

import { useActionState } from 'react'
import { assignVehicleAction } from '@/app/admin/actions'
import Alert from '@/components/Alert'
import Button from '@/components/Button'
import Select from '@/components/Select'
import SubmitButton from '@/components/SubmitButton'
import { copy } from '@/copy/en'

const text = copy.adminFleet.assign

const choices = (blank, items) => [
  { value: '', label: blank },
  ...items.map((item) => ({ value: item.id, label: item.label })),
]

// A delivery cannot be saved without someone to take the car, so with no drivers the way forward is to add one.
function NoDrivers() {
  return (
    <div className="mt-2 flex flex-col items-start gap-3">
      <p className="text-cell text-label-2">{text.noDrivers}</p>
      <Button href="/admin/setup/drivers" variant="tonal" size="compact">
        {text.addDriver}
      </Button>
    </div>
  )
}

/**
 * Puts a car of the booked class on a booking and, for a delivery, the driver who takes it. `vehicles` and `drivers` are
 * { id, label }; `drivers` is null for an office pickup. `current` holds what the booking has now.
 */
export default function AssignVehicleForm({ bookingId, vehicles, drivers, current }) {
  const [state, run] = useActionState(assignVehicleAction, null)
  if (!vehicles.length) return <p className="mt-2 text-cell text-label-2">{text.empty}</p>
  if (drivers && !drivers.length) return <NoDrivers />
  return (
    <form action={run} className="mt-3 flex flex-col gap-3">
      <input type="hidden" name="id" value={bookingId} />
      {state?.error && <Alert tone="error" title={state.error} />}
      {state?.status === 'done' && <Alert tone="success" title={text.done} />}
      {/* Keyed by the saved value: the browser resets a sent form to what it first showed, which would be stale. */}
      <Select
        key={`car-${current.vehicleId}`}
        label={text.label}
        name="vehicle_id"
        required
        defaultValue={current.vehicleId}
        options={choices(text.none, vehicles)}
      />
      {drivers && (
        <Select
          key={`driver-${current.driverId}`}
          label={text.driver}
          name="driver_id"
          required
          defaultValue={current.driverId}
          options={choices(text.noDriver, drivers)}
        />
      )}
      <SubmitButton isFullWidth={false}>{text.submit}</SubmitButton>
    </form>
  )
}
