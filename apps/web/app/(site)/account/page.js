import Avatar from '@/components/Avatar'
import Button from '@/components/Button'
import LargeTitle from '@/components/LargeTitle'
import SignOutForm from '@/components/SignOutForm'
import { copy } from '@/copy/en'
import { avatarUrl } from '@/lib/avatar'
import { requireRole } from '@/lib/auth/session'

const text = copy.auth.account

export const metadata = { title: text.meta.title, robots: { index: false, follow: false } }

// Anyone signed in. Bookings and documents join this page as they are built.
export default async function AccountPage() {
  const { profile } = await requireRole(null, '/account')
  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <LargeTitle>{text.title}</LargeTitle>
      <Avatar name={profile.full_name} src={avatarUrl(profile.avatar_path)} size={80} />
      <dl className="flex flex-col gap-3 rounded-card bg-bg-grouped p-4 text-body">
        <div>
          <dt className="text-footnote text-label-2">{text.name}</dt>
          <dd>{profile.full_name}</dd>
        </div>
        <div>
          <dt className="text-footnote text-label-2">{text.email}</dt>
          <dd>{profile.email}</dd>
        </div>
      </dl>
      <div className="flex flex-wrap gap-3">
        <Button href="/settings">{copy.settings.menu}</Button>
        <SignOutForm />
      </div>
    </div>
  )
}
