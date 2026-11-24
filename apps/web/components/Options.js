/** The <option> list for a native select, from { value, label } pairs. Shared by every select in the app. */
export default function Options({ options }) {
  return options.map((option) => (
    <option key={option.value} value={option.value}>
      {option.label}
    </option>
  ))
}
