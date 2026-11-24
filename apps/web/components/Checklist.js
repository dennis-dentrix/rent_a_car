/** A titled card with a short list, each line led by an icon: what to bring, what to tell us, the rules. */
export default function Checklist({ title, items, note, icon: Icon, iconClass }) {
  return (
    <div className="rounded-panel border border-separator bg-surface p-5 shadow-1 md:p-6">
      <h3 className="text-title-2">{title}</h3>
      <ul className="mt-4 flex flex-col gap-3">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3 text-body">
            <Icon size={20} className={`mt-0.5 shrink-0 ${iconClass}`} aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
      {note && <p className="mt-4 text-footnote text-label-2">{note}</p>}
    </div>
  )
}
