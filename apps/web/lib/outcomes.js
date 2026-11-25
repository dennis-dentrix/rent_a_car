/** The cancelled share of a week's confirmed bookings, as a whole percent. */
export const cancelledShare = ({ cancelled, confirmed }) =>
  confirmed ? Math.round((Number(cancelled) / Number(confirmed)) * 100) : 0
