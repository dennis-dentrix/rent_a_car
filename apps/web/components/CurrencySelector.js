'use client'

import Menu from '@/components/Menu'
import { useCurrency } from '@/components/CurrencyProvider'
import { copy } from '@/copy/en'
import { DISPLAY_CURRENCIES } from '@/lib/currency'

/**
 * KES or US dollars, as a small menu in the header. It changes what is shown, not what is charged.
 * A currency with no rate yet is listed but cannot be chosen, and says so.
 */
export default function CurrencySelector() {
  const { currency, rates, setCurrency } = useCurrency()
  const items = DISPLAY_CURRENCIES.map((code) => {
    const isAvailable = code === 'KES' || Boolean(rates[code])
    return {
      value: code,
      label: copy.currency.names[code],
      hint: isAvailable ? undefined : copy.currency.unavailable,
      isDisabled: !isAvailable,
      isSelected: code === currency,
      onSelect: () => setCurrency(code),
    }
  })
  return (
    <Menu
      label={copy.currency.label}
      triggerClassName="px-4"
      triggerIcon={<span className="text-callout font-semibold">{currency}</span>}
      items={items}
    />
  )
}
