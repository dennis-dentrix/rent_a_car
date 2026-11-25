import Link from 'next/link'
import { Check, ChevronRight } from 'lucide-react'
import Panel from '@/components/Panel'
import { copy } from '@/copy/en'
import { setupSteps } from '@/lib/setup-steps'
import { cx } from '@/lib/cx'

const text = copy.operatorConsole.today

function Step({ step, number }) {
  return (
    <li>
      <Link href={step.href} className="state-layer flex min-h-touch items-center gap-3 px-5 py-3">
        <span
          className={cx(
            'num flex h-7 w-7 shrink-0 items-center justify-center rounded-pill text-meta font-bold',
            step.isDone ? 'bg-success-bg text-success' : 'bg-accent-subtle text-accent',
          )}
        >
          {step.isDone ? <Check size={14} aria-label={text.done} /> : number}
        </span>
        <span className="min-w-0 flex-1">
          <span className={cx('block font-bold', step.isDone && 'text-label-2')}>{step.title}</span>
          <span className="block text-meta text-label-2">{step.hint}</span>
        </span>
        <ChevronRight size={16} className="shrink-0 text-label-3" aria-hidden="true" />
      </Link>
    </li>
  )
}

/** What a company does before it can rent out cars, with the finished steps ticked. Gone once all are done. */
export default function SetupChecklist({ overview }) {
  const steps = setupSteps(overview)
  if (steps.every((step) => step.isDone)) return null
  return (
    <Panel title={text.setUpTitle} hint={text.setUpHint} isFlush>
      <ol className="divide-y divide-separator">
        {steps.map((step, index) => (
          <Step key={step.href} step={step} number={index + 1} />
        ))}
      </ol>
    </Panel>
  )
}
