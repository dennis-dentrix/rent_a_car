'use client'

import { useRouter } from 'next/navigation'
import AuthForm from '@/components/AuthForm'
import { updateProfileAction } from '@/app/(site)/settings/actions'
import { copy } from '@/copy/en'
import { PROFILE_CHANGED } from '@/lib/avatar'
import { profileFields } from '@/lib/auth/fields'

const text = copy.settings.profile

/** Name and phone. After a save the header (which shows the name) is told, and the page is drawn again with the new values. */
export default function ProfileSettings({ initial }) {
  const router = useRouter()
  const onSaved = () => {
    window.dispatchEvent(new Event(PROFILE_CHANGED))
    router.refresh()
  }
  return (
    <AuthForm
      action={updateProfileAction}
      fields={profileFields}
      initial={initial}
      submitLabel={text.save}
      saved={text.saved}
      onSaved={onSaved}
    />
  )
}
