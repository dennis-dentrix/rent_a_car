import { cx } from '@/lib/cx'

/** A white surface with a hairline border. Use grouped sections instead of nesting cards. */
export default function Card({ as: Tag = 'div', hasPadding = true, className, children, ...rest }) {
  return (
    <Tag
      className={cx(
        'rounded-card border border-separator bg-surface shadow-1',
        hasPadding && 'p-4 md:p-5',
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  )
}
