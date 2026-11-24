/** The small uppercase blue label above a section title, as on the Stitch screens. */
export default function Eyebrow({ children }) {
  return (
    <p className="mb-2 text-caption font-semibold uppercase tracking-wider text-primary">
      {children}
    </p>
  )
}
