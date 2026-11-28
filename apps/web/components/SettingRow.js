'use client'

import SubmitButton from '@/components/SubmitButton'
import { useFormAction } from '@/lib/use-form-action'
import { updateSettingAction } from '@/app/admin/settings/actions'
import Alert from '@/components/Alert'
import TextField from '@/components/Field'
import Switch from '@/components/Switch'
import { copy } from '@/copy/en'

const text = copy.adminSetup.settings

function ToggleSetting({ settingKey, item, isOn }) {
  const change = async (next) => (await updateSettingAction(settingKey, next)).ok === true
  return (
    <Switch
      label={item.label}
      hint={item.hint}
      isOn={isOn}
      onChange={change}
      failedText={text.failed}
    />
  )
}

function ValueSetting({ settingKey, item, value }) {
  const [state, run] = useFormAction(async (_previous, formData) => {
    const entered = String(formData.get('value') ?? '').trim()
    const result = await updateSettingAction(settingKey, item.isText ? entered : Number(entered))
    return result.ok ? { status: 'saved', at: Date.now() } : { error: result.error }
  }, null)
  return (
    <form action={run} className="flex flex-col gap-2">
      <TextField
        label={item.unit ? `${item.label} (${text.unit[item.unit]})` : item.label}
        helper={item.hint}
        name="value"
        type={item.isText ? 'email' : 'number'}
        inputMode={item.isText ? 'email' : 'numeric'}
        defaultValue={value}
        key={state?.at ?? 0}
      />
      {state?.error && <Alert tone="error" title={state.error} />}
      <div className="flex items-center gap-3">
        <SubmitButton variant="tonal" size="compact" isFullWidth={false}>
          {text.save}
        </SubmitButton>
        {state?.status === 'saved' && (
          <span role="status" className="text-cell text-label-2">
            {text.saved}
          </span>
        )}
      </div>
    </form>
  )
}

/** One setting: a switch for on/off ones, which acts at once, and a field with a Save button for the rest. */
export default function SettingRow({ settingKey, value }) {
  const item = copy.adminSetup.settings.items[settingKey]
  if (typeof value === 'boolean')
    return <ToggleSetting settingKey={settingKey} item={item} isOn={value} />
  return <ValueSetting settingKey={settingKey} item={item} value={value} />
}
