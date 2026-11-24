import Link from 'next/link'
import Badge from '@/components/Badge'
import ResourceForm from '@/components/ResourceForm'
import { copy } from '@/copy/en'

const text = copy.adminSetup

/** One record: its summary line, opening to its form. A native disclosure, so it works without scripts and by keyboard. */
function Row({ row, summary, formProps, isReadOnly }) {
  if (isReadOnly || summary.isLocked) {
    return (
      <li className="rounded-card bg-bg-grouped p-4">
        <span className="block text-headline">{summary.title}</span>
        <span className="block text-callout text-label-2">{summary.detail}</span>
      </li>
    )
  }
  return (
    <li>
      <details className="group rounded-card bg-bg-grouped p-4">
        <summary className="flex min-h-touch cursor-pointer list-none items-center justify-between gap-3">
          <span className="min-w-0">
            <span className="block truncate text-headline">{summary.title}</span>
            <span className="block text-callout text-label-2">{summary.detail}</span>
          </span>
          <Badge>{text.edit}</Badge>
        </summary>
        {summary.href && (
          <Link
            href={summary.href}
            className="mt-2 inline-block text-callout font-medium text-primary underline underline-offset-2"
          >
            {summary.linkLabel}
          </Link>
        )}
        <ResourceForm row={row} {...formProps} />
      </details>
    </li>
  )
}

/** The list of records, each with its edit form, under an "Add new" form. `summarize` turns a record into its two lines. */
export default function ResourceList({ rows, summarize, formProps, isReadOnly = false }) {
  return (
    <div className="flex flex-col gap-4">
      <details className="rounded-card border border-separator p-4">
        <summary className="flex min-h-touch cursor-pointer list-none items-center text-headline">
          {text.add}
        </summary>
        <ResourceForm row={null} {...formProps} />
      </details>
      {rows.length === 0 && <p className="text-body text-label-2">{text.empty}</p>}
      <ul className="flex flex-col gap-3">
        {rows.map((row) => (
          <Row
            key={row.id}
            row={row}
            summary={summarize(row)}
            formProps={formProps}
            isReadOnly={isReadOnly}
          />
        ))}
      </ul>
      {!isReadOnly && <p className="text-footnote text-label-3">{text.nothingIsDeleted}</p>}
    </div>
  )
}
