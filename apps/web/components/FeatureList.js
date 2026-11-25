import RuledItem from '@/components/RuledItem'
import SectionHeading from '@/components/SectionHeading'
import { cx } from '@/lib/cx'

/** A heading and a grid of short points. */
export default function FeatureList({ title, note, items, columns = 'md:grid-cols-3' }) {
  return (
    <section>
      <SectionHeading title={title}>{note}</SectionHeading>
      <ul className={cx('grid gap-8', columns)}>
        {items.map((item) => (
          <li key={item.title}>
            <RuledItem title={item.title} text={item.text} />
          </li>
        ))}
      </ul>
    </section>
  )
}
