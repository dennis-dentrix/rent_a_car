/** Two fields side by side where each has room for a full date, otherwise one above the other. */
export default function FieldPair({ children }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,9.5rem),1fr))] gap-3">
      {children}
    </div>
  )
}
