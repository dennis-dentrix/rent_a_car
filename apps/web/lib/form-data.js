/** Form data holding these names and values, for trying a form's reader without a form. */
export function formDataFrom(entries) {
  const data = new FormData()
  Object.entries(entries).forEach(([name, value]) => data.append(name, value))
  return data
}
