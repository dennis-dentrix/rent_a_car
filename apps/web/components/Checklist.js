/** A titled short list: what to bring, what to tell us, the rules. */
export default function Checklist({ title, items, note }) {
  return (
    <div className="border-t border-separator pt-4">
      <h3 className="text-headline md:text-title-2">{title}</h3>
      <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-reading marker:text-label-3">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      {note && <p className="mt-3 text-footnote text-label-2">{note}</p>}
    </div>
  )
}
