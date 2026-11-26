// What is waiting for the person, and what has newly arrived since the last look.

export const NO_ALERTS = { unread_messages: 0, waiting_requests: 0, booking_updates: 0 }

/** The kinds that went up between two looks. Nothing on the first look: what was already there is not news. */
export const newArrivals = (before, after) =>
  before ? Object.keys(NO_ALERTS).filter((kind) => after[kind] > before[kind]) : []

export const totalAlerts = (alerts) =>
  Object.keys(NO_ALERTS).reduce((sum, kind) => sum + alerts[kind], 0)

/** The tab's title with how many things wait in front, as mail apps do. */
export function titleWithCount(title, count) {
  const plain = title.replace(/^\(\d+\) /, '')
  return count ? `(${count}) ${plain}` : plain
}
