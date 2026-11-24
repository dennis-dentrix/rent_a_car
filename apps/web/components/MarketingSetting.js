'use client'

import { setMarketingAction } from '@/app/(site)/settings/actions'
import Switch from '@/components/Switch'
import { copy } from '@/copy/en'

const text = copy.settings.notifications

/** Offers and news, on or off. The switch moves at once and goes back, with a message, if the server will not keep it. */
export default function MarketingSetting({ isOn }) {
  const change = async (next) => {
    const result = await setMarketingAction(next)
    return !result.error && result.isOn === next
  }
  return (
    <Switch
      label={text.marketing}
      hint={text.marketingHint}
      isOn={isOn}
      onChange={change}
      failedText={text.failed}
    />
  )
}
