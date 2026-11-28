'use client'

import { attempt } from '@/lib/attempt'
import { useState, useTransition } from 'react'
import { signAgreementAction } from '@/app/(site)/account/actions'
import SignatureFields from '@/components/SignatureFields'
import { copy } from '@/copy/en'

const text = copy.trip.agreement

/** Tick, type your name, and draw if you like. `fingerprint` says which version was on screen. */
export default function AgreementSignForm({ bookingId, fingerprint, name }) {
  const [drawing, setDrawing] = useState(null)
  const [problem, setProblem] = useState(null)
  const [isSigning, startSigning] = useTransition()
  const sign = (event) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    if (!form.get('accept')) return setProblem(text.needTick)
    startSigning(async () => {
      const { error } = await attempt(() =>
        signAgreementAction(bookingId, {
          signed_name: form.get('signed_name'),
          accept_terms: true,
          terms_sha256: fingerprint,
          ...(drawing && { signature_image: drawing }),
        }),
      )
      setProblem(error ? text.failed : null)
    })
  }
  return (
    <form onSubmit={sign} className="flex flex-col gap-4">
      <label className="flex min-h-touch items-start gap-3 text-body">
        <input type="checkbox" name="accept" className="mt-1 h-5 w-5 accent-primary" />
        {text.accept}
      </label>
      <SignatureFields
        labels={text}
        name={name}
        onDraw={setDrawing}
        problem={problem}
        isSigning={isSigning}
      />
    </form>
  )
}
