import { redirect } from 'next/navigation'
import { registerCompanyAction } from '@/app/auth/actions'
import AuthForm from '@/components/AuthForm'
import LargeTitle from '@/components/LargeTitle'
import { copy } from '@/copy/en'
import { companyFields } from '@/lib/auth/fields'
import { homeFor } from '@/lib/auth/roles'
import { getCurrentUser } from '@/lib/auth/session'

const text = copy.auth.operatorCompany

export const metadata = { title: text.meta.title }

// For someone already signed in as a customer who runs a rental company: it starts their company. It is also where a
// sign-up lands if the company could not be saved the first time.
export default async function CompanyPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/auth?next=/auth/operator/company')
  if (user.profile.role !== 'customer') redirect(homeFor(user.profile.role))
  return (
    <>
      <LargeTitle subtitle={text.subtitle}>{text.title}</LargeTitle>
      <AuthForm action={registerCompanyAction} fields={companyFields} submitLabel={text.submit} />
    </>
  )
}
