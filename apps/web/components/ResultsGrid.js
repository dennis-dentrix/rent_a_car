/**
 * The grid of search results and of their loading shapes: one column on a phone, then as many as fit beside the
 * filters, which is three on a laptop and wider.
 */
export default function ResultsGrid({ children, ...props }) {
  return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,16rem),1fr))] gap-5" {...props}>
      {children}
    </ul>
  )
}
