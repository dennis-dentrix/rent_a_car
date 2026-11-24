import { changePasswordAction, signOutEverywhereAction } from '@/app/(site)/settings/actions'
import AuthForm from '@/components/AuthForm'
import AvatarForm from '@/components/AvatarForm'
import Button from '@/components/Button'
import LargeTitle from '@/components/LargeTitle'
import MarketingSetting from '@/components/MarketingSetting'
import ProfileSettings from '@/components/ProfileSettings'
import SecondFactorSettings from '@/components/SecondFactorSettings'
import SettingsSection from '@/components/SettingsSection'
import ThemeSetting from '@/components/ThemeSetting'
import { copy } from '@/copy/en'
import { changePasswordFields } from '@/lib/auth/fields'
import { isSecondFactorRequired } from '@/lib/auth/roles'
import { requireRole } from '@/lib/auth/session'
import { avatarUrl } from '@/lib/avatar'

const text = copy.settings

export const metadata = {
  title: text.meta.title,
  description: text.meta.description,
  robots: { index: false, follow: false },
}

function Security({ profile }) {
  const { password, everywhere } = text.security
  return (
    <SettingsSection id="security" title={text.security.title}>
      <div className="flex flex-col gap-3">
        <div>
          <p className="text-headline">{password.title}</p>
          <p className="text-callout text-label-2">{password.hint}</p>
        </div>
        <AuthForm
          action={changePasswordAction}
          fields={changePasswordFields}
          submitLabel={password.save}
          saved={password.saved}
        />
      </div>
      <hr className="border-separator" />
      <SecondFactorSettings
        isEnabled={profile.has_second_factor}
        isRequired={isSecondFactorRequired(profile.role)}
      />
      <hr className="border-separator" />
      <form action={signOutEverywhereAction} className="flex flex-col items-start gap-2">
        <div>
          <p className="text-headline">{everywhere.title}</p>
          <p className="text-callout text-label-2">{everywhere.hint}</p>
        </div>
        <Button type="submit" variant="destructive" size="compact">
          {everywhere.action}
        </Button>
      </form>
    </SettingsSection>
  )
}

// What a signed-in person can change about themselves. Anyone can change how the site looks from the round button in the
// header; everything else here needs an account.
export default async function SettingsPage() {
  const { profile } = await requireRole(null, '/settings')
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <LargeTitle subtitle={text.subtitle}>{text.title}</LargeTitle>
      <SettingsSection id="profile" title={text.profile.title} hint={text.profile.hint}>
        <AvatarForm name={profile.full_name} src={avatarUrl(profile.avatar_path)} />
        <div>
          <p className="text-footnote text-label-2">{text.profile.email}</p>
          <p className="text-body">{profile.email}</p>
          <p className="text-footnote text-label-2">{text.profile.emailHint}</p>
        </div>
        <ProfileSettings initial={{ full_name: profile.full_name, phone: profile.phone ?? '' }} />
      </SettingsSection>
      <SettingsSection id="notifications" title={text.notifications.title}>
        <MarketingSetting isOn={profile.marketing_opt_in} />
      </SettingsSection>
      <SettingsSection id="appearance" title={text.appearance.title} hint={text.appearance.hint}>
        <ThemeSetting />
      </SettingsSection>
      <Security profile={profile} />
    </div>
  )
}
