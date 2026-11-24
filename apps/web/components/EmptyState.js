/** One icon, one line, one action. */
export default function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
      <span className="flex size-14 items-center justify-center rounded-pill bg-accent-subtle text-accent">
        <Icon size={26} aria-hidden="true" />
      </span>
      <h2 className="mt-2 text-headline">{title}</h2>
      <p className="max-w-xs text-callout text-label-2">{message}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}
