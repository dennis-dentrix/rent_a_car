import AuthShell from '@/components/AuthShell'
import { copy } from '@/copy/en'

export const metadata = { title: copy.auth.meta.title, robots: { index: false, follow: false } }

// Sign-in pages have their own frame, not the site's header and footer.
export default function AuthLayout({ children }) {
  return <AuthShell>{children}</AuthShell>
}
