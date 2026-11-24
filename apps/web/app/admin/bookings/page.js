import BookingsScreen from '@/components/BookingsScreen'
import { copy } from '@/copy/en'
import { getClassNames, requireAdmin } from '@/lib/admin'

const text = copy.admin.bookings

export const metadata = { title: text.title }

export default async function AdminBookingsPage({ searchParams }) {
  const { token } = await requireAdmin()
  return (
    <BookingsScreen
      listPath="/staff/bookings"
      basePath="/admin/bookings"
      labels={text}
      token={token}
      query={await searchParams}
      classNames={await getClassNames()}
    />
  )
}
