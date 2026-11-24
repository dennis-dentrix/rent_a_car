import Link from 'next/link'

/** A plain link under a sign-in form, such as "Forgot password?". */
export default function AuthLink({ href, children }) {
  return (
    <Link href={href} className="font-medium text-primary underline underline-offset-2">
      {children}
    </Link>
  )
}
