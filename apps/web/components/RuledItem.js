/**
 * One item in a row of related things: a hairline above, a title, a few words. No box, icon, or shadow: the space and
 * the line group it. `kicker` is a short line over the title, such as a step number.
 */
export default function RuledItem({ kicker, title, text, children }) {
  return (
    <div className="flex h-full flex-col border-t border-separator pt-4">
      {kicker && <p className="num mb-1 text-footnote text-label-2">{kicker}</p>}
      <h3 className="text-headline md:text-title-2">{title}</h3>
      <p className="mt-2 text-reading text-label-2">{text}</p>
      {children}
    </div>
  )
}
