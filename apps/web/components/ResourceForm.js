'use client'

import { useActionState } from 'react'
import { saveResourceAction } from '@/app/admin/setup/actions'
import Alert from '@/components/Alert'
import ResourceField from '@/components/ResourceFields'
import SubmitButton from '@/components/SubmitButton'
import { copy } from '@/copy/en'

const text = copy.adminSetup

function FormIdentity({ resource, scope, parent, row, fixed }) {
  return (
    <>
      <input type="hidden" name="resource" value={resource} />
      <input type="hidden" name="scope" value={scope} />
      {parent && <input type="hidden" name="parent" value={parent} />}
      {Object.entries(fixed).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      {row && <input type="hidden" name="id" value={row.id} />}
    </>
  )
}

/**
 * The form to add a record, or change one (`row`). It stays open after a save and says so; a refusal keeps what was
 * typed and puts each message under its field. The fields come from the same list the server uses to read them.
 */
export default function ResourceForm({
  resource,
  scope = 'admin',
  fields,
  labels,
  row,
  refs,
  parent,
  fixed = {},
}) {
  // A form that added something starts over for the next one; one that was refused keeps what was typed.
  const [state, run] = useActionState(async (previous, formData) => {
    const result = await saveResourceAction(previous, formData)
    return { ...result, resets: (previous?.resets ?? 0) + (result.status === 'added' ? 1 : 0) }
  }, null)
  const isEdit = Boolean(row)
  return (
    <form action={run} className="mt-4 flex flex-col gap-4">
      <FormIdentity resource={resource} scope={scope} parent={parent} row={row} fixed={fixed} />
      {state?.error && <Alert tone="error" title={state.error} />}
      {state?.status && (
        <Alert tone="success" title={state.status === 'added' ? text.added : text.saved} />
      )}
      {fields.map((field) => (
        <ResourceField
          key={`${field.name}-${state?.resets ?? 0}`}
          field={field}
          labels={labels}
          row={row}
          refs={refs}
          errors={state?.fields}
          isEdit={isEdit}
        />
      ))}
      <SubmitButton isFullWidth={false}>{isEdit ? text.save : text.create}</SubmitButton>
    </form>
  )
}
