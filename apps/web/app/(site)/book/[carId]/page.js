import BackLink from '@/components/BackLink'
import { redirect } from 'next/navigation'
import { bookCarAction } from '@/app/(site)/book/actions'
import AuthForm from '@/components/AuthForm'
import HandoverChoices from '@/components/HandoverChoices'
import InsetList from '@/components/InsetList'
import LargeTitle from '@/components/LargeTitle'
import Price from '@/components/Price'
import { copy } from '@/copy/en'
import { requireRole } from '@/lib/auth/session'
import { carName } from '@/lib/car-facts'
import { getVehicle } from '@/lib/catalogue'
import { carPath } from '@/lib/live-cars'
import { withParams } from '@/lib/query'
import { carriedChoices, readStay, stayRequest, wantsChauffeur } from '@/lib/stay-query'
import { formatStayRange } from '@/lib/stay-range'

const text = copy.booking.confirm

export const metadata = { title: text.title, robots: { index: false, follow: false } }

const field = (name, extra) => ({ name, label: text.fields[name], ...extra })

const FIELDS = [
  field('full_name', { autoComplete: 'name' }),
  field('phone', { type: 'tel', autoComplete: 'tel' }),
  field('date_of_birth', { type: 'date', autoComplete: 'bday', helper: text.ageHelper }),
  field('pickup_place'),
  field('destination'),
]

const summary = (car, stay) => [
  { id: 'car', title: text.car, detail: [carName(car, car.class?.name), car.year].join(' · ') },
  { id: 'company', title: text.company, detail: car.operator_name },
  {
    id: 'dates',
    title: text.dates,
    detail: [formatStayRange(stay), car.withChauffeur && text.withChauffeur]
      .filter(Boolean)
      .join(' · '),
  },
  { id: 'total', title: text.total, detail: <Price kes={car.total_kes} /> },
]

const hidden = (car, request) => ({
  car_id: car.id,
  start_at: request.from,
  end_at: request.to,
  with_chauffeur: request.with_chauffeur,
  total: car.total_kes,
})

// One short step: the stay and its price, then the few details a hire needs. A visitor signs in first and returns
// here. A car that can no longer be booked this way sends the renter back to its page, which says why.
export default async function BookCarPage({ params, searchParams }) {
  const { carId } = await params
  const query = await searchParams
  const { profile } = await requireRole(null, `/book/${carId}`)
  const request = stayRequest(query)
  const { data: car } = await getVehicle(carId, request)
  if (!car) redirect('/cars')
  const back = withParams(carPath(car) ?? '/cars', carriedChoices(query))
  if (!car.is_free || car.total_kes === undefined) redirect(back)
  const shown = { ...car, withChauffeur: wantsChauffeur(query) }
  const isRequest = car.booking_mode === 'request'
  return (
    <div className="mx-auto flex max-w-md flex-col gap-5">
      <BackLink href={back}>← {text.back}</BackLink>
      <LargeTitle subtitle={isRequest ? text.requestNote : undefined}>
        {isRequest ? text.requestTitle : text.title}
      </LargeTitle>
      <InsetList items={summary(shown, readStay(query))} />
      <AuthForm
        action={bookCarAction}
        fields={FIELDS}
        hidden={hidden(car, request)}
        initial={{
          full_name: profile.full_name,
          phone: profile.phone,
          pickup_place: query.pickup,
          destination: query.dropoff,
        }}
        submitLabel={isRequest ? text.requestSubmit : text.submit}
      >
        <HandoverChoices car={car} />
      </AuthForm>
      <p className="text-footnote text-label-2">{copy.booking.stay.payLater}</p>
    </div>
  )
}
