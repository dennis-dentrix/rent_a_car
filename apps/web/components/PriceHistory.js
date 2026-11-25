import ResourceList from '@/components/ResourceList'
import { copy } from '@/copy/en'
import { CONSOLE_RESOURCES } from '@/lib/console-resources'

const text = copy.classPrices

/** Every dated price of the company's, for planning a later one, ending one, or looking back. Closed until wanted. */
export default function PriceHistory({ rates, classes }) {
  const { fields, summarize } = CONSOLE_RESOURCES.rates
  const names = { classes: new Map(classes.map((item) => [item.id, item.name])) }
  const formProps = {
    resource: 'rates',
    scope: 'console',
    fields,
    labels: copy.adminSetup.resources.rates.fields,
    refs: { classes },
  }
  return (
    <details className="rounded-panel border border-separator bg-surface p-4">
      <summary className="min-h-touch cursor-pointer list-none">
        <span className="block text-section">{text.history}</span>
        <span className="block text-meta text-label-2">{text.historyHint}</span>
      </summary>
      <div className="pt-3">
        <ResourceList
          rows={rates}
          summarize={(row) => summarize(row, names)}
          formProps={formProps}
        />
      </div>
    </details>
  )
}
