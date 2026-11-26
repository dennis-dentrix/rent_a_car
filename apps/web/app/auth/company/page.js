import { redirect } from 'next/navigation'
import { signInAction } from '@/app/auth/actions'
import AuthLink from '@/components/AuthLink'
import AuthScreen from '@/components/AuthScreen'
import { copy } from '@/copy/en'
import { signInFields } from '@/lib/auth/fields'
import { homeFor } from '@/lib/auth/roles'
import { getCurrentUser } from '@/lib/auth/session'

const text = copy.auth.companySignIn

export const metadata = { title: text.title }

// A rental company's way in. It leads to the company's dashboard.
export default async function CompanySignInPage() {
  const user = await getCurrentUser()
  if (user) redirect(homeFor(user.profile.role))
  const form = { action: signInAction, fields: signInFields, submitLabel: copy.auth.signIn.submit }
  return (
    <AuthScreen text={text} form={form}>
      <p className="text-callout">
        <AuthLink href="/auth/forgot">{copy.auth.signIn.forgot}</AuthLink>
      </p>
      <p className="text-callout text-label-2">
        {text.new} <AuthLink href="/auth/operator">{text.create}</AuthLink>
      </p>
      <p className="text-callout text-label-2">
        {text.renter} <AuthLink href="/auth">{text.renterSignIn}</AuthLink>
      </p>
    </AuthScreen>
  )
}
