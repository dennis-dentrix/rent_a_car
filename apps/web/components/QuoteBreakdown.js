import Price from '@/components/Price'
import { cx } from '@/lib/cx'

const DEPOSIT_KINDS = ['refundable_deposit', 'security_deposit']

function Line({ line }) {
  return (
    <li className="flex items-start justify-between gap-4 py-2">
      <span>
        <span className="block text-body">{line.label}</span>
        {line.detail && <span className="num block text-footnote text-label-2">{line.detail}</span>}
      </span>
      <Price
        kes={line.kes}
        className={cx('text-body', line.kind === 'discount' && 'text-success')}
      />
    </li>
  )
}

/**
 * The price, line by line. The rental total is its own row; the refundable deposit and any security
 * deposit sit apart below it, so they are never mistaken for part of the rental price. Lines come
 * from the server: kind is charge, discount, tax, refundable_deposit or security_deposit.
 */
export default function QuoteBreakdown({ lines, totalLabel, totalKes }) {
  const rental = lines.filter((line) => !DEPOSIT_KINDS.includes(line.kind))
  const deposits = lines.filter((line) => DEPOSIT_KINDS.includes(line.kind))
  return (
    <div>
      <ul className="divide-y divide-separator">
        {rental.map((line) => (
          <Line key={line.label} line={line} />
        ))}
      </ul>
      <div className="mt-2 flex items-baseline justify-between border-t border-label py-3">
        <span className="text-headline">{totalLabel}</span>
        <Price kes={totalKes} className="text-price" />
      </div>
      {deposits.length > 0 && (
        <ul className="mt-1 divide-y divide-separator rounded-card bg-bg-grouped px-3">
          {deposits.map((line) => (
            <Line key={line.label} line={line} />
          ))}
        </ul>
      )}
    </div>
  )
}
