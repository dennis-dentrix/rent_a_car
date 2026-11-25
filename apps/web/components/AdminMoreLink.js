import Link from 'next/link'

/** "Older …" under a list: the link to its next page, or nothing on the last page. */
export default function AdminMoreLink({ href, children }) {
  if (!href) return null
  return (
    <Link href={href} className="text-cell font-medium text-primary underline underline-offset-2">
      {children}
    </Link>
  )
}
