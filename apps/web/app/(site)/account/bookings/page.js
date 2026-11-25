import Alert from '@/components/Alert'
import BookingList from '@/components/BookingList'
import Button from '@/components/Button'
import LargeTitle from '@/components/LargeTitle'
import { copy } from '@/copy/en'
import { apiGet } from '@/lib/api'
import { requireRole } from '@/lib/auth/session'
import { getClasses } from '@/lib/catalogue'

const text = copy.journey.renter

export const metadata = { title: text.listTitle, robots: { index: false, follow: false } }

export default async function MyBookingsPage() {
  const { token } = await requireRole(null, '/account/bookings')
  const [bookings, classes] = await Promise.all([apiGet('/bookings', { token }), getClasses()])
  const names = new Map((classes.data ?? []).map((item) => [item.id, item.name]))
  return (
    <div className="mx-auto flex max-w-md flex-col gap-5">
      <LargeTitle subtitle={text.listSubtitle}>{text.listTitle}</LargeTitle>
      {bookings.error && <Alert tone="error" title={copy.admin.loadError} />}
      {bookings.data?.length === 0 && (
        <>
          <p className="text-body text-label-2">{text.empty}</p>
          <Button href="/cars">{text.find}</Button>
        </>
      )}
      {bookings.data?.length > 0 && <BookingList bookings={bookings.data} names={names} />}
    </div>
  )
}
