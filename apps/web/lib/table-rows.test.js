import { describe, expect, it } from 'vitest'
import { filterPills, visibleRows } from './table-rows.js'

const items = [
  {
    title: 'Toyota Prado',
    tags: ['active'],
    cells: { vehicle: { main: 'Prado', code: 'KDA 001A' } },
  },
  { title: 'Nissan Note', tags: ['maintenance'], cells: { class: 'Compact' } },
]

describe('table search and filters', () => {
  it('finds a row by any word shown in it, in either case', () => {
    expect(visibleRows(items, { query: 'kda 001', filter: 'all' })).toEqual([items[0]])
    expect(visibleRows(items, { query: 'compact', filter: 'all' })).toEqual([items[1]])
  })

  it('narrows to the chosen filter', () => {
    expect(visibleRows(items, { query: '', filter: 'maintenance' })).toEqual([items[1]])
  })

  it('counts each filter and leaves out the empty ones', () => {
    const filters = [
      { key: 'active', label: 'Active' },
      { key: 'retired', label: 'Retired' },
    ]
    expect(filterPills(items, filters, 'All').map((pill) => [pill.label, pill.count])).toEqual([
      ['All', 2],
      ['Active', 1],
    ])
  })
})
