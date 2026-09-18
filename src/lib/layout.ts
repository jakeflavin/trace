/**
 * Turns a sheet into pages of marks.
 *
 * This is the whole rule for where everything goes, and it knows nothing about React or
 * SVG: it takes a way to measure text and hands back lines, runs of text and boxes with
 * coordinates on a page of a known size. `SheetPage` draws them and nothing more, which is
 * what lets every layout be tested against a fake ruler.
 *
 * A row is a set of handwriting guides: a top line, a dashed midline at the font's real
 * x-height, a baseline, and an optional line for the tails. The letters are sized so a
 * tall letter reaches the top line exactly. That is the one thing a tracing sheet has to
 * get right, and why the font's shape is measured rather than assumed.
 */
import { type Font, type FontMetrics, findFont } from './fonts'
import { MARGIN, type PaperSize, paperSize } from './paper'
import { type Sheet, type SizeId, type Stroke, findLayout, titleOf, wordsOf } from './sheet'

/** The width of `text` at `fontSize`, before any letter spacing. */
export type Measure = (text: string, fontSize: number) => number

export type LineKind = 'top' | 'mid' | 'base' | 'desc' | 'blank'

export interface Line {
  x1: number
  y1: number
  x2: number
  y2: number
  kind: LineKind
}

/** A word on the page: `ink` is solid and final, the rest are there to be written over. */
export type RunStyle = Stroke | 'ink'

export interface Run {
  x: number
  /** The baseline. */
  y: number
  text: string
  size: number
  style: RunStyle
  spacing: number
}

export interface Box {
  x: number
  y: number
  w: number
  h: number
  kind: 'box' | 'card'
}

export interface Page {
  width: number
  height: number
  title: string
  nameLine: boolean
  lines: Line[]
  runs: Run[]
  boxes: Box[]
}

/** The top line's height above the baseline, per size. Large is three quarters of an inch. */
const CAP: Record<SizeId, number> = { small: 34, medium: 50, large: 70 }

const HEADER = 60
const TITLE_SIZE = 30
const LABEL_SIZE = 14

interface Row {
  /** The baseline. */
  y: number
  cap: number
  xh: number
  desc: number
  size: number
}

interface Ctx {
  sheet: Sheet
  font: Font
  metrics: FontMetrics
  measure: Measure
  paper: PaperSize
  cap: number
}

/** A ruler for the fallback shape of a font: near enough for tests and the first frame. */
export function roughMeasure(text: string, fontSize: number): number {
  return text.length * fontSize * 0.55
}

class Doc {
  pages: Page[] = []
  private y = 0
  private title = ''
  private ctx: Ctx

  constructor(ctx: Ctx) {
    this.ctx = ctx
  }

  get page(): Page {
    const page = this.pages[this.pages.length - 1]
    if (!page) throw new Error('no page open')
    return page
  }

  get left() {
    return MARGIN
  }

  get right() {
    return this.ctx.paper.width - MARGIN
  }

  get width() {
    return this.right - this.left
  }

  get bottom() {
    return this.ctx.paper.height - MARGIN
  }

  get top() {
    return this.y
  }

  open(title: string) {
    this.title = title
    const { sheet, paper } = this.ctx
    const heading = title !== '' || sheet.nameLine
    this.pages.push({
      width: paper.width,
      height: paper.height,
      title,
      nameLine: sheet.nameLine,
      lines: [],
      runs: [],
      boxes: [],
    })
    this.y = MARGIN + (heading ? HEADER : 0)
    if (sheet.nameLine) this.nameLine()
  }

  /** "Name" and "Date" with blanks, in the corner, in the same hand as the sheet. */
  private nameLine() {
    const { measure } = this.ctx
    const y = MARGIN + 24
    const label = (text: string) => measure(text, LABEL_SIZE)
    let x = this.right
    const blank = (w: number) => {
      x -= w
      this.page.lines.push({ x1: x, y1: y + 2, x2: x + w, y2: y + 2, kind: 'blank' })
    }
    const word = (text: string) => {
      const w = label(text)
      x -= w + 6
      this.page.runs.push({ x, y, text, size: LABEL_SIZE, style: 'ink', spacing: 0 })
      x -= 8
    }
    blank(110)
    word('Date')
    x -= 16
    blank(200)
    word('Name')
  }

  /** The geometry of a row of the given cap height. */
  row(cap: number): Row {
    const { metrics } = this.ctx
    const size = cap / metrics.ascent
    return { y: 0, cap, xh: size * metrics.xHeight, desc: size * metrics.descent, size }
  }

  pitch(cap: number): number {
    const row = this.row(cap)
    return row.cap + row.desc + Math.max(16, Math.round(cap * 0.32))
  }

  /** Room for `h` more, or a fresh page under the same title. */
  need(h: number) {
    if (this.pages.length > 0 && this.y + h <= this.bottom) return
    this.open(this.title)
  }

  /** A row of guides across `x1..x2`, ready to be written on. Returns its baseline. */
  guides(row: Row, x1: number, x2: number, y: number) {
    const { sheet } = this.ctx
    const lines = this.page.lines
    lines.push({ x1, y1: y - row.cap, x2, y2: y - row.cap, kind: 'top' })
    if (sheet.midline) lines.push({ x1, y1: y - row.xh, x2, y2: y - row.xh, kind: 'mid' })
    lines.push({ x1, y1: y, x2, y2: y, kind: 'base' })
    if (sheet.descender) lines.push({ x1, y1: y + row.desc, x2, y2: y + row.desc, kind: 'desc' })
  }

  /** Lays down a full-width row and lets `fill` put words on it. */
  line(cap: number, fill: (row: Row, x1: number, x2: number) => void = () => {}) {
    const pitch = this.pitch(cap)
    this.need(pitch)
    const row = { ...this.row(cap), y: this.y + cap }
    this.guides(row, this.left, this.right, row.y)
    fill(row, this.left, this.right)
    this.y += pitch
  }

  /** Every row the page has room for. */
  fillPage(cap: number, fill: (row: Row, x1: number, x2: number, index: number) => void) {
    let index = 0
    while (this.y + this.pitch(cap) <= this.bottom) {
      this.line(cap, (row, x1, x2) => fill(row, x1, x2, index))
      index += 1
    }
  }

  /** The width `text` takes on the page, letter spacing included. */
  width_(text: string, row: Row): number {
    const { measure, font } = this.ctx
    return measure(text, row.size) + font.tracking * row.cap * text.length
  }

  run(text: string, row: Row, x: number, style: RunStyle): number {
    const { font } = this.ctx
    const w = this.width_(text, row)
    this.page.runs.push({
      x,
      y: row.y,
      text,
      size: row.size,
      style,
      spacing: font.tracking * row.cap,
    })
    return w
  }

  /** `text` repeated from `x1`, as many times as fit before `limit`, and at least once. */
  repeat(text: string, row: Row, x1: number, limit: number, style: RunStyle): number {
    const gap = row.cap * 0.7
    const w = this.width_(text, row)
    let x = x1
    let n = 0
    while (n === 0 || x + w <= limit) {
      this.run(text, row, x, style)
      x += w + gap
      n += 1
    }
    return n
  }

  /** `text` broken into lines no wider than `width`, at the row's size. Never empty. */
  wrap(text: string, row: Row, width: number): string[] {
    const lines: string[] = []
    let current = ''
    for (const word of text.split(' ')) {
      const next = current ? `${current} ${word}` : word
      if (current && this.width_(next, row) > width) {
        lines.push(current)
        current = word
      } else {
        current = next
      }
    }
    if (current) lines.push(current)
    return lines.length > 0 ? lines : [text]
  }

  /** The largest cap height, up to `max`, at which `text` fits in `width`. */
  fit(text: string, width: number, max: number): number {
    const at = this.width_(text, this.row(max))
    return at <= width ? max : Math.max(12, Math.floor((max * width) / at))
  }
}

/* ------------------------------------------------------------------ layouts */

type PerWord = (doc: Doc, word: string, cap: number, stroke: Stroke) => void
type Shared = (doc: Doc, words: string[], cap: number, stroke: Stroke) => void

const repeat: PerWord = (doc, word, cap, stroke) => {
  doc.fillPage(cap, (row, x1, x2) => doc.repeat(word, row, x1, x2, stroke))
}

const traceWrite: PerWord = (doc, word, cap, stroke) => {
  doc.fillPage(cap, (row, x1, x2) => doc.repeat(word, row, x1, x1 + (x2 - x1) / 2, stroke))
}

/** A model, then grey to write over, then dots to follow, then the child alone. */
const FADE: readonly (RunStyle | null)[] = ['ink', 'grey', 'dotted', null]

const fade: PerWord = (doc, word, cap) => {
  doc.fillPage(cap, (row, x1, x2, index) => {
    const style = FADE[index % FADE.length]
    if (style) doc.repeat(word, row, x1, x2, style)
  })
}

const letters: PerWord = (doc, word, cap, stroke) => {
  for (const letter of [...word].filter((ch) => ch.trim())) {
    doc.line(cap, (row, x1, x2) => doc.repeat(letter, row, x1, x2, stroke))
  }
  doc.line(cap, (row, x1, x2) => doc.repeat(word, row, x1, x2, stroke))
  doc.fillPage(cap, (row, x1, x2) => doc.repeat(word, row, x1, x2, stroke))
}

const boxes: PerWord = (doc, word, given, stroke) => {
  const letters_ = [...word]
  const boxWidth = (cap: number) => {
    const probe = doc.row(cap)
    const widest = Math.max(...letters_.map((ch) => (ch.trim() ? doc.width_(ch, probe) : 0)))
    return Math.max(cap * 0.75, widest + cap * 0.4)
  }
  const slots = letters_.reduce((n, ch) => n + (ch.trim() ? 1 : 0.5), 0)
  // Boxes are wider than letters, so the word's own fit is not enough; the row of boxes has to fit.
  const cap =
    slots * boxWidth(given) <= doc.width
      ? given
      : Math.max(12, Math.floor((given * doc.width) / (slots * boxWidth(given))))
  const bw = boxWidth(cap)
  const pad = cap * 0.16
  const styles: RunStyle[] = ['ink', stroke, stroke]
  doc.fillPage(cap + pad * 2, (row, x1, _x2, index) => {
    // The row is taller than the letters by the box padding; the baseline sits inside.
    const inner = { ...doc.row(cap), y: row.y - pad }
    const style = styles[index]
    let x = x1
    for (const ch of letters_) {
      if (!ch.trim()) {
        x += bw * 0.5
        continue
      }
      if (x + bw > doc.right) break
      doc.page.boxes.push({
        x,
        y: inner.y - inner.cap - pad,
        w: bw,
        h: inner.cap + inner.desc + pad * 2,
        kind: 'box',
      })
      doc.guides(inner, x, x + bw, inner.y)
      if (style) {
        const w = doc.width_(ch, inner)
        doc.run(ch, inner, x + (bw - w) / 2, style)
      }
      x += bw
    }
  })
}

const cases: PerWord = (doc, word, cap, stroke) => {
  const pair = [word.toLocaleUpperCase(), word.toLocaleLowerCase()]
  doc.fillPage(cap, (row, x1, x2, index) => {
    doc.repeat(pair[index % 2] ?? word, row, x1, x2, stroke)
  })
}

const rainbow: PerWord = (doc, word, cap) => {
  const big = doc.fit(word, doc.width, cap * 2.3)
  doc.fillPage(big, (row, x1) => doc.run(word, row, x1, 'hollow'))
}

const list: Shared = (doc, words, cap, stroke) => {
  for (const word of words) {
    doc.line(doc.fit(word, doc.width, cap), (row, x1, x2) => {
      const w = doc.run(word, row, x1, 'ink')
      const gap = row.cap * 0.9
      if (x1 + w + gap + w <= x2) doc.repeat(word, row, x1 + w + gap, x2, stroke)
    })
  }
}

const sentence: Shared = (doc, words, cap, stroke) => {
  const probe = doc.row(cap)
  for (const entry of words) {
    for (const text of doc.wrap(entry, probe, doc.width)) {
      // One word wider than the page cannot wrap; that line shrinks instead.
      const size = doc.fit(text, doc.width, cap)
      // The traced line and its blank copy stay together across a page break.
      doc.need(doc.pitch(size) * 2)
      doc.line(size, (row, x1) => doc.run(text, row, x1, stroke))
      doc.line(size)
    }
  }
}

const cards: Shared = (doc, words, cap, stroke) => {
  const COLS = 2
  const ROWS = 4
  const gap = 16
  const pad = 20
  const w = (doc.width - gap * (COLS - 1)) / COLS
  const pages = Math.max(1, Math.ceil(words.length / (COLS * ROWS)))
  for (let p = 0; p < pages; p += 1) {
    if (p > 0) doc.open(doc.page.title)
    const h = (doc.bottom - doc.top - gap * (ROWS - 1)) / ROWS
    for (let i = 0; i < COLS * ROWS; i += 1) {
      const word = words[(p * COLS * ROWS + i) % words.length]
      if (word === undefined) break
      const x = doc.left + (i % COLS) * (w + gap)
      const y = doc.top + Math.floor(i / COLS) * (h + gap)
      doc.page.boxes.push({ x, y, w, h, kind: 'card' })
      const inner = w - pad * 2
      // A word takes the biggest size that fits; a sentence wraps, and shrinks only once
      // even three lines will not fit the card.
      let size = doc.fit(word, inner, Math.min(cap, (h - pad * 2) / 1.6))
      let lines = [word]
      if (word.includes(' ') && doc.width_(word, doc.row(size)) > inner) {
        size = Math.min(cap, (h - pad * 2) / 1.6)
        for (;;) {
          lines = doc.wrap(word, doc.row(size), inner)
          const tall = lines.length * doc.pitch(size)
          const wide = Math.max(...lines.map((line) => doc.width_(line, doc.row(size))))
          if ((tall <= h - pad * 2 && wide <= inner) || size <= 12) break
          size = Math.max(12, Math.floor(size * 0.9))
        }
      }
      const pitch = doc.pitch(size)
      const first = y + h / 2 - (lines.length * pitch) / 2 + doc.row(size).cap + pad * 0.3
      lines.forEach((line, n) => {
        const row = { ...doc.row(size), y: first + n * pitch }
        doc.guides(row, x + pad, x + w - pad, row.y)
        const tw = doc.width_(line, row)
        doc.run(line, row, x + (w - tw) / 2, stroke)
      })
    }
  }
}

const lined: Shared = (doc, words, cap) => {
  const model = words[0]
  if (model) doc.line(doc.fit(model, doc.width, cap), (row, x1) => doc.run(model, row, x1, 'ink'))
  doc.fillPage(cap, () => {})
}

const PER_WORD: Record<string, PerWord> = {
  repeat,
  traceWrite,
  fade,
  letters,
  boxes,
  cases,
  rainbow,
}

const SHARED: Record<string, Shared> = { list, sentence, cards, lined }

/* -------------------------------------------------------------------- entry */

export interface LayoutInput {
  sheet: Sheet
  metrics?: FontMetrics
  measure?: Measure
}

/** Every page the sheet prints, in order. Never empty: a sheet with no words is lined paper. */
export function layoutSheet({ sheet, metrics, measure }: LayoutInput): Page[] {
  const font = findFont(sheet.font)
  const doc = new Doc({
    sheet,
    font,
    metrics: metrics ?? font.ratios,
    measure: measure ?? roughMeasure,
    paper: paperSize(sheet.paper),
    cap: CAP[sheet.size],
  })
  const cap = CAP[sheet.size]
  const words = wordsOf(sheet)
  const layout = findLayout(sheet.layout)

  if (words.length === 0) {
    doc.open(titleOf(sheet, null))
    lined(doc, [], cap, sheet.stroke)
    return doc.pages
  }

  if (layout.perWord) {
    const fill = PER_WORD[layout.id] ?? repeat
    for (const word of words) {
      doc.open(titleOf(sheet, word))
      // A word longer than the line shrinks to fit it; a letter off the page teaches nothing.
      fill(doc, word, doc.fit(word, doc.width, cap), sheet.stroke)
    }
    return doc.pages
  }

  doc.open(titleOf(sheet, null))
  const fill = SHARED[layout.id] ?? list
  fill(doc, words, cap, sheet.stroke)
  return doc.pages
}

export { CAP, TITLE_SIZE }
