import Badge from '@/components/Badge'
import InsetList from '@/components/InsetList'
import Panel from '@/components/Panel'
import { copy } from '@/copy/en'

const text = copy.admin.overview

// What needs the admin, in the order they are likely to act: people waiting on an answer first.
const ITEMS = [
  ['companies_pending', '/admin/operators'],
  ['documents_to_review', '/admin/documents'],
  ['bookings_to_confirm', '/admin/bookings?status=pending_payment'],
  ['enquiries_open', '/admin/enquiries?status=open'],
  ['guides_draft', '/admin/posts'],
]

/** Only what has something waiting is listed, so an empty list means the admin can stop. */
export default function AdminAttention({ overview }) {
  const items = ITEMS.filter(([key]) => overview[key] > 0).map(([key, href]) => ({
    id: key,
    href,
    title: text.attention[key](overview[key]),
    trailing: <Badge tone="warning">{overview[key]}</Badge>,
  }))
  return (
    <Panel title={text.attentionTitle} isFlush>
      {items.length ? (
        <div className="px-3 pb-3">
          <InsetList items={items} />
        </div>
      ) : (
        <p className="px-5 pb-8 pt-4 text-center text-cell text-label-2">{text.allClear}</p>
      )}
    </Panel>
  )
}
