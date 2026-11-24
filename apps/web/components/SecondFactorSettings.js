'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { disableSecondFactorAction } from '@/app/(site)/settings/actions'
import AuthForm from '@/components/AuthForm'
import Badge from '@/components/Badge'
import Button from '@/components/Button'
import EnrolPanel from '@/components/EnrolPanel'
import { copy } from '@/copy/en'
import { codeFields } from '@/lib/auth/fields'

const text = copy.settings.security.twoStep

function TurnOff({ onDone }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-callout text-label-2">{text.offHint}</p>
      <AuthForm
        action={disableSecondFactorAction}
        fields={codeFields}
        submitLabel={text.offSubmit}
        onSaved={onDone}
      />
    </div>
  )
}

/**
 * Whether signing in asks for a code from an authenticator app. Turning it on shows the picture to scan and asks for the
 * first code; turning it off asks for a code too. For staff and admin it is on, and stays on.
 */
export default function SecondFactorSettings({ isEnabled, isRequired }) {
  const router = useRouter()
  const [step, setStep] = useState(null)
  const close = () => setStep(null)
  const finish = () => {
    close()
    router.refresh()
  }
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-headline">{text.title}</p>
        <Badge tone={isEnabled ? 'success' : 'neutral'}>{isEnabled ? text.on : text.off}</Badge>
      </div>
      <p className="text-callout text-label-2">{isRequired ? text.required : text.hint}</p>
      {step === 'on' && <EnrolPanel next="/settings" />}
      {step === 'off' && <TurnOff onDone={finish} />}
      {step ? (
        <Button type="button" variant="plain" size="compact" className="self-start" onClick={close}>
          {text.cancel}
        </Button>
      ) : (
        !isRequired && (
          <Button
            type="button"
            variant="tonal"
            size="compact"
            className="self-start"
            onClick={() => setStep(isEnabled ? 'off' : 'on')}
          >
            {isEnabled ? text.turnOff : text.turnOn}
          </Button>
        )
      )}
    </div>
  )
}
