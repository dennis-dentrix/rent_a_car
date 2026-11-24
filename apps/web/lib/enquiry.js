const TIMEOUT_MS = 10000

/** The enquiry the API expects, from what the visitor typed. A car type is attached when asked from its page. */
export function buildEnquiry({ name, email, message, classId }) {
  return {
    name: name.trim(),
    email: email.trim(),
    message: message.trim(),
    ...(classId ? { class_id: classId } : {}),
  }
}

/** What is wrong with the form, as { field: message }, or an empty object when it can be sent. */
export function enquiryErrors({ name, email, message }, text) {
  const errors = {}
  if (name.trim().length < 2) errors.name = text.nameError
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) errors.email = text.emailError
  if (!message.trim()) errors.message = text.messageError
  return errors
}

/**
 * Sends an enquiry to the API through the site's own address. Resolves to { isSent: true } only after the
 * server has saved it; a slow or failing server gives { isSent: false } so the form can say so.
 */
export async function sendEnquiry(body) {
  try {
    const response = await fetch('/api/v1/enquiries', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    return { isSent: response.ok }
  } catch {
    return { isSent: false }
  }
}
