import Price from '@/components/Price'
import { copy } from '@/copy/en'
import { cx } from '@/lib/cx'

const text = copy.today

function Figure({ label, isStrong = false, children }) {
  return (
    <div className={cx('flex-1 basis-40 px-6 py-5', isStrong && 'bg-hero text-on-hero')}>
      <dt className={cx('text-cell', isStrong ? 'text-on-hero-2' : 'text-label-2')}>{label}</dt>
      <dd className="num mt-1 text-title-1">{children}</dd>
    </div>
  )
}

/** The day in four figures, on one strip. */
export default function TodayFigures({ overview }) {
  const count = (kind) => overview.handovers.filter((entry) => entry.kind === kind).length
  return (
    <dl className="flex flex-wrap divide-x divide-separator overflow-hidden rounded-panel border border-separator bg-surface shadow-1">
      <Figure label={text.pickups}>{count('pickup')}</Figure>
      <Figure label={text.returns}>{count('return')}</Figure>
      <Figure label={text.out}>{text.outOf(overview.on_hire, overview.vehicles)}</Figure>
      <Figure label={text.collect} isStrong>
        <Price kes={overview.to_collect_kes} />
      </Figure>
    </dl>
  )
}
