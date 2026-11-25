import Link from 'next/link'

/** A link standing on its own line: tall enough for a finger, underlined when pointed at. */
export default function TextLink({ href, children }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-touch items-center text-callout font-semibold text-primary underline-offset-4 hover:underline"
    >
      {children}
    </Link>
  )
}
