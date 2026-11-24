import LargeTitle from '@/components/LargeTitle'
import { cx } from '@/lib/cx'

/** The frame of an admin page: its title and one line saying what it is for, then the content. `isNarrow` for forms and cards. */
export default function AdminPage({ title, subtitle, isNarrow = false, children }) {
  return (
    <div className={cx('flex flex-col gap-5', isNarrow && 'max-w-3xl')}>
      <LargeTitle subtitle={subtitle}>{title}</LargeTitle>
      {children}
    </div>
  )
}
