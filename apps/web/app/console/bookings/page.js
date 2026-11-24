import BookingsScreen from '@/components/BookingsScreen'
import { copy } from '@/copy/en'
import { getOperatorClassNames, requireOperator } from '@/lib/console'

const text = copy.operatorConsole.bookings

export const metadata = { title: text.title }

export default async function ConsoleBookingsPage({ searchParams }) {
  const { token } = await requireOperator()
  return (
    <BookingsScreen
      listPath="/operator/bookings"
      basePath="/console/bookings"
      labels={text}
      token={token}
      query={await searchParams}
      classNames={await getOperatorClassNames(token)}
    />
  )
}
