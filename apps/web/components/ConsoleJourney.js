import BookingJourney from '@/components/BookingJourney'
import CompanyStep from '@/components/CompanyStep'
import LivePoll from '@/components/LivePoll'
import Panel from '@/components/Panel'
import { copy } from '@/copy/en'
import { consoleGet } from '@/lib/console'

const text = copy.journey

/** The booking's timeline on the company's page, with its next tap beside it. Nothing shows if it cannot be read. */
export default async function ConsoleJourney({ bookingId, startAt, token }) {
  const { data: journey } = await consoleGet(`/operator/bookings/${bookingId}/journey`, token)
  if (!journey) return null
  return (
    <Panel title={text.companyTitle} hint={text.live}>
      <div className="flex flex-col gap-5">
        {!journey.ended && (
          <CompanyStep
            bookingId={bookingId}
            journey={journey}
            startAt={startAt}
            now={new Date().toISOString()}
          />
        )}
        <BookingJourney journey={journey} />
      </div>
      <LivePoll />
    </Panel>
  )
}
