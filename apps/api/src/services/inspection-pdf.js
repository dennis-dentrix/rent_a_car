import { PDFDocument } from 'pdf-lib'
import { INSPECTION_CHECK_LABELS, brand, orderedChecks } from '@carvo/shared'
import { readFile } from '../lib/storage.js'
import { when } from './agreement-terms.js'
import {
  GREY,
  createWriter,
  hexToRgb,
  paragraph,
  picture,
  row,
  space,
  embedFonts,
  ensure,
} from './pdf-writer.js'

// The sealed report: what was inspected, the photos, the company's rules, and both signatures with the report's
// fingerprint, so a printed or emailed copy stands on its own.
const WORDS = {
  pickup: 'Pickup inspection report',
  return: 'Return inspection report',
  empty: 'Empty',
  quarter: 'One quarter',
  half: 'Half',
  three_quarters: 'Three quarters',
  full: 'Full',
}
const readable = (key) => WORDS[key] ?? key.replaceAll('_', ' ')

function writeFacts(writer, { record, company }) {
  const { booking, vehicle } = record
  paragraph(writer, brand.name, { size: 11, bold: true, after: 2, color: hexToRgb(brand.accent) })
  paragraph(writer, WORDS[record.type], { size: 18, bold: true, after: 8 })
  row(writer, 'Booking', booking.reference)
  row(writer, 'Rental company', company?.business_name ?? brand.name)
  row(writer, 'Renter', `${booking.customer.full_name} (${booking.customer.email})`)
  const car = [vehicle.make, vehicle.model, vehicle.year, vehicle.colour].filter(Boolean).join(' ')
  row(writer, 'Vehicle', `${car}, ${vehicle.registration}`)
  row(writer, 'Recorded', `${when(record.recorded_at)} (Nairobi time)`)
  row(writer, 'Mileage', `${record.mileage_km} km`)
  row(writer, 'Fuel', readable(record.fuel_level))
  space(writer, 10)
}

function writeCondition(writer, { record, policy }) {
  paragraph(writer, 'Condition', { size: 12, bold: true, after: 4 })
  for (const [check, result] of orderedChecks(record.checklist)) {
    const label = INSPECTION_CHECK_LABELS[check] ?? readable(check)
    row(writer, label, result === 'ok' ? 'Fine' : 'Needs attention')
  }
  space(writer, 6)
  paragraph(writer, record.damage_noted ? 'Damage was noted.' : 'No damage was noted.', {
    bold: true,
  })
  if (record.condition_notes) paragraph(writer, record.condition_notes)
  const rules = policy?.rules ?? []
  if (rules.length) {
    paragraph(writer, 'Rental rules', { size: 12, bold: true, after: 4 })
    rules.forEach((rule) => paragraph(writer, `- ${rule}`, { after: 2 }))
  }
}

// A report is built in memory, so only so many bytes of photos go into the PDF. Every photo is still kept, and counted
// in the fingerprint.
const PHOTO_BUDGET = 20 * 1024 * 1024

const embed = (doc, bytes, contentType) =>
  contentType === 'image/png' ? doc.embedPng(bytes) : doc.embedJpg(bytes)

// A picture that cannot be read must not stop the report from being sealed; the report says it was left out.
async function placePhoto(writer, file) {
  try {
    const bytes = await readFile(file.storage_path)
    picture(writer, await embed(writer.doc, bytes, file.content_type), 240, 180)
    return ''
  } catch {
    return ' (kept on file; it could not be shown here)'
  }
}

// One photo after another, so a long set simply runs onto more pages.
async function writePhotos(writer, files) {
  paragraph(writer, 'Photos', { size: 12, bold: true, after: 4 })
  let used = 0
  for (const [index, file] of files.filter((entry) => entry.kind === 'photo').entries()) {
    used += file.size_bytes
    const note =
      used > PHOTO_BUDGET
        ? ' (kept on file; too large to show here)'
        : await placePhoto(writer, file)
    const name = file.label ?? `Photo ${index + 1}`
    paragraph(writer, `${name}${note}`, { size: 8, color: GREY })
  }
}

async function writeSignatures(writer, signatures, sha256) {
  paragraph(writer, 'Signatures', { size: 12, bold: true, after: 4 })
  for (const signature of signatures) {
    const who = signature.party === 'operator' ? 'For the rental company' : 'Renter'
    const how =
      signature.method === 'account' ? 'signed in to their account' : 'on the company screen'
    // A name, its date, and the drawing stay on one page.
    ensure(writer, 110)
    paragraph(writer, `${who}: ${signature.signed_name}`, { bold: true, after: 2 })
    paragraph(writer, `${when(signature.signed_at)} (Nairobi time), ${how}`, { size: 9, after: 2 })
    if (signature.signature_path) {
      picture(writer, await writer.doc.embedPng(await readFile(signature.signature_path)), 180, 60)
    }
  }
  paragraph(writer, `Report fingerprint (SHA-256): ${sha256}`, { size: 8, color: GREY })
}

/** The sealed report as PDF bytes. `sha256` is the report fingerprint both parties signed. */
export async function renderInspectionPdf(report, sha256) {
  const doc = await PDFDocument.create()
  const fonts = await embedFonts(doc)
  const writer = createWriter(doc, fonts)
  writeFacts(writer, report)
  writeCondition(writer, report)
  await writePhotos(writer, report.files)
  await writeSignatures(writer, report.signatures, sha256)
  return Buffer.from(await doc.save())
}
