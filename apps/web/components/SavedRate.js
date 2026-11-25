'use client'

import { useOptimistic, useState, useTransition } from 'react'
import InlineRate from '@/components/InlineRate'
import { copy } from '@/copy/en'

/**
 * A daily price whose tick saves at once. The new figure shows while it is being saved and goes back, with the reason,
 * if the server refuses. `save` takes the figure and resolves to { error? }; the rest goes to InlineRate.
 */
export default function SavedRate({ value, save, ...rate }) {
  const [shown, showSoon] = useOptimistic(value)
  const [problem, setProblem] = useState(null)
  const [isSaving, startSaving] = useTransition()
  const keep = (next) =>
    startSaving(async () => {
      showSoon(next)
      const result = await save(next)
      setProblem(result.error ?? null)
    })
  return (
    <div>
      <InlineRate {...rate} value={shown} onKeep={keep} />
      <p role="status" className="mt-1 text-footnote text-label-2 empty:hidden">
        {isSaving ? copy.adminFleet.rate.saving : ''}
      </p>
      {problem && <p className="mt-1 text-footnote text-error">{problem}</p>}
    </div>
  )
}
