import { forgotPasswordAction } from '@/app/auth/actions'
import AuthForm from '@/components/AuthForm'
import AuthLink from '@/components/AuthLink'
import LargeTitle from '@/components/LargeTitle'
import { copy } from '@/copy/en'
import { forgotFields } from '@/lib/auth/fields'

const text = copy.auth.forgot

export const metadata = { title: text.meta.title }

export default function ForgotPasswordPage() {
  return (
    <>
      <LargeTitle subtitle={text.subtitle}>{text.title}</LargeTitle>
      <div className="flex flex-col gap-4">
        <AuthForm
          action={forgotPasswordAction}
          fields={forgotFields}
          submitLabel={text.submit}
          sent={{ title: text.sentTitle, text: text.sentText }}
        />
        <p className="text-callout">
          <AuthLink href="/auth">{text.back}</AuthLink>
        </p>
      </div>
    </>
  )
}
