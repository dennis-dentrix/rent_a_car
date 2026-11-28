'use client'

import { attempt } from '@/lib/attempt'
import { useState, useTransition } from 'react'
import { Download } from 'lucide-react'
import { reportLinkAction } from '@/app/inspections/actions'
import Button from '@/components/Button'
import { copy } from '@/copy/en'

const text = copy.inspections.report

/**
 * Gets a link to the sealed PDF, then offers it as a link to open. Opening a window after the wait would be blocked
 * by many phone browsers.
 */
export default function ReportDownload({ side, id }) {
  const [outcome, setOutcome] = useState(null)
  const [isFetching, startFetching] = useTransition()
  if (outcome?.data) {
    return (
      <Button href={outcome.data.url} size="compact" target="_blank" rel="noreferrer">
        {text.downloadReady}
      </Button>
    )
  }
  const get = () =>
    startFetching(async () => setOutcome(await attempt(() => reportLinkAction(side, id))))
  return (
    <div className="flex flex-col items-start gap-2">
      <Button type="button" size="compact" onClick={get} isLoading={isFetching}>
        <Download size={16} aria-hidden="true" />
        {text.download}
      </Button>
      {outcome?.error && <p className="text-footnote text-error">{outcome.error}</p>}
    </div>
  )
}
