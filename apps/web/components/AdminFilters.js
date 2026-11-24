import Chip from '@/components/Chip'

/**
 * A row of filter chips that change the page's address. `options` are { value, label }, where an empty value means
 * "all". The chosen one is shown selected.
 */
export default function AdminFilters({ base, name, current, options }) {
  return (
    <div className="flex flex-wrap gap-2" role="group">
      {options.map((option) => (
        <Chip
          key={option.value || 'all'}
          label={option.label}
          isSelected={(current ?? '') === option.value}
          href={option.value ? `${base}?${name}=${option.value}` : base}
        />
      ))}
    </div>
  )
}
