/** The cars that match the chosen type (a class's address word) and gearbox. An empty choice matches everything. */
export const filterCars = (cars, { type, gear }) =>
  cars.filter((car) => (!type || car.class?.slug === type) && (!gear || car.transmission === gear))

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

/** The address of one car's own page. A car whose type is not public has none. */
export const carPath = (car) => (car.class ? `/cars/${car.class.slug}/${car.id}` : null)
