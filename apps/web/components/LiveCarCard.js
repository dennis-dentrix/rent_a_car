import Link from 'next/link'
import ApprovedBy from '@/components/ApprovedBy'
import CarCover from '@/components/CarCover'
import CarRatePrice from '@/components/CarRatePrice'
import { carName } from '@/lib/car-facts'
import { carPath } from '@/lib/live-cars'
import { withParams } from '@/lib/query'

/** One real car: its photo, what it is, who rents it out, and the daily price. The whole card opens the car. */
export default function LiveCarCard({ car, choices }) {
  const name = carName(car, car.class?.name)
  const base = carPath(car)
  const path = base && withParams(base, choices ?? {})
  const Wrapper = path ? Link : 'div'
  return (
    <li>
      <Wrapper
        href={path ?? undefined}
        className="group flex h-full flex-col gap-3 rounded-panel transition-transform duration-fast active:scale-[0.99]"
      >
        <CarCover
          car={car}
          name={name}
          sizes="(min-width: 1024px) 300px, (min-width: 768px) 50vw, 100vw"
          className="aspect-[4/3] overflow-hidden rounded-panel"
        />
        <div className="flex flex-1 flex-col">
          <h3 className="mb-1 text-headline group-hover:text-primary">
            {[name, car.year].filter(Boolean).join(' · ')}
          </h3>
          <ApprovedBy name={car.operator_name} />
          <div className="mt-auto">
            <CarRatePrice car={car} />
          </div>
        </div>
      </Wrapper>
    </li>
  )
}
