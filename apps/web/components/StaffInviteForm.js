'use client'

import { useActionState } from 'react'
import { inviteStaffAction } from '@/app/admin/actions'
import Alert from '@/components/Alert'
import SubmitButton from '@/components/SubmitButton'
import TextField from '@/components/Field'
import Select from '@/components/Select'
import { copy } from '@/copy/en'

const text = copy.admin.team

/** Adds a team member by email. The form clears when the invite is sent, and keeps what was typed when it is refused. */
export default function StaffInviteForm() {
  const [state, run] = useActionState(inviteStaffAction, null)
  const values = state?.values
  return (
    <form
      key={state?.status === 'invited' ? 'sent' : 'typing'}
      action={run}
      className="flex flex-col gap-3 rounded-card bg-bg-grouped p-4"
    >
      <h2 className="text-headline">{text.inviteTitle}</h2>
      <p className="text-callout text-label-2">{text.inviteHint}</p>
      {state?.error && <Alert tone="error" title={state.error} />}
      {state?.status === 'invited' && <Alert tone="success" title={text.invited} />}
      <TextField
        label={text.name}
        name="full_name"
        defaultValue={values?.full_name}
        autoComplete="off"
      />
      <TextField
        label={text.email}
        name="email"
        type="email"
        defaultValue={values?.email}
        autoComplete="off"
      />
      <Select label={text.role} name="role" defaultValue="staff" options={roleOptions()} />
      <SubmitButton>{text.invite}</SubmitButton>
    </form>
  )
}

const roleOptions = () => Object.entries(text.roles).map(([value, label]) => ({ value, label }))
