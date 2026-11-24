/** The page title on phones: large and left-aligned, as on iOS. */
export default function LargeTitle({ children, subtitle }) {
  return (
    <div className="mb-5">
      <h1 className="text-display md:text-display-lg">{children}</h1>
      {subtitle && <p className="mt-1 text-body text-label-2">{subtitle}</p>}
    </div>
  )
}
