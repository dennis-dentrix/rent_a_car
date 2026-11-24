'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { updateStaffAction } from '@/app/admin/actions'
import Alert from '@/components/Alert'
import Button from '@/components/Button'
import { copy } from '@/copy/en'

const text = copy.admin.team

function Change({ name, value, children }) {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      name={name}
      value={value}
      variant="tonal"
      size="compact"
      isLoading={pending}
    >
      {children}
    </Button>
  )
}

/** Change a team member's role, or switch their access off or on. The page refreshes when it is saved. */
export default function StaffMemberActions({ id, role, isActive }) {
  const [state, run] = useActionState(updateStaffAction, null)
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
