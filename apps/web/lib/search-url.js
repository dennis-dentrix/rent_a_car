import { DEFAULT_PICKUP_TIME, END_OF_DAY } from '@/lib/stay-times'
import { withParams } from '@/lib/query'

/** What the search form holds before anything is chosen. */
export const emptySearch = () => ({
  service: '',
  types: [],
  pickup: '',
  dropoff: '',
  place: '',
  passengers: '2',
  cars: '1',
  stay: { start: null, end: null, startTime: DEFAULT_PICKUP_TIME, endTime: DEFAULT_PICKUP_TIME },
  when: { date: '', time: DEFAULT_PICKUP_TIME },
})

/** True when the date the chosen service needs has been picked. */
export const hasSearchDate = (group, values) =>
  group === 'car_hire' ? Boolean(values.stay.start) : Boolean(values.when.date)

const stayParams = ({ start, end, startTime, endTime }) => ({
  start,
  end: end ?? start,
  startTime,
  endTime,
})

// A transfer or an event is one day with a start time; it is searched until the end of that day.
const dayParams = ({ date, time }) => ({
  start: date,
  end: date,
  startTime: time,
  endTime: END_OF_DAY,
})

/** The /cars address for a search: car hire carries a range, a transfer or an event one day. */
export function buildSearchUrl(group, values, extra = {}) {
  const { service } = values
  const types = values.types.join(',')
  if (group === 'car_hire') {
    return withParams('/cars', {
      ...extra,
      service,
      types,
      pickup: values.pickup,
      dropoff: values.dropoff,
      ...stayParams(values.stay),
    })
  }
  const details =
    group === 'transfers'
      ? { pickup: values.pickup, dropoff: values.dropoff, passengers: values.passengers }
      : { place: values.place, cars: values.cars }
  return withParams('/cars', { ...extra, service, types, ...details, ...dayParams(values.when) })
}
