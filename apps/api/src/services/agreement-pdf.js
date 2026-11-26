import { PDFDocument, rgb } from 'pdf-lib'
import { brand, formatMoney } from '@carvo/shared'
import { when } from './agreement-terms.js'
import {
  PAGE,
  hexToRgb,
  createWriter,
  ensure,
  picture,
  space,
  paragraph,
  row,
  embedFonts,
} from './pdf-writer.js'

// The agreement as a PDF: the booking details, the numbered terms, and a signature block. Unsigned, the block has
// blank lines so the same PDF can be printed and signed at the office. Signed, it shows who signed, when, and the
// agreement's fingerprint. The exact name the customer typed is kept in the signature record.

function signatureLine(writer, width) {
  ensure(writer, 30)
  writer.y -= 24
  const start = { x: PAGE.margin, y: writer.y }
  writer.page.drawLine({ start, end: { x: PAGE.margin + width, y: writer.y }, thickness: 0.6 })
}

function writeBooking(writer, { facts }) {
  const { booking, customer, vehicle } = facts
  paragraph(writer, `${brand.name}`, {
    size: 11,
    bold: true,
    after: 2,
    color: hexToRgb(brand.accent),
  })
  paragraph(writer, 'Vehicle Rental Agreement', { size: 20, bold: true, after: 10 })
  row(writer, 'Booking', booking.reference)
  row(writer, 'Rental company', facts.lessor)
  row(
    writer,
    'Renter',
    `${customer.full_name} (${customer.email}, ${customer.phone ?? 'no phone given'})`,
  )
  row(writer, 'Vehicle', `${vehicle.description}, ${vehicle.registration} (${vehicle.class_name})`)
  row(writer, 'Hire starts', when(booking.start_at))
  row(writer, 'Hire ends', when(booking.end_at))
  row(writer, 'Handover', booking.pickup_place)
  row(writer, 'Total', formatMoney(booking.total_kes, 'KES'))
  if (booking.deposit_kes > 0) {
    row(writer, 'Refundable deposit', formatMoney(booking.deposit_kes, 'KES'))
  }
  space(writer, 12)
}

function writeClauses(writer, { clauses }) {
  for (const clause of clauses) {
    // Keep a heading with the start of its text instead of leaving it alone at the foot of a page.
    ensure(writer, 70)
    paragraph(writer, `${clause.number}. ${clause.title}`, { bold: true, after: 2, size: 11 })
    paragraph(writer, clause.text, { after: 9 })
  }
}

function writeSignature(writer, terms, signature) {
  space(writer, 6)
  paragraph(writer, 'Signature', { size: 12, bold: true, after: 4 })
  if (!signature) {
    paragraph(writer, 'Renter (print name and sign)', { size: 9 })
    signatureLine(writer, 260)
    paragraph(writer, 'Date', { size: 9, after: 0 })
    signatureLine(writer, 120)
    return
  }
  paragraph(writer, `Signed electronically by ${signature.name}`, { bold: true, after: 2 })
  paragraph(writer, `On ${when(signature.signedAt)} (Nairobi time)`, { after: 6 })
  if (signature.image) picture(writer, signature.image, 180, 60)
  paragraph(
    writer,
    `Agreement version ${terms.version}. Fingerprint (SHA-256): ${terms.sha256.slice(0, 32)}`,
    { size: 8, color: rgb(0.4, 0.4, 0.4) },
  )
}

function addFooters(doc, reference, font) {
  const pages = doc.getPages()
  pages.forEach((page, index) => {
    page.drawText(`${reference}   Page ${index + 1} of ${pages.length}`, {
      x: PAGE.margin,
      y: 28,
      size: 8,
      font,
      color: rgb(0.5, 0.5, 0.5),
    })
  })
}

/**
 * Build the agreement PDF. `signature` is omitted for the copy to read or print, and is
 * `{ name, signedAt, pngBytes? }` for the signed copy. Returns the PDF as bytes.
 */
export async function renderAgreementPdf(terms, signature) {
  const doc = await PDFDocument.create()
  const fonts = await embedFonts(doc)
  const image = signature?.pngBytes ? await doc.embedPng(signature.pngBytes) : null
  const writer = createWriter(doc, fonts)
  writeBooking(writer, terms)
  writeClauses(writer, terms)
  writeSignature(writer, terms, signature && { ...signature, image })
  addFooters(doc, terms.facts.booking.reference, fonts.regular)
  return doc.save()
}
