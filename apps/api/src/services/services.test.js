import { readFileSync } from 'node:fs'
import { SERVICE_GROUPS } from '@rent-a-car/shared'
import { describe, expect, it } from 'vitest'

// The database holds the services as rows and the shared package as a list; one test keeps the two equal.
const sqlRows = () => {
  const sql = readFileSync(
    new URL('../../../../supabase/migrations/20261123000001_services.sql', import.meta.url),
    'utf8',
  )
  const block = sql.match(/insert into services[\s\S]*?;/)[0]
  return [...block.matchAll(/\('(\w+)', '(\w+)', \d+\)/g)].map(([, id, group]) => `${group}:${id}`)
}

describe('services', () => {
  it('are the same in the migration and the shared package, with the same groups', () => {
    const shared = Object.entries(SERVICE_GROUPS).flatMap(([group, ids]) =>
      ids.map((id) => `${group}:${id}`),
    )
    expect(sqlRows().sort()).toEqual(shared.sort())
  })
})
