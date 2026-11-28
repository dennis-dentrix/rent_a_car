import { Search } from 'lucide-react'
import Button from '@/components/Button'

/**
 * Search fields as one joined card: stacked rows on a phone, one line on a wide screen, then the search button.
 * `children` are the cells; `columns` is how many share the line on the widest screens.
 */
export default function SearchStrip({ columns, submitLabel, isSearching, children, className }) {
  return (
    <div className={className}>
      <div
        style={{ '--cols': columns }}
        className="grid gap-px bg-separator md:flex-1 md:grid-cols-2 lg:grid-cols-[repeat(var(--cols),minmax(0,1fr))]"
      >
        {children}
      </div>
      <div className="bg-surface p-2 md:flex md:shrink-0 md:p-1.5">
        <Button type="submit" isFullWidth isLoading={isSearching} className="md:h-full md:px-8">
          {!isSearching && <Search size={20} aria-hidden="true" />}
          {submitLabel}
        </Button>
      </div>
    </div>
  )
}
