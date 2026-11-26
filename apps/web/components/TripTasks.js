import Button from '@/components/Button'
import DocumentUpload from '@/components/DocumentUpload'
import StatusPill from '@/components/StatusPill'
import { copy } from '@/copy/en'

const text = copy.trip
const TONES = { todo: 'warning', checking: 'info', done: 'success', rejected: 'error' }

function Action({ task, bookingId }) {
  if (task.key === 'agreement') {
    return (
      <Button href={`/account/bookings/${bookingId}/agreement`} variant="tonal" size="compact">
        {task.state === 'done' ? text.view : text.readAndSign}
      </Button>
    )
  }
  if (task.state === 'done') return null
  const label = task.state === 'todo' ? text.upload : text.replace
  return <DocumentUpload bookingId={bookingId} type={task.key} label={label} />
}

/** What to do before pickup, one row each, with how far it has got and the one thing to do about it. */
export default function TripTasks({ tasks, bookingId }) {
  return (
    <section aria-labelledby="trip-tasks" className="flex flex-col gap-2">
      <h2 id="trip-tasks" className="text-headline">
        {text.tasksTitle}
      </h2>
      <ul className="divide-y divide-separator rounded-panel border border-separator bg-surface">
        {tasks.map((task) => (
          <li key={task.key} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex flex-col items-start gap-1">
              <span className="text-body font-semibold">{text.tasks[task.key]}</span>
              <StatusPill tone={TONES[task.state]}>{text.states[task.state]}</StatusPill>
              {task.reason && <span className="text-footnote text-error">{task.reason}</span>}
            </div>
            <Action task={task} bookingId={bookingId} />
          </li>
        ))}
      </ul>
      <p className="text-footnote text-label-2">{text.fileHelper}</p>
    </section>
  )
}
