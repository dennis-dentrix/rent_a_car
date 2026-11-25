// A hire in one of these is over, whatever its dates say.
const FINISHED = ['returned', 'closed', 'cancelled', 'expired']

/** The hire to put first: the soonest one that is not finished. Null when there is none. */
export const nextHire = (bookings) =>
  bookings
    .filter((booking) => !FINISHED.includes(booking.status))
    .sort((a, b) => a.start_at.localeCompare(b.start_at))[0] ?? null
