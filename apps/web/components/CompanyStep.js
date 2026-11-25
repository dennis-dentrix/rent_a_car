'use client'

import { useState, useTransition } from 'react'
import { markNoShowAction, recordMilestoneAction } from '@/app/console/actions'
import Alert from '@/components/Alert'
import Button from '@/components/Button'
import { copy } from '@/copy/en'

const text = copy.journey

const canMarkNoShow = ({ status, no_show_at: noShowAt, start_at: startAt }, now) =>
  ['confirmed', 'ready'].includes(status) && !noShowAt && new Date(startAt) < now

/** The company's one button for the next step, and "did not come" once the start time has passed. */
export default function CompanyStep({ bookingId, journey, startAt, now }) {
  const [problem, setProblem] = useState(false)
  const [isBusy, startWork] = useTransition()
  const run = (work) => startWork(async () => setProblem(!(await work())))
  const noShow = () => {
    if (window.confirm(text.noShowConfirm)) run(() => markNoShowAction(bookingId))
  }
  const step = journey.company_action
  return (
    <div className="flex flex-col gap-3">
      {problem && <Alert tone="error" title={text.failed} />}
      {step ? (
        <>
          <Button
            isFullWidth
            isLoading={isBusy}
            onClick={() => run(() => recordMilestoneAction(bookingId, step))}
          >
            {text.actions[step]}
          </Button>
          <p className="text-footnote text-label-2">{text.actionHint}</p>
        </>
      ) : (
        <p className="text-body text-label-2">{text.noActions}</p>
      )}
      {journey.no_show_at && <p className="text-callout font-semibold">{text.noShowDone}</p>}
      {canMarkNoShow({ ...journey, start_at: startAt }, new Date(now)) && (
        <Button variant="destructive" size="compact" isLoading={isBusy} onClick={noShow}>
          {text.noShow}
        </Button>
      )}
    </div>
  )
}
