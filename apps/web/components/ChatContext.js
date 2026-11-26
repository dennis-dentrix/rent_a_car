import Link from 'next/link'
import { CarFront } from 'lucide-react'
import CarPhoto from '@/components/CarPhoto'
import Price from '@/components/Price'
import StatusBadge from '@/components/StatusBadge'
import { copy } from '@/copy/en'
import { momentText } from '@/lib/admin-format'
import { bookingDays, chatLinks } from '@/lib/chat-context'
import { mediaUrl } from '@/lib/media'
import { formatStayRange } from '@/lib/stay-range'

const text = copy.messages
const LINK = 'inline-flex min-h-touch shrink-0 items-center text-callout font-semibold text-primary'

function CarRow({ conversation, href }) {
  const { car } = conversation
  const src = car?.photo_paths[0]
  return (
    <div className="flex items-center gap-3">
      <span className="relative flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-control bg-fill text-label-3">
        {src ? (
          <CarPhoto
            src={mediaUrl(src, process.env.NEXT_PUBLIC_MEDIA_BASE_URL)}
            alt={conversation.car_name}
            sizes="80px"
          />
        ) : (
          <CarFront size={22} aria-hidden="true" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-callout font-semibold">{conversation.car_name}</span>
        <span className="block text-footnote text-label-2">
          {car ? (
            <>
              <Price kes={car.daily_rate_kes} /> {text.car.perDay}
            </>
          ) : (
            text.car.unlisted
          )}
        </span>
      </span>
      {href && (
        <Link href={href} className={LINK}>
          {text.car.view}
        </Link>
      )}
    </div>
  )
}

// Whether the car is reserved, said plainly either way.
function Reservation({ booking, side, href }) {
  if (!booking) {
    return (
      <p className="rounded-control bg-fill px-3 py-2 text-footnote font-semibold text-label-2">
        {text.reservation.none[side]}
      </p>
    )
  }
  const stay = formatStayRange(bookingDays(booking))
  return (
    <div className="flex flex-wrap items-center gap-x-3 rounded-control bg-accent-subtle px-3">
      <span className="text-footnote font-semibold">{text.reservation.some[side]}</span>
      <StatusBadge status={booking.status} />
      <Link href={href} className={`${LINK} ml-auto`}>
        {text.reservation.open}
      </Link>
      {/* The dates take a line of their own, so a narrow phone does not stack them word by word. */}
      <span className="num w-full pb-2 text-footnote text-label-2">
        {stay}
        {booking.status === 'requested' &&
          ` · ${text.reservation.answerBy(momentText(booking.hold_expires_at))}`}
      </span>
    </div>
  )
}

/** Under a chat's heading, for both sides: the car being talked about and where its reservation stands. */
export default function ChatContext({ conversation, side }) {
  const links = chatLinks(conversation, side)
  return (
    <div className="flex flex-col gap-2 border-b border-separator bg-surface px-3 py-2">
      <CarRow conversation={conversation} href={links.car} />
      <Reservation booking={conversation.booking} side={side} href={links.booking} />
    </div>
  )
}
