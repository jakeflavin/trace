/**
 * The worksheet: the whole document, and every edit to it as a pure function.
 *
 * A sheet is a list of words and a handful of choices. Which layout is chosen decides
 * whether the words share a page (a list, a sentence, a set of cards) or each get their
 * own (a name to practise, a spelling word), which is how one document is both "my
 * child's name" and "twenty-five names for the class".
 */
import { type FontId, isFontId } from './fonts'
import { type Paper, isPaper } from './paper'

export type LayoutId =
  | 'repeat'
  | 'traceWrite'
  | 'fade'
  | 'lookTraceWrite'
  | 'list'
  | 'letters'
  | 'boxes'
  | 'rainbow'
  | 'sentence'
  | 'cases'
  | 'cards'
  | 'lined'

/** How a letter to be traced is drawn. */
export type Stroke = 'dotted' | 'dashed' | 'grey' | 'hollow'

export type SizeId = 'small' | 'medium' | 'large'

export type LetterCase = 'typed' | 'lower' | 'upper' | 'title'

export type GuideColor = 'classic' | 'grey' | 'black'

export interface Sheet {
  words: string[]
  layout: LayoutId
  font: FontId
  stroke: Stroke
  size: SizeId
  letterCase: LetterCase
  paper: Paper
  guides: GuideColor
  /** The dashed line through the middle of the row. */
  midline: boolean
  /** A line for the tails to reach. */
  descender: boolean
  /** A heading of the page's own; blank means the layout decides. */
  title: string
  /** "Name" and "Date" blanks in the corner. */
  nameLine: boolean
}

export interface Layout {
  id: LayoutId
  label: string
  /** One line for the picker. */
  note: string
  /** One page per word, or all the words on the same pages. */
  perWord: boolean
}

export const LAYOUTS: readonly [Layout, ...Layout[]] = [
  {
    id: 'repeat',
    label: 'Trace the word',
    note: 'The word over and over, every line. The classic.',
    perWord: true,
  },
  {
    id: 'traceWrite',
    label: 'Trace, then write',
    note: 'Trace it on the left, write it alone on the right.',
    perWord: true,
  },
  {
    id: 'fade',
    label: 'Fade away',
    note: 'Solid, then grey, then dotted, then nothing.',
    perWord: true,
  },
  {
    id: 'lookTraceWrite',
    label: 'Look, trace, write',
    note: 'A big model, a grey row, a dotted row, then lines of your own.',
    perWord: true,
  },
  {
    id: 'letters',
    label: 'Letter by letter',
    note: 'A line for each letter, then the whole word.',
    perWord: true,
  },
  {
    id: 'boxes',
    label: 'Letter boxes',
    note: 'One letter per box, for spacing and size.',
    perWord: true,
  },
  {
    id: 'cases',
    label: 'Big and small',
    note: 'CAPITALS on one line, lower case on the next.',
    perWord: true,
  },
  {
    id: 'rainbow',
    label: 'Rainbow writing',
    note: 'Huge hollow letters to trace in every colour.',
    perWord: true,
  },
  {
    id: 'list',
    label: 'Word list',
    note: 'Each word on its own line, a model then copies.',
    perWord: false,
  },
  {
    id: 'sentence',
    label: 'Sentences',
    note: 'Trace a line, then copy it on the blank line below.',
    perWord: false,
  },
  {
    id: 'cards',
    label: 'Flash cards',
    note: 'Eight cards a page, to cut out.',
    perWord: false,
  },
  {
    id: 'lined',
    label: 'Lined paper',
    note: 'A model at the top, then empty lines.',
    perWord: false,
  },
]

export function findLayout(id: LayoutId): Layout {
  return LAYOUTS.find((layout) => layout.id === id) ?? LAYOUTS[0]
}

export function isLayoutId(value: unknown): value is LayoutId {
  return LAYOUTS.some((layout) => layout.id === value)
}

export const STROKES: readonly Stroke[] = ['dotted', 'dashed', 'grey', 'hollow']
export const SIZES: readonly SizeId[] = ['small', 'medium', 'large']
export const CASES: readonly LetterCase[] = ['typed', 'lower', 'upper', 'title']
export const GUIDE_COLORS: readonly GuideColor[] = ['classic', 'grey', 'black']

export const LIMITS = {
  /** A class list, twice over. Past this the preview stops being a preview. */
  words: 100,
  word: 60,
  title: 60,
} as const

export const DEFAULT_SHEET: Sheet = {
  words: ['Ada'],
  layout: 'repeat',
  font: 'print',
  stroke: 'dotted',
  size: 'large',
  letterCase: 'typed',
  paper: 'letter',
  guides: 'classic',
  midline: true,
  descender: false,
  title: '',
  nameLine: true,
}

/** One entry per line; a single line of commas is a list too, because that is how one is pasted. */
export function parseWords(raw: string): string[] {
  const lines = raw.split(/\r?\n|\t/)
  const parts = lines.length === 1 && raw.includes(',') ? raw.split(',') : lines
  const seen = new Set<string>()
  const words: string[] = []
  for (const part of parts) {
    const word = part.replace(/\s+/g, ' ').trim().slice(0, LIMITS.word)
    if (!word || seen.has(word)) continue
    seen.add(word)
    words.push(word)
    if (words.length >= LIMITS.words) break
  }
  return words
}

export function setWords(sheet: Sheet, words: string[]): Sheet {
  return { ...sheet, words: words.slice(0, LIMITS.words) }
}

export function addWords(sheet: Sheet, raw: string): Sheet {
  return setWords(sheet, parseWords([...sheet.words, raw].join('\n')))
}

export function removeWord(sheet: Sheet, index: number): Sheet {
  return { ...sheet, words: sheet.words.filter((_, i) => i !== index) }
}

export function setLayout(sheet: Sheet, layout: LayoutId): Sheet {
  return { ...sheet, layout }
}

export function setOption<K extends keyof Sheet>(sheet: Sheet, key: K, value: Sheet[K]): Sheet {
  return { ...sheet, [key]: value }
}

/** The word as it will be written, after the case choice. */
export function applyCase(word: string, letterCase: LetterCase): string {
  switch (letterCase) {
    case 'lower':
      return word.toLocaleLowerCase()
    case 'upper':
      return word.toLocaleUpperCase()
    case 'title':
      return word
        .toLocaleLowerCase()
        .replace(/(^|\s)(\S)/g, (_, gap: string, first: string) => gap + first.toLocaleUpperCase())
    default:
      return word
  }
}

/** The words that reach the page, cased, with the blanks gone. */
export function wordsOf(sheet: Sheet): string[] {
  return sheet.words.map((word) => applyCase(word, sheet.letterCase)).filter(Boolean)
}

/** What the heading says when the parent has not said. */
export function titleOf(sheet: Sheet, word: string | null): string {
  if (sheet.title.trim()) return sheet.title.trim()
  if (findLayout(sheet.layout).perWord && word) return word
  const first = wordsOf(sheet)[0]
  return sheet.layout === 'sentence' ? 'Copy the sentence' : first ? 'Handwriting' : 'Handwriting'
}

/** Sanitise a sheet read from storage or anywhere else that cannot be trusted. */
export function sanitizeSheet(value: unknown): Sheet {
  const raw = typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {}
  const has = <T>(list: readonly T[], entry: unknown): entry is T => list.some((e) => e === entry)
  return {
    words: Array.isArray(raw.words)
      ? parseWords(raw.words.filter((w): w is string => typeof w === 'string').join('\n'))
      : DEFAULT_SHEET.words,
    layout: isLayoutId(raw.layout) ? raw.layout : DEFAULT_SHEET.layout,
    font: isFontId(raw.font) ? raw.font : DEFAULT_SHEET.font,
    stroke: has(STROKES, raw.stroke) ? raw.stroke : DEFAULT_SHEET.stroke,
    size: has(SIZES, raw.size) ? raw.size : DEFAULT_SHEET.size,
    letterCase: has(CASES, raw.letterCase) ? raw.letterCase : DEFAULT_SHEET.letterCase,
    paper: isPaper(raw.paper) ? raw.paper : DEFAULT_SHEET.paper,
    guides: has(GUIDE_COLORS, raw.guides) ? raw.guides : DEFAULT_SHEET.guides,
    midline: typeof raw.midline === 'boolean' ? raw.midline : DEFAULT_SHEET.midline,
    descender: typeof raw.descender === 'boolean' ? raw.descender : DEFAULT_SHEET.descender,
    title: typeof raw.title === 'string' ? raw.title.slice(0, LIMITS.title) : '',
    nameLine: typeof raw.nameLine === 'boolean' ? raw.nameLine : DEFAULT_SHEET.nameLine,
  }
}
