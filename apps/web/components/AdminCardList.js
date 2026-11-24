import Alert from '@/components/Alert'
import { copy } from '@/copy/en'

/**
 * A stack of cards with the two states every admin list has: it could not load, or there is nothing in it. `Card` draws
 * one item, and `cardProps` is whatever else it needs.
 */
export default function AdminCardList({ items, error, emptyText, Card, cardProps }) {
  return (
    <>
      {error && <Alert tone="error" title={copy.admin.loadError} />}
      {items?.length === 0 && <p className="text-body text-label-2">{emptyText}</p>}
      <ul className="flex flex-col gap-4">
        {(items ?? []).map((item) => (
          <Card key={item.id} item={item} {...cardProps} />
        ))}
      </ul>
    </>
  )
}
