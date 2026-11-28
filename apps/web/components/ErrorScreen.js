'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { TriangleAlert } from 'lucide-react'
import Button from '@/components/Button'
import EmptyState from '@/components/EmptyState'
import { copy } from '@/copy/en'

const text = copy.errors.page

// Reads the page from the server again before drawing it again, since the fault is usually there.
function useRetry(reset) {
  const router = useRouter()
  const [isRetrying, startRetry] = useTransition()
  const retry = () =>
    startRetry(() => {
      router.refresh()
      reset()
    })
  return [isRetrying, retry]
}

/** Shown in place of a page that failed to draw, with a way to try again. The visitor sees plain words. */
export default function ErrorScreen({ error, reset }) {
  const [isRetrying, retry] = useRetry(reset)
  return (
    <div role="alert" className="flex min-h-[50dvh] flex-col items-center justify-center">
      <EmptyState
        icon={TriangleAlert}
        title={text.title}
        message={text.text}
        action={
          <div className="flex flex-col items-center gap-2">
            <Button onClick={retry} isLoading={isRetrying}>
              {text.retry}
            </Button>
            <Button href="/" variant="plain">
              {text.home}
            </Button>
          </div>
        }
      />
      {error?.digest && (
        <p className="text-footnote text-label-3">{text.reference(error.digest)}</p>
      )}
    </div>
  )
}
