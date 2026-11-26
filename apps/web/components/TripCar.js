import { Phone } from 'lucide-react'
import Button from '@/components/Button'
import CarPhoto from '@/components/CarPhoto'
import { copy } from '@/copy/en'
import { mediaUrl } from '@/lib/media'

const text = copy.trip

/** The car of a trip and the company renting it out, with its phone once the hire is agreed. */
export default function TripCar({ car, company }) {
  if (!car) return null
  const name = [car.make, car.model, car.year].filter(Boolean).join(' ')
  const photo = mediaUrl(car.photo_paths?.[0], process.env.NEXT_PUBLIC_MEDIA_BASE_URL)
  return (
    <section className="flex flex-col gap-3">
      {photo && (
        <div className="relative aspect-[16/10] overflow-hidden rounded-panel bg-fill">
          <CarPhoto src={photo} alt={name} sizes="(min-width: 768px) 448px, 100vw" />
        </div>
      )}
      <div>
        <h2 className="text-title-2">{name}</h2>
        <p className="text-callout text-label-2">
          {[company?.name, car.registration && text.plate(car.registration)]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </div>
      {company?.phone && (
        <Button href={`tel:${company.phone}`} variant="tonal" isFullWidth>
          <Phone size={18} aria-hidden="true" />
          {text.call(company.name)}
        </Button>
      )}
    </section>
  )
}
