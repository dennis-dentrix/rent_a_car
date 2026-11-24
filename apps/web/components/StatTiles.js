/** A row of big numbers with a label under each: today's movement, or how many cars are out. */
export default function StatTiles({ title, items }) {
  return (
    <section aria-label={title} className="flex flex-col gap-3">
      <h2 className="text-title-3">{title}</h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="rounded-card bg-bg-grouped p-4">
            <p className="num text-display">{item.value}</p>
            <p className="text-callout text-label-2">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
