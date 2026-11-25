import Alert from '@/components/Alert'
import PageHeader from '@/components/PageHeader'
import { copy } from '@/copy/en'
import { cx } from '@/lib/cx'

/**
 * The frame of a console page: its header, then the content. `isNarrow` for forms; `hasError` says the page could not
 * load its data. `eyebrow` and `actions` go to the header.
 */
export default function AdminPage({ isNarrow = false, hasError = false, children, ...header }) {
  return (
    <div className={cx('flex animate-rise flex-col gap-5', isNarrow && 'max-w-3xl')}>
      <PageHeader {...header} />
      {hasError && <Alert tone="error" title={copy.admin.loadError} />}
      {children}
    </div>
  )
}
