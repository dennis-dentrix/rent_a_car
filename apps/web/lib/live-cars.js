// Whether a car can be hired the way the renter chose. A car whose company said nothing is taken as self-drive.
const offersDriver = (car, service) => {
  if (service === 'chauffeur_driven') return ['chauffeur', 'both'].includes(car.chauffeur_option)
  return service !== 'self_drive' || car.chauffeur_option !== 'chauffeur'
}

const matchesWords = (car, words) =>
  [car.make, car.model, car.class?.name]
    .join(' ')
    .toLowerCase()
    .includes(words.trim().toLowerCase())

/**
 * The cars that match the search: the chosen type or types (a class's address word), gearbox, kind of driver, highest
 * daily price, and typed words. An empty choice matches everything.
 */
export function filterCars(cars, { type, types, gear, service, max, q }) {
  const wanted = [type, ...(types ? types.split(',') : [])].filter(Boolean)
  return cars.filter(
    (car) =>
      (!wanted.length || wanted.includes(car.class?.slug)) &&
      (!gear || car.transmission === gear) &&
      offersDriver(car, service) &&
      (!Number(max) || car.daily_rate_kes <= Number(max)) &&
      (!q || matchesWords(car, q)),
  )
}

/** The cars of one car type. */
export const carsOfType = (cars, slug) => cars.filter((car) => car.class?.slug === slug)

/**
 * Car types with a picture: one with no photo of its own borrows the cover of the newest real car of that type, so
 * a company's upload shows wherever its type does.
 */
export const withCarPhotos = (classes, cars) =>
  classes.map((item) => ({
    ...item,
    image_url:
      item.image_url ??
      carsOfType(cars, item.slug).find((car) => car.photo_paths.length)?.photo_paths[0] ??
      null,
  }))

/**
 * The car types worth showing: those with at least one car listed, which is when the type has a price. An empty type is
 * left out everywhere a renter chooses.
 */
export const listedTypes = (types = []) => types.filter((type) => type.price_per_day_kes !== null)

/** The address of one car's own page. A car whose type is not public has none. */
export const carPath = (car) => (car.class ? `/cars/${car.class.slug}/${car.id}` : null)

const priceOf = (car) => car.total_kes ?? car.daily_rate_kes

// A car without a price goes last whichever way the prices run.
const byPrice = (direction) => (a, b) => {
  const [first, second] = [priceOf(a), priceOf(b)]
  if (first === undefined || second === undefined)
    return (first === undefined) - (second === undefined)
  return (first - second) * direction
}

const ORDERS = {
  price_low: byPrice(1),
  price_high: byPrice(-1),
  newest: (a, b) => String(b.created_at).localeCompare(String(a.created_at)),
}

export const SORTS = Object.keys(ORDERS)

/** The results in the chosen order: lowest price first unless asked otherwise. */
export const sortCars = (cars, sort) => [...cars].sort(ORDERS[sort] ?? ORDERS.price_low)

/** The "types" choice after ticking or unticking one car type. */
export function toggledTypes(types, slug) {
  const chosen = types ? types.split(',') : []
  const next = chosen.includes(slug) ? chosen.filter((entry) => entry !== slug) : [...chosen, slug]
  return next.join(',')
}
