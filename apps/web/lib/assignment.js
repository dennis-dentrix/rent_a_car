// Which bookings let the admin choose a car and driver, and what the two pickers offer.

const OPEN_STATUSES = ['pending_payment', 'confirmed', 'ready']

/** A trip that has not started needs this when it has no car, or when someone has to deliver it. */
export const needsAssignment = (booking) =>
  OPEN_STATUSES.includes(booking.status) &&
  (!booking.vehicle || booking.handover.type === 'delivery')

export const vehicleOptions = (booking, vehicles = []) =>
  vehicles
    .filter((car) => car.class_id === booking.class_id && car.status === 'active')
    .map((car) => ({
      id: car.id,
      label: `${[car.make, car.model].filter(Boolean).join(' ')} ${car.registration}`.trim(),
    }))

export const driverOptions = (drivers = []) =>
  drivers
    .filter((driver) => driver.is_active)
    .map((driver) => ({ id: driver.id, label: `${driver.name} · ${driver.phone}` }))
