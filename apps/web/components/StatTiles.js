import StatCard from '@/components/StatCard'

/** A row of figures: today's movement, or how the fleet stands. */
export default function StatTiles({ title, items }) {
  return (
    <section
      aria-label={title}
      className="stagger grid grid-cols-2 gap-3 md:grid-cols-3 lg:auto-cols-fr lg:grid-flow-col [&>:last-child:nth-child(odd)]:col-span-2 md:[&>:last-child:nth-child(odd)]:col-span-1"
    >
      {items.map((item) => (
        <StatCard key={item.label} {...item} />
      ))}
    </section>
  )
}
