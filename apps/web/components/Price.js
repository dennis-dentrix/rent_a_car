'use client'

import { convertFromKes, formatMoney, formatShortDate } from '@carvo/shared'
import { useCurrency } from '@/components/CurrencyProvider'
import { copy } from '@/copy/en'
import { cx } from '@/lib/cx'

/**
 * The only component that formats money. Amounts are whole KES. In another currency it shows the converted
 * amount and, below it, what is charged and the rate date, so the customer sees both. With no props it
 * follows the visitor's chosen currency; a quote passes its own rate, which was fixed when it was made.
 */
export default function Price({ kes, displayCurrency, rateToKes, rateDate, className }) {
  const choice = useCurrency()
  const currency = displayCurrency ?? choice.currency
  const rate = rateToKes ?? choice.rates[currency]?.rate_to_kes
  const date = rateDate ?? choice.rates[currency]?.rate_date
  const isConverted = currency !== 'KES' && Boolean(rate)
  const shown = isConverted ? formatMoney(convertFromKes(kes, rate), currency) : formatMoney(kes)
  return (
    <span className={cx('num inline-flex flex-col', className)}>
      <span>{shown}</span>
      {isConverted && (
        <span className="text-footnote font-normal text-label-2">
          {copy.price.charged(formatMoney(kes), formatShortDate(date))}
        </span>
      )}
    </span>
  )
}
