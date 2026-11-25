/** The top of a working page: a small label saying where this is, the title, one line on what it is for, and its actions. */
export default function PageHeader({ eyebrow, title, subtitle, actions }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && <p className="mb-1 text-micro uppercase text-primary">{eyebrow}</p>}
        <h1 className="text-page md:text-page-lg">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-cell text-label-2">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}
