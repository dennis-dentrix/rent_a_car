import { CONSOLE_RESOURCES } from '@/lib/console-resources'
import { RESOURCES } from '@/lib/admin-resources'

/** The kinds of record a screen set can edit: the admin's, or the operator's own. */
export const registryFor = (scope) => (scope === 'console' ? CONSOLE_RESOURCES : RESOURCES)

// Where a form's choices come from. The operator picks from the classes it can use, its own owners, and the places
// renters can choose (the public list); the admin picks from its own lists.
export const refPath = (scope, name) => {
  if (scope !== 'console') return `/admin/${name}`
  return {
    classes: '/operator/classes',
    'vehicle-owners': '/operator/vehicle-owners',
    locations: '/locations',
  }[name]
}
