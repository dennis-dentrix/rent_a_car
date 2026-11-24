/** A blue-tinted panel that sections sit on, so white cards stand out from it. */
export default function Band({ children }) {
  return <div className="rounded-sheet bg-bg-grouped p-5 md:p-10">{children}</div>
}
