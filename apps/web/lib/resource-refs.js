import { nairobiDate } from '@carvo/shared'
import { adminGet } from '@/lib/admin'
import { getClasses } from '@/lib/catalogue'
import { classRates } from '@/lib/class-rates'
import { refPath } from '@/lib/resource-scopes'

async function loadClassRates(scope, token) {
  const [classes, own] = await Promise.all([
    getClasses(),
    scope === 'console' ? adminGet('/operator/rates', token, { limit: 100 }) : { data: [] },
  ])
  return classRates(classes.data ?? [], own.data ?? [], nairobiDate(new Date()))
}

const loadChoices = async (scope, name, token) => {
  const { data } = await adminGet(refPath(scope, name), token, { limit: 100 })
  return (data ?? []).map((record) => ({ id: record.id, name: record.name ?? record.full_name }))
}

/**
 * Other records a form refers to (the classes a car belongs to), each as an id and something to show. `classRates` is
 * not a list of choices but what each class costs per day.
 */
export async function loadRefs(scope, needs = [], token) {
  const entries = await Promise.all(
    needs.map(async (name) => [
      name,
      await (name === 'classRates'
        ? loadClassRates(scope, token)
        : loadChoices(scope, name, token)),
    ]),
  )
  return Object.fromEntries(entries)
}
