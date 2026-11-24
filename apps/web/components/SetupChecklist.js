import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { copy } from '@/copy/en'

const text = copy.operatorConsole.today

// What a new company does first, in order. A step disappears once it is done, so the list is the work left.
const STEPS = [
  ['company', (overview) => overview.company.is_complete],
  ['vehicle', (overview) => overview.vehicles_total > 0],
  ['rate', (overview) => overview.rates > 0],
  ['service', (overview) => overview.services > 0],
]

/** The steps still to do before the company can rent out cars, each a large link into the page that does it. */
export default function SetupChecklist({ overview }) {
  const remaining = STEPS.filter(([, isDone]) => !isDone(overview)).map(([key]) => text.steps[key])
  if (!remaining.length) return null
  return (
    <section aria-labelledby="set-up" className="flex flex-col gap-3">
      <div>
        <h2 id="set-up" className="text-title-3">
          {text.setUpTitle}
        </h2>
        <p className="text-callout text-label-2">{text.setUpHint}</p>
      </div>
      <ol className="divide-y divide-separator overflow-hidden rounded-card border border-separator bg-surface">
        {remaining.map((step, index) => (
          <li key={step.href}>
            <Link
              href={step.href}
              className="state-layer flex min-h-touch items-center gap-4 px-4 py-3"
            >
              <span className="num flex h-8 w-8 shrink-0 items-center justify-center rounded-pill bg-accent-subtle text-callout font-semibold text-accent">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-body font-semibold">{step.title}</span>
                <span className="block text-callout text-label-2">{step.hint}</span>
              </span>
              <ChevronRight size={18} className="shrink-0 text-label-3" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ol>
    </section>
  )
}
