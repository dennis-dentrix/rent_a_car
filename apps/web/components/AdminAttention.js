import Badge from '@/components/Badge'
import InsetList from '@/components/InsetList'
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
    <section aria-labelledby="needs-you" className="flex flex-col gap-3">
      <h2 id="needs-you" className="text-title-3">
        {text.attentionTitle}
      </h2>
      {items.length ? (
        <InsetList items={items} />
      ) : (
        <p className="rounded-card bg-bg-grouped p-4 text-body text-label-2">{text.allClear}</p>
      )}
    </section>
  )
}
