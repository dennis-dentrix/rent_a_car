import { StandardFonts, rgb } from 'pdf-lib'

// Writing a plain document into a PDF, shared by the rental agreement and the inspection report. The standard PDF
// fonts are used, so letters outside Western European languages are shown as their nearest plain letter or "?".
export const PAGE = { width: 595.28, height: 841.89, margin: 50 }
const TEXT_WIDTH = PAGE.width - PAGE.margin * 2

export const hexToRgb = (hex) => {
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

export const INK = rgb(0.1, 0.1, 0.1)
export const GREY = rgb(0.4, 0.4, 0.4)

// A cursor over the pages: writes downward and starts a new page when the next block will not fit.
/** The two faces every document uses. */
export const embedFonts = async (doc) => ({
  regular: await doc.embedFont(StandardFonts.Helvetica),
  bold: await doc.embedFont(StandardFonts.HelveticaBold),
})

export function createWriter(doc, fonts) {
  const writer = { doc, fonts, safe: makeSafe(fonts.regular), y: 0, page: null }
  addPage(writer)
  return writer
}

function addPage(writer) {
  writer.page = writer.doc.addPage([PAGE.width, PAGE.height])
  writer.y = PAGE.height - PAGE.margin
}

export function ensure(writer, height) {
  if (writer.y - height < PAGE.margin + 20) addPage(writer)
}

export function space(writer, height) {
  ensure(writer, height)
  writer.y -= height
}

export function paragraph(writer, text, { size = 10, bold = false, after = 6, color = INK } = {}) {
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
export function row(writer, label, value) {
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

/** A picture at the cursor, shrunk to fit the box and never enlarged. */
export function picture(writer, image, maxWidth, maxHeight) {
  const scale = Math.min(maxWidth / image.width, maxHeight / image.height, 1)
  const [width, height] = [image.width * scale, image.height * scale]
  ensure(writer, height + 8)
  writer.y -= height + 4
  writer.page.drawImage(image, { x: PAGE.margin, y: writer.y, width, height })
}
