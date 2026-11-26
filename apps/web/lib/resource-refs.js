import { adminGet } from '@/lib/admin'
import { refPath } from '@/lib/resource-scopes'

// A company chooses from the admin's classes only, and sees which cars belong in each.
const isOffered = (scope, record) => scope !== 'console' || !record.operator_id
const choiceName = (scope, record) => {
  const name = record.name ?? record.full_name
  const examples = scope === 'console' ? (record.example_models ?? []) : []
  return examples.length ? `${name} (${examples.join(', ')})` : name
}

const loadChoices = async (scope, name, token) => {
  const { data } = await adminGet(refPath(scope, name), token, { limit: 100 })
  return (data ?? [])
    .filter((record) => isOffered(scope, record))
    .map((record) => ({ id: record.id, name: choiceName(scope, record) }))
}

/** Other records a form refers to (the classes a car belongs to), each as an id and something to show. */
export async function loadRefs(scope, needs = [], token) {
  const entries = await Promise.all(
    needs.map(async (name) => [name, await loadChoices(scope, name, token)]),
  )
  return Object.fromEntries(entries)
}
