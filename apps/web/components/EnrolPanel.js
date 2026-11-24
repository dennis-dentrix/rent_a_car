'use client'

import { useEffect, useRef, useState } from 'react'
import { confirmEnrolAction, startEnrolAction } from '@/app/auth/actions'
import Alert from '@/components/Alert'
import AuthForm from '@/components/AuthForm'
import { copy } from '@/copy/en'
import { codeFields } from '@/lib/auth/fields'

const text = copy.auth.enrol

function Secret({ setup }) {
  return (
    <div className="mb-6 flex flex-col items-center gap-3 rounded-card bg-bg-grouped p-4">
      {/* The picture is a data address from Supabase, so there is nothing for next/image to optimise. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={setup.qrCode} alt={text.qrAlt} width={192} height={192} />
      <p className="text-footnote text-label-2">{text.secretLabel}</p>
      <code className="break-all text-callout">{setup.secret}</code>
    </div>
  )
}

/**
 * The authenticator setup: the picture to scan, the key as text, and the box for the first code. The secret is made
 * once, when this appears, and kept in this component, so it stays the same however often the page around it is
 * drawn again (a wrong code does that). Making it while the page is drawn would replace it each time.
 */
export default function EnrolPanel({ next }) {
  const [setup, setSetup] = useState(null)
  const hasStarted = useRef(false)
  useEffect(() => {
    if (hasStarted.current) return
    hasStarted.current = true
    startEnrolAction().then((result) => setSetup(result))
  }, [])

  if (!setup) return <p className="text-callout text-label-2">{copy.auth.working}</p>
  if (setup.error) return <Alert tone="error" title={text.unavailable} />
  return (
    <>
      <Secret setup={setup} />
      <AuthForm
        action={confirmEnrolAction}
        fields={codeFields}
        hidden={{ next, factorId: setup.factorId }}
        submitLabel={text.submit}
      />
    </>
  )
}
