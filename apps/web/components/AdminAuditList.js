import InsetList from '@/components/InsetList'
import { copy } from '@/copy/en'
import { momentText } from '@/lib/admin-format'

const text = copy.admin.audit

/** Who did what, to what, and when, as one sentence per change. */
export default function AdminAuditList({ entries }) {
  if (!entries.length) return <p className="text-body text-label-2">{text.empty}</p>
  const items = entries.map((entry) => ({
    id: entry.id,
    title: `${entry.actor ?? text.unknownActor}: ${text.actions[entry.action] ?? entry.action} ${
      text.tables[entry.table_name] ?? text.other
    }`,
    detail: momentText(entry.created_at),
  }))
  return <InsetList items={items} />
}
