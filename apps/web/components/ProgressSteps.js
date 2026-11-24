import { cx } from '@/lib/cx'

/** "Step 2 of 4" with a bar, for the booking flow header. `current` counts from 0. */
export default function ProgressSteps({ steps, current, stepLabel }) {
  return (
    <div>
      <p className="text-callout font-medium">
        {stepLabel(current + 1, steps.length)}{' '}
        <span className="text-label-2">{steps[current]}</span>
      </p>
      <ol className="mt-2 flex gap-1" aria-hidden="true">
        {steps.map((step, index) => (
          <li
            key={step}
            className={cx('h-1 flex-1 rounded-pill', index <= current ? 'bg-accent' : 'bg-fill')}
          />
        ))}
      </ol>
    </div>
  )
}
