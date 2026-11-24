import { notFound } from 'next/navigation'

export const metadata = { robots: { index: false, follow: false } }

// The component gallery is for the team only: it does not exist in a production build.
export default function DevLayout({ children }) {
  if (process.env.NODE_ENV === 'production') notFound()
  return children
}
