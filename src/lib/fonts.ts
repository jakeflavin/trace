/**
 * The hands a worksheet can be written in.
 *
 * Three, on purpose. A print hand for the first letters, a foundation hand with entry and
 * exit strokes for the step before joining, and a joined cursive. Every one is an open
 * font served from the app, so the letters a child traces are the same on every device
 * and no print job needs the network.
 *
 * `ratios` are the fallback shape of each face — how far its tall letters, small letters
 * and tails reach, as a fraction of the font size — used until the browser has loaded the
 * font and `lib/metrics.ts` has measured the real thing. They are close enough that the
 * first frame does not jump.
 */
export type FontId = 'print' | 'foundation' | 'cursive'

export interface FontMetrics {
  /** Height of a tall letter (b, d, l) above the baseline, per unit of font size. */
  ascent: number
  /** Height of a small letter (x, v, w) above the baseline. */
  xHeight: number
  /** Depth of a tail (g, p, y) below the baseline. */
  descent: number
}

export interface Font {
  id: FontId
  label: string
  /** What a parent needs to know to pick it. */
  note: string
  family: string
  weight: number
  /** The heading's weight: a real bold where the face has one, or the same as the body. */
  bold: number
  /** Extra space between letters, per unit of cap height, so traced letters never touch. */
  tracking: number
  ratios: FontMetrics
}

export const FONTS: readonly [Font, ...Font[]] = [
  {
    id: 'print',
    label: 'Print',
    note: 'Plain manuscript letters. The usual first hand.',
    family: 'Andika',
    weight: 400,
    bold: 700,
    tracking: 0.08,
    ratios: { ascent: 0.72, xHeight: 0.52, descent: 0.21 },
  },
  {
    id: 'foundation',
    label: 'Foundation',
    note: 'Print with entry and exit strokes, ready to be joined later.',
    family: 'Edu VIC WA NT Beginner Variable',
    weight: 500,
    bold: 700,
    tracking: 0.05,
    ratios: { ascent: 0.7, xHeight: 0.46, descent: 0.24 },
  },
  {
    id: 'cursive',
    label: 'Cursive',
    note: 'Joined letters. For a child who already prints.',
    family: 'Cedarville Cursive',
    weight: 400,
    bold: 400,
    tracking: 0,
    ratios: { ascent: 0.62, xHeight: 0.34, descent: 0.28 },
  },
]

export function findFont(id: FontId): Font {
  return FONTS.find((font) => font.id === id) ?? FONTS[0]
}

export function isFontId(value: unknown): value is FontId {
  return FONTS.some((font) => font.id === value)
}
