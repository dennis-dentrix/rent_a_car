/** One block of the Settings page: a title, what it is for, and its controls. */
export default function SettingsSection({ id, title, hint, children }) {
  return (
    <section
      id={id}
      className="flex scroll-mt-24 flex-col gap-4 rounded-panel border border-separator bg-surface p-5 shadow-1 md:p-6"
    >
      <div>
        <h2 className="text-title-2">{title}</h2>
        {hint && <p className="mt-1 text-callout text-label-2">{hint}</p>}
      </div>
      {children}
    </section>
  )
}
