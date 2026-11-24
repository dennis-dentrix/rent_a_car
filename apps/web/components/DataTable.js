import Link from 'next/link'
import { cx } from '@/lib/cx'

const cell = (column, row) => (column.render ? column.render(row) : row[column.key])

function PhoneCard({ columns, row, href }) {
  const [first, ...rest] = columns
  const Tag = href ? Link : 'div'
  return (
    <li>
      <Tag href={href} className="state-layer block w-full px-4 py-3 text-left">
        <span className="block text-body font-semibold">{cell(first, row)}</span>
        {rest.map((column) => (
          <span key={column.key} className="flex justify-between gap-4 text-callout">
            <span className="text-label-2">{column.label}</span>
            <span className="num">{cell(column, row)}</span>
          </span>
        ))}
      </Tag>
    </li>
  )
}

// The first cell holds the link and stretches over the row, so the whole row is one tap target and
// Enter opens it. A link also changes the URL, as navigation should.
function TableRow({ columns, row, href }) {
  return (
    <tr className={cx('relative h-row', href && 'hover:bg-bg-grouped')}>
      {columns.map((column, index) => (
        <td key={column.key} className="px-3">
          {index === 0 && href ? (
            <Link href={href} className="after:absolute after:inset-0">
              {cell(column, row)}
            </Link>
          ) : (
            cell(column, row)
          )}
        </td>
      ))}
    </tr>
  )
}

/** A card list on phones, a 32 px row table from tablet up. Pass `getRowHref` to make rows open a page. */
export default function DataTable({ columns, rows, getRowId, getRowHref }) {
  return (
    <>
      <ul className="divide-y divide-separator rounded-card border border-separator bg-surface md:hidden">
        {rows.map((row) => (
          <PhoneCard key={getRowId(row)} columns={columns} row={row} href={getRowHref?.(row)} />
        ))}
      </ul>
      <table className="hidden w-full text-staff-label md:table">
        <thead>
          <tr className="text-left text-staff-heading uppercase text-label-2">
            {columns.map((column) => (
              <th key={column.key} className="px-3 py-2 font-semibold">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-separator">
          {rows.map((row) => (
            <TableRow key={getRowId(row)} columns={columns} row={row} href={getRowHref?.(row)} />
          ))}
        </tbody>
      </table>
    </>
  )
}
