'use client'

import { attempt } from '@/lib/attempt'
import { useState, useSyncExternalStore } from 'react'
import { BellRing } from 'lucide-react'
import Button from '@/components/Button'
import { copy } from '@/copy/en'
import { askForDeviceAlerts, deviceAlertState } from '@/lib/device-alerts'

const noSubscription = () => () => {}

/** Offers desktop alerts to someone who has not been asked yet. The browser asks only after this press. */
export default function DeviceAlertsButton() {
  const state = useSyncExternalStore(noSubscription, deviceAlertState, () => 'unsupported')
  const [step, setStep] = useState('idle')
  if (state !== 'default' || step === 'answered') return null
  return (
    <Button
      variant="tonal"
      size="compact"
      className="self-start"
      isLoading={step === 'asking'}
      onClick={async () => {
        setStep('asking')
        await attempt(askForDeviceAlerts, null)
        setStep('answered')
      }}
    >
      <BellRing size={18} aria-hidden="true" />
      {copy.alerts.turnOn}
    </Button>
  )
}
