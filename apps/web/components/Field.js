import { useId } from 'react'
import { CircleAlert } from 'lucide-react'
import { cx } from '@/lib/cx'

// The size of text typed or picked in a field: 16 px on phones, because iOS zooms the page for anything smaller.
export const TYPED_TEXT = 'text-input md:text-body'

// The pickers beside the search tabs. One is a real list, so both take the phone size to match each other.
export const PICKER_TEXT = 'text-input font-medium md:text-callout md:font-medium'

// Shared by TextField and Select so every input looks and behaves the same.
export const FIELD_CLASS = cx(
  'min-h-control w-full rounded-control border border-transparent bg-fill px-4 text-label',
  TYPED_TEXT,
  'placeholder:text-label-3 focus-visible:border-accent focus-visible:outline-none',
  'focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40',
  'aria-[invalid=true]:border-error aria-[invalid=true]:ring-error',
)

/**
 * Label above the field, helper or error below. `children` receives the props the control needs
 * (id, aria-invalid, aria-describedby), so every control is labelled and linked the same way.
 * Text is 16 px so iOS does not zoom on focus.
 */
export function FieldFrame({ label, helper, error, children }) {
  const id = useId()
  const message = error || helper
  const controlProps = {
    id,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': message ? `${id}-message` : undefined,
  }
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-callout font-medium text-label">
        {label}
      </label>
      {children(controlProps)}
      {message && (
        <p
          id={`${id}-message`}
          className={cx(
            'flex items-center gap-1 text-footnote',
            error ? 'text-error' : 'text-label-2',
          )}
        >
          {error && <CircleAlert size={14} aria-hidden="true" />}
          {message}
        </p>
      )}
    </div>
  )
}

export default function TextField({ label, helper, error, type = 'text', className, ...rest }) {
  return (
    <FieldFrame label={label} helper={helper} error={error}>
      {(controlProps) => (
        <input type={type} className={cx(FIELD_CLASS, className)} {...controlProps} {...rest} />
      )}
    </FieldFrame>
  )
}
