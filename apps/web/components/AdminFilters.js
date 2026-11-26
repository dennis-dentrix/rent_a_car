import Link from 'next/link'
import { cx } from '@/lib/cx'

/**
 * A row of filter pills that change the page's address. `options` are { value, label }, where an empty value means
 * "all". The chosen one is filled and marked as current.
 */
export default function AdminFilters({ base, name, current, options }) {
  return (
    <div className="flex gap-2 overflow-x-auto" role="group">
      {options.map((option) => {
        const isSelected = (current ?? '') === option.value
        return (
          <Link
            key={option.value || 'all'}
            href={option.value ? `${base}?${name}=${option.value}` : base}
            aria-current={isSelected ? 'true' : undefined}
            className={cx(
              'inline-flex min-h-touch items-center whitespace-nowrap md:min-h-row rounded-pill px-3.5 text-meta font-semibold transition-transform duration-fast active:scale-[0.97]',
              isSelected
                ? 'bg-primary text-on-primary'
                : 'bg-surface text-label-2 shadow-1 hover:bg-fill',
            )}
          >
            {option.label}
          </Link>
        )
      })}
    </div>
  )
}
