import { redirect } from 'next/navigation'
import { resetPasswordAction } from '@/app/auth/actions'
import AuthForm from '@/components/AuthForm'
import LargeTitle from '@/components/LargeTitle'
import { copy } from '@/copy/en'
import { resetFields } from '@/lib/auth/fields'
import { getTokens } from '@/lib/auth/session'

const text = copy.auth.reset

export const metadata = { title: text.meta.title }

// Reached only through the link in a reset email, which signs the person in for this one purpose.
export default async function ResetPasswordPage() {
  if (!(await getTokens())) redirect('/auth?notice=link-expired')
  return (
    <>
      <LargeTitle subtitle={text.subtitle}>{text.title}</LargeTitle>
      <AuthForm action={resetPasswordAction} fields={resetFields} submitLabel={text.submit} />
    </>
  )
}
