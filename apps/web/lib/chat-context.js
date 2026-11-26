import { nairobiDate } from '@carvo/shared'
import { carPath } from '@/lib/live-cars'

/** The days a booking covers, as the stay formatter takes them. */
export const bookingDays = ({ start_at: from, end_at: to }) => ({
  start: nairobiDate(from),
  end: nairobiDate(to),
})

// A company opens its own record of the car; a renter opens the car's public page, while it is listed.
const carLink = ({ car, vehicle_id: id }, side) => {
  if (side === 'company') return `/console/fleet/${id}`
  return car?.class_slug ? carPath({ id: car.id, class: { slug: car.class_slug } }) : null
}

/** Where the car and the reservation of a chat open, for one side. */
export function chatLinks(conversation, side) {
  const area = side === 'company' ? '/console' : '/account'
  const { booking } = conversation
  return {
    car: carLink(conversation, side),
    booking: booking ? `${area}/bookings/${booking.id}` : null,
  }
}
