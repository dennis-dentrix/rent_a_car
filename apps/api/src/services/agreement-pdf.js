import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { brand, formatMoney } from '@rent-a-car/shared'
import { when } from './agreement-terms.js'

// The agreement as a PDF: the booking details, the numbered terms, and a signature block. Unsigned, the block has
// blank lines so the same PDF can be printed and signed at the office. Signed, it shows who signed, when, and the
// agreement's fingerprint. The standard PDF fonts are used, so letters outside Western European languages are
// shown as their nearest plain letter or "?"; the exact name the customer typed is kept in the signature record.
const PAGE = { width: 595.28, height: 841.89, margin: 50 }
const TEXT_WIDTH = PAGE.width - PAGE.margin * 2

const hexToRgb = (hex) => {
  const value = parseInt(hex.slice(1), 16)
  return rgb(((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255)
}

// Letters that have no accent to strip but a plain look-alike.
const LOOKALIKES = { Ł: 'L', ł: 'l', Đ: 'D', đ: 'd', ı: 'i', Ħ: 'H', ħ: 'h' }

/** Replace what the standard fonts cannot draw: keep it if possible, else the plain letter, else "?". */
function makeSafe(font) {
  const known = new Set(font.getCharacterSet())
  const drawable = (text) => text.length > 0 && [...text].every((c) => known.has(c.codePointAt(0)))
  const substitute = (char) => {
    if (known.has(char.codePointAt(0))) return char
    const plain = (LOOKALIKES[char] ?? char).normalize('NFD').replace(/\p{M}/gu, '')
    return drawable(plain) ? plain : '?'
  }
  return (text) => [...String(text).replace(/\s+/g, ' ')].map(substitute).join('')
}

function wrap(text, font, size, maxWidth) {
  const lines = []
  let line = ''
  for (const word of text.split(' ')) {
    const attempt = line ? `${line} ${word}` : word
    if (font.widthOfTextAtSize(attempt, size) <= maxWidth || !line) line = attempt
    else {
      lines.push(line)
      line = word
    }
  }
  return [...lines, line]
}

const INK = rgb(0.1, 0.1, 0.1)
const GREY = rgb(0.4, 0.4, 0.4)

// A cursor over the pages: writes downward and starts a new page when the next block will not fit.
function createWriter(doc, fonts) {
  const writer = { doc, fonts, safe: makeSafe(fonts.regular), y: 0, page: null }
  addPage(writer)
  return writer
}

function addPage(writer) {
  writer.page = writer.doc.addPage([PAGE.width, PAGE.height])
  writer.y = PAGE.height - PAGE.margin
}

function ensure(writer, height) {
  if (writer.y - height < PAGE.margin + 20) addPage(writer)
}

function space(writer, height) {
  ensure(writer, height)
  writer.y -= height
}

function paragraph(writer, text, { size = 10, bold = false, after = 6, color = INK } = {}) {
  const font = bold ? writer.fonts.bold : writer.fonts.regular
  const lines = wrap(writer.safe(text), font, size, TEXT_WIDTH)
  ensure(writer, lines.length * size * 1.35)
  for (const line of lines) {
    writer.y -= size * 1.35
    writer.page.drawText(line, { x: PAGE.margin, y: writer.y, size, font, color })
  }
  writer.y -= after
}

// A label with its value beside it, for the booking details.
function row(writer, label, value) {
  ensure(writer, 16)
  writer.y -= 14
  const { page, fonts, safe } = writer
  page.drawText(safe(label), {
    x: PAGE.margin,
    y: writer.y,
    size: 9,
    font: fonts.regular,
    color: GREY,
  })
  wrap(safe(value), fonts.bold, 10, TEXT_WIDTH - 130).forEach((line, index) => {
    if (index > 0) writer.y -= 13
    page.drawText(line, {
      x: PAGE.margin + 130,
      y: writer.y,
      size: 10,
      font: fonts.bold,
      color: INK,
    })
  })
  writer.y -= 3
}

function signatureLine(writer, width) {
  ensure(writer, 30)
  writer.y -= 24
  const start = { x: PAGE.margin, y: writer.y }
  writer.page.drawLine({ start, end: { x: PAGE.margin + width, y: writer.y }, thickness: 0.6 })
}

function picture(writer, image, maxWidth, maxHeight) {
  const scale = Math.min(maxWidth / image.width, maxHeight / image.height, 1)
  const [width, height] = [image.width * scale, image.height * scale]
  ensure(writer, height + 8)
  writer.y -= height + 4
  writer.page.drawImage(image, { x: PAGE.margin, y: writer.y, width, height })
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
  row(writer, 'Refundable deposit', formatMoney(booking.deposit_kes, 'KES'))
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
  const fonts = {
    regular: await doc.embedFont(StandardFonts.Helvetica),
    bold: await doc.embedFont(StandardFonts.HelveticaBold),
  }
  const image = signature?.pngBytes ? await doc.embedPng(signature.pngBytes) : null
  const writer = createWriter(doc, fonts)
  writeBooking(writer, terms)
  writeClauses(writer, terms)
  writeSignature(writer, terms, signature && { ...signature, image })
  addFooters(doc, terms.facts.booking.reference, fonts.regular)
  return doc.save()
}
