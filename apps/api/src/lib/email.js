import { brand } from '@rent-a-car/shared'
import { AppError } from './errors.js'

const ZEPTOMAIL_URL = 'https://api.zeptomail.com/v1.1/email'
const TIMEOUT_MS = 10_000

/** Whether the mail service is set up. Without it (local development) emails stay queued. */
export const emailConfigured = () =>
  Boolean(process.env.ZEPTOMAIL_TOKEN) && Boolean(process.env.ZEPTOMAIL_FROM)

/**
 * Send one email through ZeptoMail. Gives up after ten seconds. Throws an Error whose message says what
 * went wrong (without the token) so the caller can record it and try again later.
 */
export async function sendEmail({ to, subject, text, html }) {
  if (!emailConfigured()) throw new AppError('INTERNAL_ERROR', { message: 'Email is not set up.' })
  const response = await fetch(ZEPTOMAIL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Zoho-enczapikey ${process.env.ZEPTOMAIL_TOKEN}`,
    },
    body: JSON.stringify({
      from: { address: process.env.ZEPTOMAIL_FROM, name: brand.name },
      to: [{ email_address: { address: to } }],
      subject,
      textbody: text,
      htmlbody: html,
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  if (!response.ok) throw new Error(`Mail service answered ${response.status}`)
}
