import { CarFront, Inbox, ShieldCheck } from 'lucide-react'
import Alert from '@/components/Alert'
import Badge from '@/components/Badge'
import Button from '@/components/Button'
import Card from '@/components/Card'
import DataTable from '@/components/DataTable'
import EmptyState from '@/components/EmptyState'
import InsetList from '@/components/InsetList'
import Price from '@/components/Price'
import ProgressSteps from '@/components/ProgressSteps'
import QuoteBreakdown from '@/components/QuoteBreakdown'
import Skeleton from '@/components/Skeleton'
import StatusBadge from '@/components/StatusBadge'
import { BOOKING_STATUSES } from '@carvo/shared'

const QUOTE_LINES = [
  { kind: 'charge', label: 'Car hire', detail: '3 days × KES 4,500', kes: 13500 },
  { kind: 'discount', label: 'Weekly discount', kes: -1350 },
  { kind: 'refundable_deposit', label: 'Refundable deposit', kes: 30000 },
]

export function Badges() {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge>Neutral</Badge>
      <Badge tone="accent">Accent</Badge>
      <Badge tone="verified" icon={ShieldCheck}>
        Vetted operator
      </Badge>
      {BOOKING_STATUSES.map((status) => (
        <StatusBadge key={status} status={status} />
      ))}
    </div>
  )
}

export function Alerts() {
  return (
    <div className="flex flex-col gap-3">
      <Alert tone="info" title="Information" />
      <Alert tone="success" title="Saved" />
      <Alert tone="warning" title="Check the dates">
        The car is not free on one of these days.
      </Alert>
      <Alert tone="error" title="Could not save" action={<Button size="sm">Try again</Button>}>
        Your change was not saved.
      </Alert>
    </div>
  )
}

export function Prices() {
  return (
    <div className="flex flex-col gap-6 md:flex-row">
      <Card className="flex-1">
        <QuoteBreakdown lines={QUOTE_LINES} totalLabel="Total" totalKes={12150} />
      </Card>
      <Card className="flex-1">
        <Price kes={12150} className="text-price" />
        <Price kes={12150} displayCurrency="USD" rateToKes={129} rateDate="2026-11-20T09:00:00Z" />
      </Card>
    </div>
  )
}

const ROWS = [
  { id: 1, plate: 'KDA 000A', model: 'Example car', status: 'confirmed' },
  { id: 2, plate: 'KDB 000B', model: 'Example van', status: 'pending_payment' },
]
const COLUMNS = [
  { key: 'plate', label: 'Plate' },
  { key: 'model', label: 'Vehicle' },
  { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
]

export function Lists() {
  return (
    <div className="flex flex-col gap-6">
      <InsetList
        items={[
          { id: 'a', title: 'Driving licence', detail: 'Uploaded', href: '/dev/components' },
          {
            id: 'b',
            title: 'National ID',
            detail: 'Needed',
            trailing: <Badge tone="warning">To do</Badge>,
          },
        ]}
      />
      <DataTable columns={COLUMNS} rows={ROWS} getRowId={(row) => row.id} />
    </div>
  )
}

export function Placeholders() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="flex flex-col gap-2">
        <Skeleton className="aspect-[16/10] w-full" />
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-5 w-1/3" />
      </div>
      <EmptyState
        icon={Inbox}
        title="No bookings yet"
        message="Cars you book show up here."
        action={
          <Button variant="tonal" href="/cars">
            <CarFront size={18} aria-hidden="true" />
            Browse cars
          </Button>
        }
      />
      <ProgressSteps
        steps={['Dates', 'Details', 'Review']}
        current={1}
        stepLabel={(n, total) => `Step ${n} of ${total}`}
      />
    </div>
  )
}
