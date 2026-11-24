import { requireRole } from '@/lib/auth/session'

// Nothing in the admin area is for search engines, or for anyone who is not an admin who has used their second factor.
export const metadata = { robots: { index: false, follow: false } }

export default async function AdminLayout({ children }) {
  await requireRole(['admin'], '/admin')
  return <main className="mx-auto w-full max-w-6xl px-4 py-8 md:py-12">{children}</main>
}
