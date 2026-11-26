import { INSPECTION_CHECKS } from '@carvo/shared'
import { copy } from '@/copy/en'

const text = copy.inspections

const CHOICES = [
  { value: 'ok', label: text.form.ok, on: 'peer-checked:bg-success-bg peer-checked:text-success' },
  {
    value: 'issue',
    label: text.form.issue,
    on: 'peer-checked:bg-error-bg peer-checked:text-error',
  },
]

// Neither answer is chosen in advance, so each part of the car is looked at on purpose.
function Check({ check }) {
  return (
    <fieldset className="flex items-center justify-between gap-3">
      <legend className="float-left">{text.checks[check]}</legend>
      <span className="flex gap-2">
        {CHOICES.map((choice) => (
          <label key={choice.value} className="cursor-pointer">
            <input
              type="radio"
              name={`check_${check}`}
              value={choice.value}
              required
              className="peer sr-only"
            />
            <span
              className={`flex min-h-touch min-w-[4.5rem] items-center justify-center rounded-control bg-fill px-3 md:min-w-[5.5rem] text-callout font-semibold transition-transform duration-fast active:scale-[0.97] peer-focus-visible:ring-2 peer-focus-visible:ring-accent ${choice.on}`}
            >
              {choice.label}
            </span>
          </label>
        ))}
      </span>
    </fieldset>
  )
}

/** The parts of the car to look at, each marked fine or a problem. */
export default function ChecklistField() {
  return (
    <div className="flex flex-col gap-3">
      {INSPECTION_CHECKS.map((check) => (
        <Check key={check} check={check} />
      ))}
    </div>
  )
}
