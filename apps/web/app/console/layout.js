import { requireRole } from '@/lib/auth/session'

// The rental company's area. Nothing here is for search engines, or for anyone who is not a company's person.
export const metadata = { robots: { index: false, follow: false } }

export default async function ConsoleLayout({ children }) {
  await requireRole(['operator'], '/console')
  return <main className="mx-auto w-full max-w-3xl px-4 py-8 md:py-12">{children}</main>
}
