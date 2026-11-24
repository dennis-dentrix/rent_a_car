import Alert from '@/components/Alert'
import Button from '@/components/Button'

/**
 * A page's data did not load: what happened, and a link that asks for the same page again. `text` is the page's
 * copy with `errorTitle`, `errorText`, and `retry`.
 */
export default function LoadError({ text, href }) {
  return (
    <Alert
      tone="error"
      title={text.errorTitle}
      action={
        <Button href={href} variant="tonal" size="compact">
          {text.retry}
        </Button>
      }
    >
      {text.errorText}
    </Alert>
  )
}
