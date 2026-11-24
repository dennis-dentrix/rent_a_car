import AdminPage from '@/components/AdminPage'
import Alert from '@/components/Alert'
import SettingRow from '@/components/SettingRow'
import UsdRateForm from '@/components/UsdRateForm'
import { nairobiDate } from '@rent-a-car/shared'
import { copy } from '@/copy/en'
import { adminGet, requireAdmin } from '@/lib/admin'

const text = copy.adminSetup.settings

export const metadata = { title: text.title }

function Group({ group, settings }) {
  if (!settings.length) return null
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-title-3">{text.groups[group]}</h2>
      <ul className="flex flex-col gap-5 rounded-card bg-bg-grouped p-4">
        {settings.map((setting) => (
          <li key={setting.key}>
            <SettingRow settingKey={setting.key} value={setting.value} />
          </li>
        ))}
      </ul>
    </section>
  )
}

export default async function AdminSettingsPage() {
  const { token } = await requireAdmin()
  const [settings, rates] = await Promise.all([
    adminGet('/admin/settings', token),
    adminGet('/admin/exchange-rates', token),
  ])
  const known = (settings.data ?? []).filter((setting) => text.items[setting.key])
  const usd = (rates.data ?? []).find((rate) => rate.currency === 'USD')
  return (
    <AdminPage title={text.title} subtitle={text.subtitle} isNarrow>
      {(settings.error || rates.error) && <Alert tone="error" title={copy.admin.loadError} />}
      {Object.keys(text.groups).map((group) => (
        <Group
          key={group}
          group={group}
          settings={known.filter((s) => text.items[s.key].group === group)}
        />
      ))}
      <UsdRateForm rate={usd?.rate_to_kes} date={usd?.rate_date ?? nairobiDate(new Date())} />
    </AdminPage>
  )
}
