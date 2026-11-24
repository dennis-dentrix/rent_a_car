import Button from '@/components/Button'
import LargeTitle from '@/components/LargeTitle'
import SignOutForm from '@/components/SignOutForm'
import { copy } from '@/copy/en'
import { getCurrentUser } from '@/lib/auth/session'

const text = copy.auth

export default async function AdminPage() {
  const { profile } = await getCurrentUser()
  return (
    <div className="mx-auto max-w-3xl">
      <LargeTitle subtitle={text.admin.signedInAs(profile.full_name, profile.role)}>
        {text.admin.title}
      </LargeTitle>
      <div className="flex flex-wrap gap-3">
        <Button href="/admin/posts">{text.adminPosts.link}</Button>
        <Button href="/admin/operators" variant="tonal">
          {text.adminOperators.link}
        </Button>
        <SignOutForm />
      </div>
    </div>
  )
}
