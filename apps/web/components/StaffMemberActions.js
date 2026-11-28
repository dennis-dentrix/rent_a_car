'use client'

import SubmitButton from '@/components/SubmitButton'
import { useFormAction } from '@/lib/use-form-action'
import { updateStaffAction } from '@/app/admin/actions'
import Alert from '@/components/Alert'
import { copy } from '@/copy/en'

const text = copy.admin.team

function Change({ name, value, children }) {
  return (
    <SubmitButton name={name} value={value} variant="tonal" size="compact" isFullWidth={false}>
      {children}
    </SubmitButton>
  )
}

/** Change a team member's role, or switch their access off or on. The page refreshes when it is saved. */
export default function StaffMemberActions({ id, role, isActive }) {
  const [state, run] = useFormAction(updateStaffAction, null)
  return (
    <form action={run} className="flex flex-col gap-2">
      <input type="hidden" name="id" value={id} />
      {state?.error && <Alert tone="error" title={state.error} />}
      <div className="flex flex-wrap gap-2">
        <Change name="role" value={role === 'admin' ? 'staff' : 'admin'}>
          {role === 'admin' ? text.makeStaff : text.makeAdmin}
        </Change>
        <Change name="active" value={String(!isActive)}>
          {isActive ? text.switchOff : text.switchOn}
        </Change>
      </div>
    </form>
  )
}
