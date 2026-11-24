import { FIELD_CLASS, FieldFrame } from '@/components/Field'
import { cx } from '@/lib/cx'

/** A multi-line field with the same label, helper, and error behaviour as every other field. */
export default function TextArea({ label, helper, error, rows = 4, ...rest }) {
  return (
    <FieldFrame label={label} helper={helper} error={error}>
      {(controlProps) => (
        <textarea
          rows={rows}
          className={cx(FIELD_CLASS, 'resize-y py-3')}
          {...controlProps}
          {...rest}
        />
      )}
    </FieldFrame>
  )
}
