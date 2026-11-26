/** Values a form sends along with what is typed, as { name: value }. */
export default function HiddenFields({ values }) {
  return Object.entries(values).map(([name, value]) => (
    <input key={name} type="hidden" name={name} value={value ?? ''} />
  ))
}
