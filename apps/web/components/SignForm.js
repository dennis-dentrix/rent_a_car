'use client'

import { useState, useTransition } from 'react'
import { signInspectionAction } from '@/app/inspections/actions'
import RenterCode from '@/components/RenterCode'
import SignatureFields from '@/components/SignatureFields'
import { copy } from '@/copy/en'

const text = copy.inspections.sign

/**
 * One side's signature: the typed name, the drawing, and for a renter on the company's screen the emailed code.
 * `report` is { id, sha256 }; the fingerprint says which version was on screen. A refusal keeps what was entered.
 */
export default function SignForm({ side, report, name = '' }) {
  const [drawing, setDrawing] = useState(null)
  const [problem, setProblem] = useState(null)
  const [isSigning, startSigning] = useTransition()
  const needsCode = side === 'renterHere'
  const sign = (event) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    if (!drawing) return setProblem(text.needDrawing)
    startSigning(async () => {
      const result = await signInspectionAction(side, report.id, {
        signed_name: form.get('signed_name'),
        signature_image: drawing,
        report_sha256: report.sha256,
        ...(needsCode && { code: String(form.get('code')).trim() }),
      })
      setProblem(result.error ?? null)
    })
  }
  return (
    <form onSubmit={sign} className="flex flex-col gap-4">
      {needsCode && <RenterCode id={report.id} />}
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
