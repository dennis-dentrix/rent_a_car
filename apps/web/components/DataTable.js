import Link from 'next/link'
import { cx } from '@/lib/cx'

const cell = (column, row) => (column.render ? column.render(row) : row[column.key])

function PhoneCard({ columns, row, href }) {
  const [first, ...rest] = columns
  const Tag = href ? Link : 'div'
  return (
    <li>
      <Tag href={href} className="state-layer flex w-full flex-col gap-1.5 px-4 py-3 text-left">
        <span className="block">{cell(first, row)}</span>
        {rest.map((column) => (
          <span key={column.key} className="flex items-start justify-between gap-4">
            <span className="text-meta text-label-2">{column.label}</span>
            <span className="num text-right">{cell(column, row)}</span>
          </span>
        ))}
      </Tag>
    </li>
  )
}

// The first cell holds the link and stretches over the row, so the whole row is one tap target and Enter opens it.
// A column with `isAction` sits above that link, so its own buttons still work.
function TableRow({ columns, row, href }) {
  return (
    <tr className="relative transition-colors duration-fast hover:bg-bg-grouped">
      {columns.map((column, index) => (
        <td
          key={column.key}
          className={cx(
            'px-4 py-3 align-middle first:pl-5 last:pr-5',
            column.isEnd && 'num text-right',
            column.isAction && 'relative z-header',
          )}
        >
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

/** A card list on phones, a table from tablet up. Pass `getRowHref` to make rows open a page. */
export default function DataTable({ columns, rows, getRowId, getRowHref }) {
  return (
    <>
      <ul className="divide-y divide-separator text-cell md:hidden">
        {rows.map((row) => (
          <PhoneCard key={getRowId(row)} columns={columns} row={row} href={getRowHref?.(row)} />
        ))}
      </ul>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-cell">
          <thead>
            <tr className="bg-bg-grouped text-left text-micro uppercase text-label-2">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cx('px-4 py-3 first:pl-5 last:pr-5', column.isEnd && 'text-right')}
                >
                  {column.isAction ? <span className="sr-only">{column.label}</span> : column.label}
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
      </div>
    </>
  )
}
