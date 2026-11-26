'use client'

import { useState, useSyncExternalStore } from 'react'
import { BellRing } from 'lucide-react'
import Button from '@/components/Button'
import { copy } from '@/copy/en'
import { askForDeviceAlerts, deviceAlertState } from '@/lib/device-alerts'

const noSubscription = () => () => {}

/** Offers desktop alerts to someone who has not been asked yet. The browser asks only after this press. */
export default function DeviceAlertsButton() {
  const state = useSyncExternalStore(noSubscription, deviceAlertState, () => 'unsupported')
  const [answered, setAnswered] = useState(false)
  if (state !== 'default' || answered) return null
  return (
    <Button
      variant="tonal"
      size="compact"
      className="self-start"
      onClick={async () => {
        await askForDeviceAlerts()
        setAnswered(true)
      }}
    >
      <BellRing size={18} aria-hidden="true" />
      {copy.alerts.turnOn}
    </Button>
  )
}
