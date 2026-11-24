'use client'

import { useActionState } from 'react'
import { documentLinkAction } from '@/app/admin/actions'
import Alert from '@/components/Alert'
import Button from '@/components/Button'
import TextField from '@/components/Field'
import { copy } from '@/copy/en'

const text = copy.admin.documents

/**
 * Opens a stored identity file, which needs a reason that is written to the access log. The link is shown to click
 * rather than opened by the page, because a browser may block a window that opens after a wait.
 */
export default function DocumentViewer({ id }) {
  const [state, run] = useActionState(documentLinkAction, null)
  return (
    <form action={run} className="mt-3 flex flex-col gap-3">
      <input type="hidden" name="id" value={id} />
      {state?.error && <Alert tone="error" title={state.error} />}
      <TextField label={text.openReason} name="reason" />
      <div className="flex items-center gap-4">
        <Button type="submit" variant="tonal" size="compact">
          {text.open}
        </Button>
        {state?.url && (
          <a
            href={state.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-callout font-medium text-primary underline underline-offset-2"
          >
            {text.open} ↗
          </a>
        )}
      </div>
    </form>
  )
}
