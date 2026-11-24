import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { copy } from '@/copy/en'

/** The visible trail: Home, Cars, this page. The last step is the current page and is not a link. */
export default function Breadcrumbs({ trail }) {
  return (
    <nav aria-label={copy.classPage.crumbsLabel}>
      <ol className="flex flex-wrap items-center gap-1 text-callout text-label-2">
        {trail.map((step, index) => {
          const isLast = index === trail.length - 1
          return (
            <li key={step.path} className="flex items-center gap-1">
              {isLast ? (
                <span aria-current="page" className="font-medium text-label">
                  {step.name}
                </span>
              ) : (
                <>
                  <Link href={step.path} className="hover:text-label">
                    {step.name}
                  </Link>
                  <ChevronRight size={14} aria-hidden="true" />
                </>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
