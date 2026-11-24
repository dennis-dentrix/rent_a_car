import Alert from '@/components/Alert'
import LargeTitle from '@/components/LargeTitle'
import { copy } from '@/copy/en'
import { cx } from '@/lib/cx'

/** The frame of an admin page: its title and one line saying what it is for, then the content. `isNarrow` for forms and cards; `hasError` says the page could not load its data. */
export default function AdminPage({
  title,
  subtitle,
  isNarrow = false,
  hasError = false,
  children,
}) {
  return (
    <div className={cx('flex flex-col gap-5', isNarrow && 'max-w-3xl')}>
      <LargeTitle subtitle={subtitle}>{title}</LargeTitle>
      {hasError && <Alert tone="error" title={copy.admin.loadError} />}
      {children}
    </div>
  )
}
