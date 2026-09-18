import { describe, expect, it } from 'vitest'
import { layoutSheet, type Page } from './layout'
import { DEFAULT_SHEET, LAYOUTS, type Sheet } from './sheet'

const sheet = (over: Partial<Sheet> = {}): Sheet => ({ ...DEFAULT_SHEET, ...over })

const traced = (page: Page) => page.runs.filter((run) => run.style !== 'ink')

describe('every layout', () => {
  it.each(LAYOUTS.map((l) => l.id))('%s makes at least one page with something on it', (layout) => {
    const pages = layoutSheet({ sheet: sheet({ layout, words: ['Ada', 'Bea'] }) })
    expect(pages.length).toBeGreaterThan(0)
    for (const page of pages) expect(page.lines.length).toBeGreaterThan(0)
  })

  it.each(LAYOUTS.map((l) => l.id))('%s keeps every mark inside the page', (layout) => {
    const pages = layoutSheet({ sheet: sheet({ layout, words: ['Alexandria', 'Bo'] }) })
    for (const page of pages) {
      for (const line of page.lines) {
        expect(line.x1).toBeGreaterThanOrEqual(0)
        expect(line.x2).toBeLessThanOrEqual(page.width)
        expect(line.y1).toBeGreaterThanOrEqual(0)
        expect(line.y2).toBeLessThanOrEqual(page.height)
      }
      for (const run of page.runs) {
        expect(run.x).toBeGreaterThanOrEqual(0)
        expect(run.y).toBeLessThanOrEqual(page.height)
      }
    }
  })
})

describe('pages per word', () => {
  it('gives each word its own page for a per-word layout', () => {
    const pages = layoutSheet({ sheet: sheet({ layout: 'repeat', words: ['Ada', 'Bea', 'Cy'] }) })
    expect(pages.map((p) => p.title)).toEqual(['Ada', 'Bea', 'Cy'])
  })

  it('puts a list on shared pages and spills onto more', () => {
    const words = Array.from({ length: 30 }, (_, i) => `word${i}`)
    const pages = layoutSheet({ sheet: sheet({ layout: 'list', words, size: 'large' }) })
    expect(pages.length).toBeGreaterThan(1)
    const models = pages.flatMap((p) => p.runs.filter((r) => r.style === 'ink' && r.size > 20))
    expect(models.map((r) => r.text)).toEqual(words)
  })

  it('prints lined paper when there are no words', () => {
    const pages = layoutSheet({ sheet: sheet({ words: [] }) })
    expect(pages).toHaveLength(1)
    expect(pages[0]?.runs.filter((r) => r.size > 20)).toHaveLength(0)
    expect(pages[0]?.lines.filter((l) => l.kind === 'base').length).toBeGreaterThan(5)
  })
})

describe('the rows', () => {
  it('puts a tall letter exactly on the top line', () => {
    const [page] = layoutSheet({ sheet: sheet({ layout: 'repeat', words: ['l'], size: 'large' }) })
    const run = page?.runs.find((r) => r.text === 'l')
    const top = page?.lines.find((l) => l.kind === 'top')
    expect(run && top && run.y - top.y1).toBeCloseTo(70)
  })

  it('draws the midline at the font’s x-height and omits it when asked', () => {
    const on = layoutSheet({ sheet: sheet({ midline: true }) })[0]
    const off = layoutSheet({ sheet: sheet({ midline: false }) })[0]
    expect(on?.lines.some((l) => l.kind === 'mid')).toBe(true)
    expect(off?.lines.some((l) => l.kind === 'mid')).toBe(false)
  })

  it('fades from a model to nothing', () => {
    const [page] = layoutSheet({ sheet: sheet({ layout: 'fade', words: ['sun'], size: 'large' }) })
    const big = page!.runs.filter((r) => r.size > 20)
    const rows = [...new Set(big.map((r) => r.y))].sort((a, b) => a - b)
    const styleAt = (y: number) => big.find((r) => r.y === y)?.style
    expect(styleAt(rows[0]!)).toBe('ink')
    expect(styleAt(rows[1]!)).toBe('grey')
    expect(styleAt(rows[2]!)).toBe('dotted')
    // The fourth row is blank, so the next row with a word on it starts the cycle again.
    expect(styleAt(rows[3]!)).toBe('ink')
    expect(rows[3]! - rows[2]!).toBeGreaterThan((rows[2]! - rows[1]!) * 1.5)
  })

  it('leaves the right half empty for trace-then-write', () => {
    const [page] = layoutSheet({ sheet: sheet({ layout: 'traceWrite', words: ['Ada'] }) })
    const half = page!.width / 2
    for (const run of traced(page!)) expect(run.x).toBeLessThan(half)
  })

  it('spells the word out letter by letter first', () => {
    const [page] = layoutSheet({ sheet: sheet({ layout: 'letters', words: ['cat'] }) })
    const rows = [...new Set(traced(page!).map((r) => r.y))].sort((a, b) => a - b)
    const first = (y: number) => traced(page!).find((r) => r.y === y)?.text
    expect(rows.slice(0, 4).map(first)).toEqual(['c', 'a', 't', 'cat'])
  })

  it('wraps a sentence and pairs each line with a blank one', () => {
    const long = 'the quick brown fox jumps over the lazy dog again and again and again'
    const pages = layoutSheet({ sheet: sheet({ layout: 'sentence', words: [long] }) })
    const runs = pages.flatMap(traced)
    expect(runs.length).toBeGreaterThan(1)
    expect(runs.map((r) => r.text).join(' ')).toBe(long)
    const bases = pages.flatMap((p) => p.lines.filter((l) => l.kind === 'base'))
    expect(bases.length).toBeGreaterThanOrEqual(runs.length * 2)
  })

  it('fills eight cards a page, cycling short lists', () => {
    const [page] = layoutSheet({ sheet: sheet({ layout: 'cards', words: ['a', 'b', 'c'] }) })
    expect(page!.boxes.filter((b) => b.kind === 'card')).toHaveLength(8)
    expect(traced(page!).map((r) => r.text)).toEqual(['a', 'b', 'c', 'a', 'b', 'c', 'a', 'b'])
  })

  it('boxes every letter and skips a box for a space', () => {
    const [page] = layoutSheet({ sheet: sheet({ layout: 'boxes', words: ['a b'] }) })
    const firstRow = page!.boxes.filter((b) => b.y === page!.boxes[0]?.y)
    expect(firstRow).toHaveLength(2)
  })

  it('shrinks rainbow letters until the word fits the page', () => {
    const [page] = layoutSheet({
      sheet: sheet({ layout: 'rainbow', words: ['Maximilianus Longname'] }),
    })
    const run = traced(page!)[0]!
    expect(run.x + run.text.length * run.size * 0.55).toBeLessThanOrEqual(page!.width)
  })

  it('shrinks a word that would not fit the line, in every layout', () => {
    const long = 'Wolfeschlegelsteinhausen'
    for (const layout of LAYOUTS) {
      const pages = layoutSheet({ sheet: sheet({ layout: layout.id, words: [long] }) })
      for (const page of pages) {
        for (const run of page.runs) {
          const right = run.x + run.text.length * run.size * 0.55 + run.spacing * run.text.length
          expect(right, layout.id).toBeLessThanOrEqual(page.width + 1)
        }
        for (const box of page.boxes)
          expect(box.x + box.w, layout.id).toBeLessThanOrEqual(page.width + 1)
      }
    }
  })

  it('cases the word before it reaches the page', () => {
    const [page] = layoutSheet({ sheet: sheet({ words: ['ada lovelace'], letterCase: 'title' }) })
    expect(page!.title).toBe('Ada Lovelace')
  })
})
