import { Check } from 'lucide-react'
import DeliveryProgress from '@/components/DeliveryProgress'
import { copy } from '@/copy/en'
import { momentText } from '@/lib/admin-format'
import { cx } from '@/lib/cx'

const text = copy.journey

const DOT = {
  done: 'bg-success-bg text-success',
  current: 'bg-accent text-on-accent',
  upcoming: 'border border-separator bg-surface',
}

function Step({ step, isLast }) {
  return (
    <li
      className="relative flex gap-3 pb-5 last:pb-0"
      aria-current={step.state === 'current' ? 'step' : undefined}
    >
      {!isLast && (
        <span className="absolute bottom-0 left-3 top-6 w-px bg-separator" aria-hidden="true" />
      )}
      <span
        className={cx(
          'relative flex h-6 w-6 shrink-0 items-center justify-center rounded-pill',
          DOT[step.state],
        )}
      >
        {step.state === 'done' && <Check size={14} aria-hidden="true" />}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={cx(
            'block',
            step.state === 'upcoming' ? 'text-body text-label-2' : 'text-headline',
          )}
        >
          {text.steps[step.key]}
          {step.state === 'current' && (
            <span className="ml-2 rounded-pill bg-accent-subtle px-2 py-0.5 text-footnote text-accent">
              {text.now}
            </span>
          )}
        </span>
        {step.at && (
          <span className="num block text-footnote text-label-2">{momentText(step.at)}</span>
        )}
      </span>
    </li>
  )
}

function Next({ next }) {
  return (
    <div className="rounded-card bg-accent-subtle p-4">
      <p className="text-footnote font-semibold text-primary">
        {text.next} · {next.actor === 'renter' ? text.yourTurn : text.theirTurn}
      </p>
      <p className="text-body">{text.nextForRenter[next.key]}</p>
    </div>
  )
}

/**
 * A booking's steps, the one it is at, what happens next and whose turn it is, and when it last changed, so it never
 * looks frozen. `forRenter` adds the "what next" card, which is worded to the renter.
 */
export default function BookingJourney({ journey, forRenter = false }) {
  if (journey.ended) {
    return <p className="rounded-card bg-bg-grouped p-4 text-body">{text.ended[journey.ended]}</p>
  }
  return (
    <div className="flex flex-col gap-4">
      {forRenter && journey.next && <Next next={journey.next} />}
      {journey.delivery && <DeliveryProgress state={journey.delivery} />}
      <ol>
        {journey.steps.map((step, index) => (
          <Step key={step.key} step={step} isLast={index === journey.steps.length - 1} />
        ))}
      </ol>
      <p className="num text-footnote text-label-2">
        {text.updated(momentText(journey.updated_at))}
      </p>
    </div>
  )
}
