'use client'

import { useState } from 'react'
import Alert from '@/components/Alert'
import Button from '@/components/Button'
import TextField from '@/components/Field'
import TextArea from '@/components/TextArea'
import { copy } from '@/copy/en'
import { buildEnquiry, enquiryErrors, sendEnquiry } from '@/lib/enquiry'

const text = copy.ask

// What was typed, what is wrong with it, and what sending does. Status moves idle, sending, then sent or
// error; the screen says "Sending" until the server has answered and never claims "sent" before it.
function useAskForm({ classId, defaultMessage }) {
  const [values, setValues] = useState({ name: '', email: '', message: defaultMessage })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')
  const change = (field) => (event) => setValues((now) => ({ ...now, [field]: event.target.value }))
  const submit = async (event) => {
    event.preventDefault()
    const found = enquiryErrors(values, text)
    setErrors(found)
    if (Object.keys(found).length > 0) return
    setStatus('sending')
    const { isSent } = await sendEnquiry(buildEnquiry({ ...values, classId }))
    setStatus(isSent ? 'sent' : 'error')
  }
  return { values, errors, status, change, submit }
}

function Sent({ onDone }) {
  return (
    <div className="flex flex-col gap-4">
      <Alert tone="success" title={text.sentTitle}>
        {text.sentText}
      </Alert>
      <Button isFullWidth onClick={onDone}>
        {text.close}
      </Button>
    </div>
  )
}

/** The question form, for a visitor with no account: a name, an email, and the question. */
export default function AskForm({ classId, defaultMessage = '', onDone }) {
  const form = useAskForm({ classId, defaultMessage })
  const { values, errors, status, change } = form
  if (status === 'sent') return <Sent onDone={onDone} />
  return (
    <form onSubmit={form.submit} className="flex flex-col gap-4" noValidate>
      <p className="text-callout text-label-2">{text.intro}</p>
      <TextField
        label={text.name}
        autoComplete="name"
        value={values.name}
        onChange={change('name')}
        error={errors.name}
      />
      <TextField
        label={text.email}
        type="email"
        autoComplete="email"
        value={values.email}
        onChange={change('email')}
        error={errors.email}
      />
      <TextArea
        label={text.message}
        value={values.message}
        onChange={change('message')}
        error={errors.message}
      />
      {status === 'error' && (
        <Alert tone="error" title={text.errorTitle}>
          {text.errorText}
        </Alert>
      )}
      <Button type="submit" isFullWidth isLoading={status === 'sending'}>
        {status === 'sending' ? text.sending : text.send}
      </Button>
    </form>
  )
}
