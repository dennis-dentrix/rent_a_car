import TextArea from '@/components/TextArea'
import TextField from '@/components/Field'
import Select from '@/components/Select'
import { copy } from '@/copy/en'
import { startingValue } from '@/lib/admin-resources'

const text = copy.adminSetup

// The choices of a select: its fixed words, or the records of another kind (the classes), with a blank first.
function optionsFor(field, refs) {
  if (field.options) {
    return field.options.map((value) => ({ value, label: field.optionLabels?.[value] ?? value }))
  }
  const choices = (refs[field.ref] ?? []).map(({ id, name }) => ({ value: id, label: name }))
  return [{ value: '', label: field.blankLabel ?? '' }, ...choices]
}

function Checkbox({ name, label, defaultChecked }) {
  return (
    <label className="flex min-h-touch items-center gap-3 text-body">
      <input
        type="checkbox"
        name={name}
        defaultChecked={Boolean(defaultChecked)}
        className="h-5 w-5 accent-primary"
      />
      {label}
    </label>
  )
}

/** One input for one field, by its type, with the server's message under it when it refused that field. */
export default function ResourceField({ field, labels, row, refs, errors, isEdit }) {
  if (field.type === 'hidden') return null
  const label = labels[field.name]
  const value = startingValue(field, row)
  const error = errors?.[field.name]
  const common = { name: field.name, label, error, defaultValue: value }
  if (field.type === 'boolean')
    return <Checkbox name={field.name} label={label} defaultChecked={value} />
  if (field.type === 'textarea') return <TextArea {...common} rows={3} />
  if (field.type === 'select') {
    return (
      <Select
        {...common}
        options={optionsFor(field, refs)}
        disabled={isEdit && field.isLockedOnEdit}
      />
    )
  }
  const inputType = { number: 'number', date: 'date' }[field.type] ?? 'text'
  const step = field.name === 'latitude' || field.name === 'longitude' ? 'any' : undefined
  return (
    <TextField
      {...common}
      type={inputType}
      step={step}
      inputMode={inputType === 'number' ? 'decimal' : undefined}
    />
  )
}
