import { copy } from '@/copy/en'

/** A panel's list of rows, or the line that says it could not be loaded or that there is nothing yet. */
export default function PanelList({ error, isEmpty, empty, children }) {
  if (error) return <p className="text-error">{copy.admin.loadError}</p>
  if (isEmpty) return <p className="text-label-2">{empty}</p>
  return <ul className="divide-y divide-separator">{children}</ul>
}
