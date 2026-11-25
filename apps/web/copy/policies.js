// A rental company's rules: the form's labels and the words each choice becomes.
export const policies = {
  allCars: 'All cars (general)',
  minDays: (n) => `At least ${n} ${n === 1 ? 'day' : 'days'}`,
  minAge: (n) => `Drivers ${n} or older`,
  kmLimit: (n) => `${n.toLocaleString('en-KE')} km a day`,
  crossBorder: {
    not_allowed: 'No travel outside Kenya',
    with_permission: 'Outside Kenya only with written permission',
    allowed: 'Travel outside Kenya allowed',
  },
  fuel: {
    same_level: 'Return with the same fuel level',
    full_to_full: 'Collect full, return full',
    prepaid: 'Fuel paid in advance',
  },
  page: {
    title: 'Policies',
    subtitle:
      'Your rental rules, for all cars or for one class. A class rule replaces the general one where it sets something. Shown on your records; bookings are not blocked by them yet.',
    fields: {
      class_id: 'Applies to',
      min_hire_days: 'Minimum rental days',
      min_age: 'Minimum driver age',
      cross_border: 'Travel outside Kenya',
      daily_km_limit: 'Daily distance limit (km, empty for no limit)',
      fuel_policy: 'Fuel',
      rules: 'Other rules, one per line',
    },
  },
}
