import { ChevronDown } from 'lucide-react'
import { FIELD_CLASS, FieldFrame } from '@/components/Field'
import Options from '@/components/Options'
import { cx } from '@/lib/cx'

/** The device's own picker: the iOS wheel and the Android list, which is what phone users expect. */
export default function Select({ label, helper, error, options, ...rest }) {
  return (
    <FieldFrame label={label} helper={helper} error={error}>
      {(controlProps) => (
        <span className="relative block">
          <select className={cx(FIELD_CLASS, 'appearance-none pr-10')} {...controlProps} {...rest}>
            <Options options={options} />
          </select>
          <ChevronDown
            size={18}
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-label-2"
            aria-hidden="true"
          />
        </span>
      )}
    </FieldFrame>
  )
}
