'use client'

import Link from 'next/link'
import { useState } from 'react'
import DataTable from '@/components/DataTable'
import Drawer from '@/components/Drawer'
import ResourceForm from '@/components/ResourceForm'
import TableCell from '@/components/TableCell'
import TableToolbar from '@/components/TableToolbar'
import { copy } from '@/copy/en'
import { filterPills, visibleRows } from '@/lib/table-rows'

const text = copy.consoleUi
const ACTION =
  'whitespace-nowrap rounded-control px-3 py-1.5 text-meta font-bold text-primary hover:bg-fill'

const PLAIN_COLUMNS = [
  { key: 'title', label: text.name },
  { key: 'detail', label: text.details },
]

function RowActions({ item, onEdit }) {
  return (
    <span className="inline-flex items-center justify-end gap-1">
      {item.href && (
        <Link href={item.href} className={ACTION}>
          {item.linkLabel}
        </Link>
      )}
      {onEdit && !item.isLocked && (
        <button type="button" onClick={() => onEdit(item)} className={ACTION}>
          {text.edit}
        </button>
      )}
    </span>
  )
}

function tableColumns(columns, onEdit) {
  const shown = (columns ?? PLAIN_COLUMNS).map((column, index) => ({
    ...column,
    render: (item) => {
      const value = item.cells?.[column.key] ?? item[column.key]
      return <TableCell value={index === 0 && !item.cells ? { main: value } : value} />
    },
  }))
  const action = { key: 'actions', label: text.actions, isAction: true, isEnd: true }
  return [...shown, { ...action, render: (item) => <RowActions item={item} onEdit={onEdit} /> }]
}

/**
 * The records of one kind as a searchable table, with a drawer that adds a record or edits one. `items` are the rows
 * already summed up by the server; `formProps` is what the form needs, and without it the table only reads.
 */
export default function ResourceTable({ items, columns, filters = [], formProps }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [editing, setEditing] = useState(null)
  const rows = visibleRows(items, { query, filter })
  const isNew = editing === 'new'
  return (
    <div className="overflow-hidden rounded-panel border border-separator bg-surface shadow-1">
      <TableToolbar
        query={query}
        onQuery={setQuery}
        onAdd={formProps && (() => setEditing('new'))}
        pills={filterPills(items, filters, text.all)}
        filter={filter}
        onFilter={setFilter}
      />
      <DataTable
        columns={tableColumns(columns, formProps && setEditing)}
        rows={rows}
        getRowId={(item) => item.id}
      />
      {rows.length === 0 && (
        <p className="px-5 py-10 text-center text-cell text-label-2">
          {items.length ? text.noMatch : copy.adminSetup.empty}
        </p>
      )}
      <p className="border-t border-separator bg-bg-grouped px-5 py-2.5 text-meta text-label-2">
        {text.showing(rows.length, items.length)}
      </p>
      <Drawer
        isOpen={editing !== null}
        onClose={() => setEditing(null)}
        title={isNew ? text.add : (editing?.title ?? '')}
      >
        {editing !== null && <ResourceForm row={isNew ? null : editing.row} {...formProps} />}
      </Drawer>
    </div>
  )
}
